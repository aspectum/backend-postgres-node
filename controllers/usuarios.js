const bcrypt = require('bcrypt');
const UsuariosRepository = require('../repositories/usuariosRepository');
const responses = require('../helpers/responses');
const { validateEmail } =  require('../helpers/validateEmail');

const saltRounds = 10;

class UsuariosController {

    constructor(db) {
        this.usuariosRepo = new UsuariosRepository(db);

        this.list = this.list.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.remove = this.remove.bind(this);
        this.registerOwner = this.registerOwner.bind(this);
        this.loginHandler = this.loginHandler.bind(this);
    }

    // How do I make this private?
    _removePassword(objs) {
        const filtered = objs.map(({ password, ...obj }) => obj);
        return filtered;
    }

    // Middleware to validate request
    validateRequest(type) {
        return (req, res, next) => {
            let isValid = true;

            isValid = validateEmail(req.body.email); // undefined returns false. THIS MUST HAPPEN FIRST!! or something like isValid = validate(email) && isValid
            if (!req.body.password) isValid = false;
            if (type !== 'login') if (!req.body.nome) isValid = false; // This way to prevent trying to access body.nome when it doesn't exist

            if (isValid) {
                next()
            }
            else {
                return responses.failure(res, `ERROR: body invalid`);
            }
        }
    }

    // Lists all usuarios from empresa (not listing owner)
    async list(req, res) {
        const { empresa_id } = req.params;

        const users = await this.usuariosRepo.findAllByEmpresaId(empresa_id)
            .catch(err => {
                return responses.failure(res, err);
            });

        const data = this._removePassword(users);

        return responses.success(res, `Listed usuarios from empresa ${empresa_id}`, data);
    }
    
    
    // Creates a new usuario
    async create(req, res) {
        const { nome, email, password } = req.body;
        const { empresa_id } = req.params;
        const usuario_id = req.authData.id;

        const hash = bcrypt.hashSync(password, saltRounds);

        const user = {
            nome,
            email,
            password: hash,
            empresa_id,
            usuario_id
        };

        const users = await this.usuariosRepo.create(user)
            .catch(err => {
                return responses.failure(res, err, null, 409); // probably violating unique email
            });

        const data = this._removePassword(users);

        return responses.success(res, `Created new usuario ${JSON.stringify(data)}`, data, 201);
    }
    
    
    // Edits usuario
    async update(req, res) {
        const { nome, email, password } = req.body;
        const { empresa_id, usuario_id } = req.params;
    
        const hash = bcrypt.hashSync(password, saltRounds);
    
        const updated_values = { 
            nome,
            email,
            password: hash,
        };

        const users = await this.usuariosRepo.update(empresa_id, usuario_id, updated_values)
            .catch(err => {
                return responses.failure(res, err, null, 409); // probably violating unique email
            });

        if (!users[0]) {
            return responses.failure(res, `ERROR: this Usuario does not belong to this Empresa`);
        }

        const data = this._removePassword(users);

        return responses.success(res, `Edited usuario ${JSON.stringify(data)}`, data);
    }
    
    // Deletes usuario
    async remove(req, res) {
        const { empresa_id, usuario_id } = req.params;

        const users = await this.usuariosRepo.remove(empresa_id, usuario_id)
            .catch(err => {
                return responses.failure(res, err);
            });

        if (!users[0]) {
            return responses.failure(res, `ERROR: this Usuario does not belong to this Empresa`);
        }

        const data = this._removePassword(users);

        return responses.success(res, `Deleted usuario ${JSON.stringify(data)}`, data);
    }

    // Prepares to call create method
    registerOwner(req, res) {
        res.params = { empresa_id: 0 };
        req.authData = { id: null };

        return this.create(req, res);
    }

    // Check if (email, password) combination exists in DB
    async loginHandler(email, password) {
        const data = await this.usuariosRepo.findByEmail(email)
            .catch(err => {
                console.log(err);
                return false;
            })

        if (!data[0]) {
            return false;
        }
        else {
            const isValid = bcrypt.compareSync(password, data[0].password);
            if (isValid) {
                return data[0].id;
            }
            else {
                return false;
            }
        }
    }
}


module.exports = UsuariosController;