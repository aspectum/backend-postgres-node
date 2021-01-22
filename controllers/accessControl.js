const bcrypt = require('bcrypt'); // should I put this in main file?

const saltRounds = 10;

// Handles registration
// DB will throw error if email is not unique
// so no need to check that previously
const register = (db) => (req, res) => {
    const { nome, email, password } = req.body;
    // Validating request
    if (!nome || !email || !password) {
        return res.sendStatus(400);  // Maybe additional message
    }
    // Validate email ??

    const hash = bcrypt.hashSync(password, saltRounds);

    db.insert({
        nome: nome,
        email: email,
        password: hash
    })
        .into('usuarios')   // returning?
        .returning('*')
        .then(data => {
            user = data[0];
            console.log(user);
            res.status(200).send({
                success: true,
                data: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(400).send({
                success: false,
                data: null
            });
        })
}

module.exports = {
    register: register
};