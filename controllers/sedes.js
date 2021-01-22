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

    db.select('*').from('sedes').where({ usuario_id, empresa_id })
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

module.exports = {
    validateRequest,
    list,
    create,
}