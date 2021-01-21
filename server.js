const express = require('express')
const knex = require('knex')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;
const secret_key = 'canIPutAnythingHere';
const saltRounds = 10;
const correctPassword = 'pass123';
const hash = bcrypt.hashSync(correctPassword, saltRounds);

app.use(express.json());

const db = knex({
    client: 'pg',
    connection: {
      host : 'localhost',
      user : 'postgres',
      password : 'root',    // Should I use env variables or it doesn't matter because it's the backend?
      database : 'db'
    }
});

app.get('/', verifyToken, (req, res) => {
    jwt.verify(req.token, secret_key, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        }
        else {
            db.select('*').from('usuarios')
                .then(data => {
                    res.json(data)
                })
        }
    })

})

app.post('/login', (req, res) => {
    const test_user = {
        id:1,
        username: 'test',
    }

    bcrypt.compare(req.body.password, hash)
        .then(function(result) {
            if (result === true) {
                jwt.sign({ test_user }, secret_key, (err, token) => { // check if err?
                    res.json({ token })
                });
            }
            else {
                res.sendStatus(403)
            }
        })
        .catch(err => {
            console.log('ERROR ', err.message)
            res.sendStatus(400)
        })

})

app.post('/logout', (req, res) => {
    const test_user = {
        id:1,
        username: 'test',
    }

    jwt.sign({ test_user }, secret_key, (err, token) => { // check if err?
        res.json({ token })
    });
})

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (typeof authHeader !== 'undefined') {
        const token = authHeader.split(' ')[1];
        req.token = token;
        next();
    }
    else {
        res.sendStatus(403);
    }
}

app.listen(port, () => {
    console.log(`running on port ${port}`);
})