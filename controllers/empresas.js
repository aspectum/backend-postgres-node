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

    // Using transaction because update won't be commited if
    // logged user is trying to change someone else's empresa
    // Also might be better to 400 everything to not give info if empresa/:id exists
    db.transaction(trx => {
        trx.from('empresas').where('id', '=', id).update(updated_values, '*')
            .then(data => {
                empresa = data[0];

                if (!empresa) throw { msg:`ERROR: Empresa doesn't exist`, code: 404 }
                if (empresa.usuario_id !== logged_user_id) throw { msg:`ERROR: Unauthorized user ${logged_user_id}`, code: 403 }

                console.log('UPDATED ', empresa);
                return res.status(200).send({
                    success: true,
                    data: empresa
                });
            })
            .then(trx.commit)
            .catch(err => {
                trx.rollback(err);

                console.log(err);

                let code = err.code;
                if (!code) code = 400;

                return res.status(code).send({
                    success: false,
                    data: null
                });
            });
        })
        .catch(err => {
            console.log(err) // Doubling logs, but I don't know if I might miss something if I delete this
        });
}

module.exports = {
    validateRequest,
    list,
    create,
    update
}