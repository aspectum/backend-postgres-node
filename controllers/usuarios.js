const bcrypt = require('bcrypt'); // importing this in 2 controllers

const saltRounds = 10;
const allMinusPassword = ['id', 'nome', 'email', 'empresa_id', 'usuario_id'];

// Lists all usuarios from empresa (not listing owner)
const list = (db) => (req, res) => {
    const { empresa_id } = req.params;

    db.select(allMinusPassword).from('usuarios').where({ empresa_id })
        .then(data => {
            console.log(data);
            res.status(200).send({
                success: true,
                data
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


// Creates a new usuario
// Maybe it would be better to put this in accessControl,
// then I wouldn't need to import bcrypt twice. Also, this
// is very similar to accessControl.register...
const create = (db) => (req, res) => {
    const { nome, email, password } = req.body;
    const { empresa_id } = req.params;
    const usuario_id = req.authData.id;

    const hash = bcrypt.hashSync(password, saltRounds);

    db.insert({
        nome,
        email,
        password: hash,
        empresa_id,
        usuario_id
    })
        .into('usuarios').returning(allMinusPassword)
        .then(data => {
            usuario = data[0];
            console.log(usuario);
            res.status(200).send({
                success: true,
                data: usuario
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


// Edits usuario
const update = (db) => (req, res) => {
    const { nome, email, password } = req.body;
    const { empresa_id, usuario_id } = req.params;

    let hash;
    if (password) hash = bcrypt.hashSync(password, saltRounds);

    const updated_values = Object.assign({},    // This should filter the properties that are undefined (not on request body)
        nome && {nome},
        email && {email},
        hash && {password: hash},
    );

    db.from('usuarios').where({ id: usuario_id, empresa_id }).update(updated_values, allMinusPassword)
        .then(data => {
            usuario = data[0];

            if (!usuario) throw { msg:`ERROR: Usuario doesn't exist or does not belong to this Empresa`, code: 400 };

            console.log('UPDATED ', usuario);
            return res.status(200).send({
                success: true,
                data: usuario
            });
        })
        .catch(err => {
            console.log(err);

            return res.status(400).send({
                success: false,
                data: null
            });
        });
}

// Deletes usuario
const remove = (db) => (req, res) => {
    const { empresa_id, usuario_id } = req.params;

    db.from('usuarios').where({ id: usuario_id, empresa_id }).del(allMinusPassword)
        .then(data => {
            usuario = data[0];

            if (!usuario) throw { msg:`ERROR: Usuario doesn't exist or does not belong to this Empresa`, code: 400 };

            console.log('DELETED ', usuario);
            return res.status(200).send({
                success: true,
                data: usuario
            });
        })
        .catch(err => {
            console.log(err);

            return res.status(400).send({
                success: false,
                data: null
            });
        });
}

module.exports = {
    list,
    create,
    update,
    remove
}