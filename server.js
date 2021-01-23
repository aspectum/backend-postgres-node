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
app.post('/empresas', accessControl.validateAuth, empresas.validateRequest, empresas.create(db));
app.put('/empresas/:empresa_id', accessControl.validateAuth, empresas.validateOwner(db), empresas.validateRequest, empresas.update(db));
app.delete('/empresas/:empresa_id', accessControl.validateAuth, empresas.validateOwner(db), empresas.remove(db));

// Sedes
app.get('/sedes/:empresa_id', accessControl.validateAuth, empresas.validateOwner(db), sedes.list(db));
app.post('/sedes/:empresa_id', accessControl.validateAuth, empresas.validateOwner(db), sedes.validateRequest, sedes.create(db));
app.put('/sedes/:empresa_id/:sede_id', accessControl.validateAuth, empresas.validateOwner(db), sedes.validateRequest, sedes.update(db));
app.delete('/sedes/:empresa_id/:sede_id', accessControl.validateAuth, empresas.validateOwner(db), sedes.remove(db));

// Usuarios
app.get('/usuarios/:empresa_id', accessControl.validateAuth, empresas.validateOwner(db), usuarios.list(db));
app.post('/usuarios/:empresa_id', accessControl.validateAuth, empresas.validateOwner(db), accessControl.validateRequest('create'), usuarios.create(db)); // Using accessControl.validateRequest (?)
app.put('/usuarios/:empresa_id/:usuario_id', accessControl.validateAuth, empresas.validateOwner(db), accessControl.validateRequest('update'), usuarios.update(db)); // not validating request
app.delete('/usuarios/:empresa_id/:usuario_id', accessControl.validateAuth, empresas.validateOwner(db), usuarios.remove(db));


app.listen(port, () => {
    console.log(`running on port ${port}`);
})