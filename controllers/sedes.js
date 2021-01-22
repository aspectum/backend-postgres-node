
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


module.exports = {
    list,
}