const SedesRepository = require('../repositories/sedesRepository');
const responses = require('../helpers/responses');
const { validateCNPJ } =  require('../helpers/validateCNPJ');

class SedesController {

    constructor(db) {
        this.sedesRepo = new SedesRepository(db);

        this.list = this.list.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.remove = this.remove.bind(this);
    }

    // Middleware to validate request
    validateRequest(req, res, next) {
        let isValid = true;
    
        req.body.cnpj ? isValid = validateCNPJ(req.body.cnpj) : isValid = false;
        if (!req.body.endereco) isValid = false;
    
        if (isValid) {
            return next()
        }
        else {
            return responses.failure(res, 'ERROR: body invalid');
        }
    }
    
    // Lists all sedes from empresa
    async list(req, res) {
        const { empresa_id } = req.params;

        const data = await this.sedesRepo.findAllByEmpresaId(empresa_id)
            .catch(err => {
                return responses.failure(res, err);
            });

        return responses.success(res, `Listed sedes from empresa ${empresa_id}`, data);
    }
    
    
    // Creates a new sede
    async create(req, res) {
        const { endereco, cnpj } = req.body;
        const { empresa_id } = req.params;
        const usuario_id = req.authData.id;

        const sede = {
            endereco,
            cnpj,
            usuario_id,
            empresa_id
        };

        const data = await this.sedesRepo.create(sede)
            .catch(err => {
                return responses.failure(res, err);
            });

        return responses.success(res, `Created new sede ${JSON.stringify(data)}`, data, 201);
    }
    
    
    // Edits sede
    async update(req, res) {
        const { endereco, cnpj } = req.body;
        const { empresa_id, sede_id } = req.params;

        const updated_values = {
            endereco,
            cnpj
        }

        const data = await this.sedesRepo.update(empresa_id, sede_id, updated_values)
            .catch(err => {
                return responses.failure(res, err);
            });

        if (!data[0]) {
            return responses.failure(res, `ERROR: this Sede does not belong to this Empresa`);
        }

        return responses.success(res, `Updated sede ${JSON.stringify(data)}`, data);
    }
    
    
    // Deletes sede
    async remove(req, res) {
        const { empresa_id, sede_id } = req.params;

        const data = await this.sedesRepo.remove(empresa_id, sede_id)
            .catch(err => {
                return responses.failure(res, err);
            });

        if (!data[0]) {
            return responses.failure(res, `ERROR: this Sede does not belong to this Empresa`);
        }

        return responses.success(res, `Deleted sede ${JSON.stringify(data)}`, data);
    }
}


module.exports = SedesController;