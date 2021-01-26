const EmpresasRepository = require('../repositories/empresasRepository');
const responses = require('../helpers/responses');
const { validateEmail } =  require('../helpers/validateEmail');
const { validateCNPJ } =  require('../helpers/validateCNPJ');

class EmpresasController {

    constructor(db) {
        this.empresasRepo = new EmpresasRepository(db);

        this.validateOwner = this.validateOwner.bind(this);
        this.list = this.list.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.remove = this.remove.bind(this);
    }

    // Middleware to validate request
    validateRequest(req, res, next) {
        let isValid = true;
        
        req.body.email ? isValid = validateEmail(req.body.email) : isValid = false;
        req.body.cnpj ? isValid = validateCNPJ(req.body.cnpj) : isValid = false;
        if (!req.body.slug) isValid = false;
        if (!req.body.razao_social) isValid = false;
    
        if (isValid) {
            next()
        }
        else {
            return responses.failure(res, 'ERROR: body invalid');
        }
    }
    
    
    // Middleware to validate if logged_user owns requested empresa
    async validateOwner(req, res, next) {
        const { empresa_id } = req.params;
        const logged_user_id = req.authData.id;
    
        const data = await this.empresasRepo.findOwnerEmpresa(logged_user_id, empresa_id);

        if (!data[0]) {
            return responses.failure(res, `ERROR: Empresa doesn't exist or does not belong to this User`);
        }

        next();
    }
    
    
    // Lists all empresas from logged user
    async list(req, res) {
        const usuario_id = req.authData.id;

        const data = await this.empresasRepo.findAllByOwnerId(usuario_id)
            .catch(err => {
                return responses.failure(res, err);
            });

        return responses.success(res, `Listed empresas from user ${usuario_id}`, data);
    }
    
    
    // Creates a new empresa
    async create(req, res) {
        const { slug, razao_social, cnpj, email } = req.body;
        const usuario_id = req.authData.id;

        const empresa = {
            slug,
            razao_social,
            email,
            cnpj,
            usuario_id
        };
    
        const data = await this.empresasRepo.create(empresa)
            .catch(err => {
                return responses.failure(res, err, null, 409); // probably violating unique email
            });

        return responses.success(res, `Created new empresa ${JSON.stringify(data)}`, data, 201);
    }
    
    
    // Edits empresa
    async update(req, res) {
        const { empresa_id } = req.params;
        const { slug, razao_social, email, cnpj } = req.body;
    
        const updated_values = {
            slug,
            razao_social,
            email,
            cnpj,
        };

        const data = await this.empresasRepo.update(updated_values, empresa_id)
            .catch(err => {
                return responses.failure(res, err, null, 409); // probably violating unique email
            });

        return responses.success(res, `Edited empresa ${JSON.stringify(data)}`, data);
    }
    
    
    // Deletes empresa
    async remove(req, res) {
        const { empresa_id } = req.params;

        const data = await this.empresasRepo.remove(empresa_id)
            .catch(err => {
                return responses.failure(res, err);
            });

        return responses.success(res, `Deleted empresa ${JSON.stringify(data)}`, data);
    }
}


module.exports = EmpresasController;