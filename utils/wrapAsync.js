module.exports=(fn)=>{
    return (req,res,next)=>{
        fn(req,res,next).catch(next);
    };
};
//It takes an async function fn as input.
// Returns a new function that wraps fn.
// If fn throws an error (because of a rejected Promise), .catch(next) ensures the error is passed to Express's default error handler.
// No need for try-catch.
// Automatically catches errors and passes them to next().

// Without This Wrapper (Repetitive try-catch)
// app.get('/example', async (req, res, next) => {
//     try {
//         let data = await someAsyncFunction();
//         res.json(data);
//     } catch (err) {
//         next(err); // Manually pass error to Express
//     }
// });
// Every route handler needs a try-catch block.
// If you forget to catch an error, your server may crash.