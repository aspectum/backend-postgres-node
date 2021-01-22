// Middleware to validate request
// How to validate PUT?
const validateRequest = (type) => (req, res, next) => {
    let isValid = true;

    // might have to rearrange these
    if (type === 'create') {
        if (!req.body.endereco) isValid = false;
        if (!req.body.cnpj) isValid = false;
    }
    // Validate cnpj

    if (isValid) {
        next()
    }
    else {
        console.log('ERROR: body incomplete')
        return res.status(400).send({
            success: false,
            data: null
        });
    }
}

// Lists all sedes from empresa
const list = (db) => (req, res) => {
    const { empresa_id } = req.params;
    const usuario_id = req.authData.id;

    db.select('*').from('sedes').where({ empresa_id })
        .then(data => {
            console.log(data);
            res.status(200).send({
                success: true,
                data
            });
        })
        .catch(err => {
            console.log(err);
            res.status(200).send({
                success: false,
                data: null,
            });
        })
}


// Creates a new sede
const create = (db) => (req, res) => {
    const { endereco, cnpj } = req.body;
    const { empresa_id } = req.params;
    const usuario_id = req.authData.id;

    db.insert({
        cnpj,
        endereco,
        empresa_id,
        usuario_id
    })
        .into('sedes').returning('*')
        .then(data => {
            sede = data[0];
            console.log(sede);
            res.status(200).send({
                success: true,
                data: sede
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


// Edits sede
const update = (db) => (req, res) => {
    const { endereco, cnpj } = req.body;
    const { empresa_id, sede_id } = req.params;

    const updated_values = Object.assign({},    // This should filter the properties that are undefined (not on request body)
        endereco && {endereco},
        cnpj && {cnpj},
    );

    db.from('sedes').where({ id: sede_id, empresa_id }).update(updated_values, '*')
        .then(data => {
            sede = data[0];

            if (!sede) throw { msg:`ERROR: Sede doesn't exist or does not belong to this Empresa`, code: 400 };

            console.log('UPDATED ', sede);
            return res.status(200).send({
                success: true,
                data: sede
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
    validateRequest,
    list,
    create,
    update,
}