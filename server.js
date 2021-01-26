const express = require('express')
const knex = require('knex')

const AccessController =  require('./controllers/accessControl');
const EmpresasController = require('./controllers/empresas');
const SedesController = require('./controllers/sedes');
const UsuariosController = require('./controllers/usuarios');

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
const sedes = new SedesController(db);
const usuarios = new UsuariosController(db);
const accessControl = new AccessController(db, usuarios);

// ENDPOINTS
// Access control
app.post('/registro', usuarios.validateRequest('register'), usuarios.registerOwner);
app.post('/login', usuarios.validateRequest('login'), accessControl.login);
app.post('/logout', accessControl.validateAuth, accessControl.logout);

// Empresas
app.get('/empresas', accessControl.validateAuth, empresas.list);
app.post('/empresas', accessControl.validateAuth, empresas.validateRequest, empresas.create);
app.put('/empresas/:empresa_id', accessControl.validateAuth, empresas.validateOwner, empresas.validateRequest, empresas.update);
app.delete('/empresas/:empresa_id', accessControl.validateAuth, empresas.validateOwner, empresas.remove);

// Sedes
app.get('/sedes/:empresa_id', accessControl.validateAuth, empresas.validateOwner, sedes.list);
app.post('/sedes/:empresa_id', accessControl.validateAuth, empresas.validateOwner, sedes.validateRequest, sedes.create);
app.put('/sedes/:empresa_id/:sede_id', accessControl.validateAuth, empresas.validateOwner, sedes.validateRequest, sedes.update);
app.delete('/sedes/:empresa_id/:sede_id', accessControl.validateAuth, empresas.validateOwner, sedes.remove);

// Usuarios
app.get('/usuarios/:empresa_id', accessControl.validateAuth, empresas.validateOwner, usuarios.list);
app.post('/usuarios/:empresa_id', accessControl.validateAuth, empresas.validateOwner, usuarios.validateRequest('create'), usuarios.create);
app.put('/usuarios/:empresa_id/:usuario_id', accessControl.validateAuth, empresas.validateOwner, usuarios.validateRequest('update'), usuarios.update); // not validating request
app.delete('/usuarios/:empresa_id/:usuario_id', accessControl.validateAuth, empresas.validateOwner, usuarios.remove);


app.listen(port, () => {
    console.log(`running on port ${port}`);
})