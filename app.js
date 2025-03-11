const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
// ejs-mate is an extension for EJS (Embedded JavaScript) templates. It provides additional features, such as layout support, partials, and template inheritance, making EJS work more like templating engines such as Handlebars or Pug.
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js")

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}
app.engine("ejs", ejsMate);//No, if you do not use:If you run the app without requiring ejs-mate, you'll get an error like:
// ReferenceError: ejsMate is not defined
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// If you remove only app.engine('ejs', ejsMate);, your app can still use regular EJS (without layouts and inheritance) like this:app.set('view engine', 'ejs'); 
// app.set('views', __dirname + '/views'); 
// This will work, but you will lose ejs-mate features like layouts and template inheritance.

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);//validates the request body against the reviewSchema (which is assumed to be defined elsewhere using Joi or another validation library).
  // validate() returns an object containing:
  // error: If validation fails, this contains details of the validation errors.

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
//     error.details contains an array of error objects, each describing a validation issue.
// .map((el) => el.message) extracts the error messages from each error object.
// .join(",") joins multiple error messages into a single string, separated by commas.ex--"rating must be less than or equal to 5, comment length must be at least 10 characters"

    throw new ExpressError(400, errMsg);
  } else {
    next();
//     If there are no validation errors, the function calls next().
// next() passes the request to the next middleware or route handler.
  }
};

//Index Route
app.get("/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    // Listing is a Mongoose model representing a MongoDB collection
    // to  retrieve all documents from the Listing collection.
    res.render("listings/index.ejs", { allListings });//allListings, which will be an array containing all listings from the database.
  })
);

//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");//searches the listings collection for a document where _id matches id.
//     "reviews" is assumed to be a reference field in the Listing schema.
//     .populate("reviews") replaces the reviews field (which originally contains only ObjectIds) with the actual review documents from the reviews collection.
//     This allows us to access full review details in the retrieved listing.

//     Without .populate("reviews")
//     {
//       "_id": "abc123",
//       "title": "Luxury Apartment",
//       "price": 200,
//       "location": "New York",
//       "reviews": ["xyz789", "pqr456"] // Only ObjectIds

//       With .populate("reviews")
// {
//   "_id": "abc123",
//   "title": "Luxury Apartment",
//   "price": 200,
//   "location": "New York",
//   "reviews": [
//     {
//       "_id": "xyz789",
//       "text": "Great place to stay!",
//       "rating": 5
//     },
//     {
//       "_id": "pqr456",
//       "text": "Very comfortable and clean.",
//       "rating": 4
//     }
//   ]

    res.render("listings/show.ejs", { listing });
  })
);

//Create Route
// app.post---It is triggered when the client sends data to create a new listing.
app.post("/listings", validateListing,
  wrapAsync(async (req, res, next) => {
    //validateListing,This middleware function validates the incoming request data before executing the main route handler.
//Uses middleware functions (validateListing and wrapAsync) to validate and handle errors.
    const newListing = new Listing(req.body.listing);
    // This line creates a new instance of the Listing model using the data sent in the request body
    // req.body is the parsed JSON data sent by the client in a POST request.
    // req.body.listing contains the listing data submitted in the request.
    await newListing.save();//.save() is a Mongoose method that inserts the document into the database.
    res.redirect("/listings");
  })
);

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//Update Route 
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });//The { ...req.body.listing } syntax spreads the properties of req.body.listing into a new object. This ensures only the fields inside listing are used for updating the database.
  res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
}));

//reviews post route
app.post("/listings/:id/reviews", wrapAsync(async (req, res) => {//validateReview ,    53prj validation
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  listing.reviews.push(newReview);//newReview is a newly created review document.
//   Pushes the newReview object (or its _id) into the reviews array of listing.
// Does not save the change to the database yet. You must call .save() after pushing

  await newReview.save();
  await listing.save();
  res.redirect(`/listings/${listing._id}`);
}));

//delete review route
app.delete("/listings/:id/reviews/:reviewId", 
  wrapAsync(async (req,res)=>{
    let {id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, { $pull:{reviews: reviewId}});
    //$pull is a MongoDB operator that removes a specific value from an array.
    //first it pull review data then remove it after delete button
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`)
  })
)
// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.se9nd("successful testing");
// });9

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "page not found"));
});
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
