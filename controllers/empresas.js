// Middleware to validate request
// How to validate PUT?
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


// Middleware to validate if logged_user owns requested empresa
const validateOwner = (db) => (req, res, next) => {
    const { id } = req.params;
    const logged_user_id = req.authData.id;

    db.select('usuario_id').from('empresas').where('id', '=', id)
        .then(data => {

            if (!data[0]) throw { msg:`ERROR: Empresa doesn't exist`, code: 404 };
            if (data[0].usuario_id !== logged_user_id) throw { msg:`ERROR: Unauthorized user ${logged_user_id}`, code: 403 };

            next();
        })
        .catch(err => {
            console.log(err);

            let code = err.code;
            if (!code) code = 400;

            return res.status(code).send({
                success: false,
                data: null
            });
        });
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


// Edits empresa
const update = (db) => (req, res) => {
    const { id } = req.params;
    const { slug, razao_social, email } = req.body;
    const logged_user_id = req.authData.id;

    const updated_values = Object.assign({},    // This should filter the properties that are undefined (not on request body)
        slug && {slug},
        razao_social && {razao_social},
        email && {email}
    );

    db.from('empresas').where('id', '=', id).update(updated_values, '*')
        .then(data => {
            empresa = data[0];

            console.log('UPDATED ', empresa);
            return res.status(200).send({
                success: true,
                data: empresa
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


// Deletes empresa
const remove = (db) => (req, res) => {
    const { id } = req.params;
    const logged_user_id = req.authData.id;

    db.from('empresas').where('id', '=', id).del('*')
        .then(data => {
            empresa = data[0];

            console.log('DELETED ', empresa);
            return res.status(200).send({
                success: true,
                data: empresa
            });
        })
        .catch(err => {
            console.log(err);

            return res.status(code).send({
                success: false,
                data: null
            });
        });
}


module.exports = {
    validateRequest,
    validateOwner,
    list,
    create,
    update,
    remove
}