// Middleware to validate request
const validateRequest = (type) => (req, res, next) => {
    let isValid = true;

    // might have to rearrange these
    if (type === 'create') {
        if (!req.body.slug) isValid = false;
        if (!req.body.razao_social) isValid = false;
        if (!req.body.email) isValid = false;
    }
    // Validate email
    // Validate cnpj ???

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

// Lists all empresas from logged user
const list = (db) => (req, res) => {
    const usuario_id = req.authData.id;

    db.select('id', 'slug', 'razao_social', 'email').from('empresas').where('usuario_id', '=', usuario_id)  // querying by usuario_id, so not showing it
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


// Creates a new empresa
const create = (db) => (req, res) => {
    const { slug, razao_social, email } = req.body;
    const usuario_id = req.authData.id;

    db.insert({
        slug,
        razao_social,
        email,
        usuario_id
    })
        .into('empresas').returning('*') // Should I return usuario_id?
        .then(data => {
            empresa = data[0];
            console.log(empresa);
            res.status(200).send({
                success: true,
                data: empresa
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
    create
}