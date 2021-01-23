const bcrypt = require('bcrypt'); // should I put this in main file?
const jwt = require('jsonwebtoken');

const saltRounds = 10;
const secret_key = 'canIPutAnythingHere'; // ????

// Middleware to validate request
const validateRequest = (type) => (req, res, next) => {
    let isValid = true;

    if (!req.body.email) isValid = false;
    if (!req.body.password) isValid = false;
    if (type === 'register') if (!req.body.nome) isValid = false; // This way to prevent trying to access body.nome when it doesn't exist
    // Validate email

    if (isValid) {
        next()
    }
    else {
        console.log('ERROR: body incomplete')
        return res.status(400).send({
            success: false,
            data: null
        });
    }
}

// Middleware to validate authentication token
// If I implement blacklisting, I'll check that here
const validateAuth = (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        console.log('ERROR: no authorization header')
        return res.status(401).send({
            success: false,
            data: null
        });
    }

    const token = authorization.split(' ')[1];

    jwt.verify(token, secret_key, (err, data) => {
        if (err) {
            console.log(err)
            return res.status(403).send({
                success: false,
                data: null
            });
        }
        req.authData = {
            token,
            id: data.id
        };
        next();
    });
}

// Handles registration
// DB will throw error if email is not unique
// so no need to check that previously
const register = (db) => (req, res) => {

    const { nome, email, password } = req.body;

    const hash = bcrypt.hashSync(password, saltRounds);

    db.insert({
        nome: nome,
        email: email,
        password: hash
    })
        .into('usuarios').returning('id', 'nome', 'email')
        .then(data => {
            user = data[0];
            console.log(user);
            res.status(200).send({
                success: true,
                data: user
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

    const { email, password } = req.body;

    db.select('id', 'email', 'password').from('usuarios').where('email', '=', email)
        .then(data => {
            const isValid = bcrypt.compareSync(password, data[0].password);

            if (isValid) {
                token = authenticate(data[0].id);

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


// Handles logout
const logout = (db) => (req, res) => {
    const { token  } = req.authData;

    db.from('tokens').where('token', '=', token).del()
        .then(data => {
            console.log(data);
            res.status(200).send({
                success: true,
                data: null,
            });
        })
        .catch(err => {
            console.log(err);
            res.status(400).send({
                success: false,
                data: null,
            });
        })
}

module.exports = {
    validateRequest,
    validateAuth,
    register,
    login,
    logout
}