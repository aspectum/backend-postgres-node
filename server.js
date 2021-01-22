const express = require('express')
const knex = require('knex')
const jwt = require('jsonwebtoken');

const accessControl =  require('./controllers/accessControl');

const app = express();
const port = 3000;
const secret_key = 'canIPutAnythingHere';

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

// ENDPOINTS

app.post('/registro', accessControl.register(db))

app.listen(port, () => {
    console.log(`running on port ${port}`);
})