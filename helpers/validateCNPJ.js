// http://www.macoratti.net/alg_cnpj.htm
function validateCNPJ(cnpj) {
    const key = [6,5,4,3,2,9,8,7,6,5,4,3,2];

    const full_digits = cnpj.replace(/[^\d]+/g,'');

    if (full_digits.length != 14) return false;

    let digits = [...full_digits.substr(0, 12)].map(n => +n); // first string to array of chars then to array of ints
    const verif = [...full_digits.substr(12, 2)].map(n => +n);
    
    // Calculating 1st verifying digit
    let sum = digits.reduce((acc, curr, i) => {
        return acc + curr * key[i+1]
    }, 0);

    let rem = sum % 11;
    let v1;
    (rem < 2) ? v1 = 0 : v1 = 11 - rem;

    if (v1 !== verif[0]) return false;

    // Calculating 2nd verifying digit
    digits.push(v1)

    sum = digits.reduce((acc, curr, i) => {
        return acc + curr * key[i]
    }, 0);

    rem = sum % 11;
    let v2;
    (rem < 2) ? v2 = 0 : v2 = 11 - rem;

    if (v2 !== verif[1]) return false;

    return true;

}

module.exports = {
    validateCNPJ
}