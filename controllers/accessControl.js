const bcrypt = require('bcrypt'); // should I put this in main file?
const jwt = require('jsonwebtoken');

const saltRounds = 10;
const secret_key = 'canIPutAnythingHere'; // ????

// Validates request
const isRequestValid = (body, type) => {
    if (!body.email) return false;
    if (!body.password) return false;
    if (type === 'register') if (!body.nome) return false; // This way to prevent trying to access body.nome when it doesn't exist
    // Validate email

    return true;
}

// Handles registration
// DB will throw error if email is not unique
// so no need to check that previously
const register = (db) => (req, res) => {
    if (!isRequestValid(req.body, 'register')) {
        console.log('ERROR: body incomplete')
        return res.status(400).send({
            success: false,
            data: null
        });
    }

    const { nome, email, password } = req.body;

    const hash = bcrypt.hashSync(password, saltRounds);

    db.insert({
        nome: nome,
        email: email,
        password: hash
    })
        .into('usuarios').returning('*')
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


// Handles authentication
// Should I insert into DB here? Then I would have to pass db...
const authenticate = (id) => {
    return jwt.sign({ id }, secret_key);
}


// Handles login
const login = (db) => (req, res) => {
    if (!isRequestValid(req.body, 'login')) {
        console.log('ERROR: body incomplete')
        return res.status(400).send({
            success: false,
            data: null
        });
    }

    const { email, password } = req.body;

    db.select('id', 'email', 'password').from('usuarios').where('email', '=', email)
        .then(data => {
            const isValid = bcrypt.compareSync(password, data[0].password);

            if (isValid) {
                token = authenticate(data[0].id);
                console.log('TOKEN ', data[0].id, token)

                db.insert({
                    token,
                    usuario_id: data[0].id
                })
                    .into('tokens').returning('*')
                    .then(data => {
                        console.log(data[0]);
                        res.status(200).send({
                            success: true,
                            data: null,
                            token: data[0].token
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
            else {
                console.log('ERROR: wrong credentials')
                return res.status(400).send({
                    success: false,
                    data: null
                });
            }
        })
        .catch(err => {
            console.log(err) // Probably user doesn't exist
            return res.status(400).send({
                success: false,
                data: null
            });
        })

}

module.exports = {
    register,
    login
}