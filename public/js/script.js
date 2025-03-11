// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  //(() => { ... })();?
// This is an Immediately Invoked Function Expression (IIFE).
// It runs automatically when the script is loaded.
  'use strict'
  //Enforces strict mode, which helps catch common coding mistakes.Prevents using undeclared variables.

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation');//selects all forms with the class .needs-validation.

  // Loop over them and prevent submission
//   Array.from(forms) converts the NodeList (returned by querySelectorAll) into a real array.
// .forEach(form => { ... }) iterates over each form.
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {//Listens for the submit event on each form.
      if (!form.checkValidity()) {
//         form.checkValidity() checks if the form is valid.
// If not valid, it:
// Calls event.preventDefault(); → Prevents form submission.
// Calls event.stopPropagation(); → Stops the event from bubbling up
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add('was-validated');
    }, false);// applies Bootstrap's validation styling to the form after submission. form.classList.add('was-validated') dynamically adds the class "was-validated" to the form.
    // In Bootstrap, .was-validated triggers validation styles for form elements.
    // User submits with valid inputs ✅	Form submits successfully
// User submits with invalid inputs ❌	Form does NOT submit, and Bootstrap shows validation errors
  });
})();