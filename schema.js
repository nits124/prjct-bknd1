const Joi = require("joi");//instal---npm i joi
// Joi is a data validation library used in Node.js applications to validate user input before storing it in a database. It ensures that incoming data follows a specific structure, format, and constraints.

module.exports.listingSchema= Joi.object({
    listing : Joi.object({
        title : Joi.string().required(),//title	Must be a string and required.
        description : Joi.string().required(),
        location : Joi.string().required(),
        country : Joi.string().required(),
        price : Joi.number().required().min(0),
        image : Joi.string().allow("",null)
    }).required()
});
module.exports.reviewSchema= Joi.object({
    review:Joi.object({
        rating: Joi.number().required().min(1).max(4),
        comment:Joi.string().required(),
    }).required,
}); 