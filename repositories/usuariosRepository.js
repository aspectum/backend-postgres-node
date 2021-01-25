const GenericRepository = require('./GenericRepository');

class UsuariosRepository extends GenericRepository{
    constructor(db) {
        super(db, 'usuarios');
    }

    async findAllByEmpresaId(id) {
        return await super.find({ 'empresa_id' : id });
    }

    async update(empresa_id, usuario_id, values) {
        return super.update(values, { id: usuario_id, empresa_id });
    }

    async remove(empresa_id, usuario_id) {
        return super.remove({ id: usuario_id, empresa_id });
    }

}

module.exports = UsuariosRepository;