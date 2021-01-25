const GenericRepository = require('./GenericRepository');

class EmpresasRepository extends GenericRepository{
    constructor(db) {
        super(db, 'empresas');
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