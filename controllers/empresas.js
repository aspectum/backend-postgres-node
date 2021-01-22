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

module.exports = {
    list
}