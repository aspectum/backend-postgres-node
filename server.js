const express = require('express')
const knex = require('knex')

const accessControl =  require('./controllers/accessControl');
const empresas =  require('./controllers/empresas');
const sedes =  require('./controllers/sedes');
const usuarios =  require('./controllers/usuarios');

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
app.post('/empresas', accessControl.validateAuth, empresas.validateRequest('create'), empresas.create(db));
app.put('/empresas/:empresa_id', accessControl.validateAuth, empresas.validateOwner(db), empresas.validateRequest('update'), empresas.update(db)); // Not sure how to validate this
app.delete('/empresas/:empresa_id', accessControl.validateAuth, empresas.validateOwner(db), empresas.remove(db));

// Sedes
app.get('/sedes/:empresa_id', accessControl.validateAuth, empresas.validateOwner(db), sedes.list(db));
app.post('/sedes/:empresa_id', accessControl.validateAuth, empresas.validateOwner(db), sedes.validateRequest('create'), sedes.create(db));
app.put('/sedes/:empresa_id/:sede_id', accessControl.validateAuth, empresas.validateOwner(db), sedes.validateRequest('update'), sedes.update(db));
app.delete('/sedes/:empresa_id/:sede_id', accessControl.validateAuth, empresas.validateOwner(db), sedes.remove(db));

// Usuarios
app.get('/usuarios/:empresa_id', accessControl.validateAuth, empresas.validateOwner(db), usuarios.list(db));
app.post('/usuarios/:empresa_id', accessControl.validateAuth, empresas.validateOwner(db), accessControl.validateRequest('register'), usuarios.create(db)); // Using accessControl.validateRequest (?)
app.put('/usuarios/:empresa_id/:usuario_id', accessControl.validateAuth, empresas.validateOwner(db), usuarios.update(db)); // not validating request


app.listen(port, () => {
    console.log(`running on port ${port}`);
})