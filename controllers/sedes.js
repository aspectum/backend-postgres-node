const SedesRepository = require('../repositories/sedesRepository');
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
    
    // Lists all sedes from empresa
    async list(req, res) {
        const { empresa_id } = req.params;

        const data = await this.sedesRepo.findAllByEmpresaId(empresa_id)
            .catch(err => {
                console.log(err);
                return res.status(400).send({
                    success: false,
                    data: null
                });
            });

        return res.status(200).send({
            success: true,
            data
        });
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
                console.log(err); // probably violating unique email
                return res.status(409).send({
                    success: false,
                    data: null
                });
            });

        return res.status(201).send({
            success: true,
            data
        });
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
                console.log(err); // probably violating unique email
                return res.status(409).send({
                    success: false,
                    data: null
                });
            });

        if (!data[0]) {
            console.log(`ERROR: this Sede does not belong to this Empresa`);
            return res.status(400).send({
                success: false,
                data: null
            });
        }

        return res.status(200).send({
            success: true,
            data
        });
    }
    
    
    // Deletes sede
    async remove(req, res) {
        const { empresa_id, sede_id } = req.params;

        const data = await this.sedesRepo.remove(empresa_id, sede_id)
            .catch(err => {
                console.log(err);
                return res.status(400).send({
                    success: false,
                    data: null
                });
            });

        if (!data[0]) {
            console.log(`ERROR: this Sede does not belong to this Empresa`);
            return res.status(400).send({
                success: false,
                data: null
            });
        }

        return res.status(200).send({
            success: true,
            data
        });
    }
}


module.exports = SedesController;