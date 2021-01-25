const express = require('express')
const knex = require('knex')

const accessControl =  require('./controllers/accessControl');
// const empresas =  require('./controllers/empresas');
const EmpresasController =  require('./controllers/empresas');
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

const empresas = new EmpresasController(db);

// ENDPOINTS
// Access control
app.post('/registro', accessControl.validateRequest('register'), accessControl.register(db));
app.post('/login', accessControl.validateRequest('login'), accessControl.login(db));
app.post('/logout', accessControl.validateAuth, accessControl.logout(db));

// Empresas
app.get('/empresas', accessControl.validateAuth, empresas.list);
app.post('/empresas', accessControl.validateAuth, empresas.validateRequest, empresas.create);
app.put('/empresas/:empresa_id', accessControl.validateAuth, empresas.validateOwner, empresas.validateRequest, empresas.update);
app.delete('/empresas/:empresa_id', accessControl.validateAuth, empresas.validateOwner, empresas.remove);

// Sedes
app.get('/sedes/:empresa_id', accessControl.validateAuth, empresas.validateOwner, sedes.list(db));
app.post('/sedes/:empresa_id', accessControl.validateAuth, empresas.validateOwner, sedes.validateRequest, sedes.create(db));
app.put('/sedes/:empresa_id/:sede_id', accessControl.validateAuth, empresas.validateOwner, sedes.validateRequest, sedes.update(db));
app.delete('/sedes/:empresa_id/:sede_id', accessControl.validateAuth, empresas.validateOwner, sedes.remove(db));

// Usuarios
app.get('/usuarios/:empresa_id', accessControl.validateAuth, empresas.validateOwner, usuarios.list(db));
app.post('/usuarios/:empresa_id', accessControl.validateAuth, empresas.validateOwner, accessControl.validateRequest('create'), usuarios.create(db)); // Using accessControl.validateRequest (?)
app.put('/usuarios/:empresa_id/:usuario_id', accessControl.validateAuth, empresas.validateOwner, accessControl.validateRequest('update'), usuarios.update(db)); // not validating request
app.delete('/usuarios/:empresa_id/:usuario_id', accessControl.validateAuth, empresas.validateOwner, usuarios.remove(db));


app.listen(port, () => {
    console.log(`running on port ${port}`);
})