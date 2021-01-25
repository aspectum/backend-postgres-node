const genericRepository = require('./genericRepository');

class sedesRepository extends genericRepository{
    constructor(db) {
        super(db, 'sedes');
    }

    async findAllByEmpresaId(id) {
        return await super.find({ 'empresa_id' : id });
    }

    async update(empresa_id, sede_id, values) {
        return super.update(values, { id: sede_id, empresa_id });
    }

    async remove(empresa_id, sede_id) {
        return super.remove({ id: sede_id, empresa_id });
    }

}

module.exports = sedesRepository;