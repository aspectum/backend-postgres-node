const express = require('express')
const knex = require('knex')

const accessControl =  require('./controllers/accessControl');

const app = express();
const port = 3000;

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

app.post('/registro', accessControl.validateRequest('register'), accessControl.register(db))
app.post('/login', accessControl.validateRequest('login'), accessControl.login(db))

app.listen(port, () => {
    console.log(`running on port ${port}`);
})