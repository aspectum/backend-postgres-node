const GenericRepository = require('./genericRepository');

class EmpresasRepository extends GenericRepository{
    constructor(db) {
        super(db, 'empresas');
    }

    async findOwnerEmpresa(owner_id, empresa_id) {
        return super.find({ id : empresa_id, usuario_id : owner_id  })
    }

    async findAllByOwnerId(id) {
        return await super.find({ 'usuario_id' : id });
    }

    async update(values, id) {
        return super.update(values, { id });
    }

    async remove(id) {
        return super.remove({ id });
    }

}

module.exports = EmpresasRepository;