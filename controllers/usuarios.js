const bcrypt = require('bcrypt'); // importing this in 2 controllers

const saltRounds = 10;

// Lists all usuarios from empresa (not listing owner)
const list = (db) => (req, res) => {
    const { empresa_id } = req.params;

    db.select('id', 'nome', 'email', 'empresa_id', 'usuario_id').from('usuarios').where({ empresa_id })
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
        .into('usuarios').returning(['id', 'nome', 'email', 'empresa_id', 'usuario_id'])
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

module.exports = {
    list,
    create,
}