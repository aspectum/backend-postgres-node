const express = require('express')
const knex = require('knex')

const accessControl =  require('./controllers/accessControl');
const empresas =  require('./controllers/empresas');

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
// Access control
app.post('/registro', accessControl.validateRequest('register'), accessControl.register(db));
app.post('/login', accessControl.validateRequest('login'), accessControl.login(db));
app.post('/logout', accessControl.validateAuth, accessControl.logout(db));

// Empresas
app.get('/empresas', accessControl.validateAuth, empresas.list(db));

app.listen(port, () => {
    console.log(`running on port ${port}`);
})