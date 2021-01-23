// https://stackoverflow.com/a/48800
//  +1 as sending email and seeing what happens is the only real sure way to validate an email address ,
// theres no need to do more than a simple regex match. – kommradHomer Jul 19 '12 at 7:14
// I think that makes more sense, especially after seeing the other regex

function validateEmail(email) {
    const re = /^\S+@\S+\.\S+$/;
    return re.test(email);
}

module.exports = {
    validateEmail
}