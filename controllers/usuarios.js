const bcrypt = require('bcrypt'); // importing this in 2 controllers
const UsuariosRepository = require('../repositories/usuariosRepository');
const { validateEmail } =  require('../helpers/validateEmail');

const saltRounds = 10;

class UsuariosController {

    constructor(db) {
        this.usuariosRepo = new UsuariosRepository(db);

        this.list = this.list.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.remove = this.remove.bind(this);
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
                console.log('ERROR: body incomplete')
                return res.status(400).send({
                    success: false,
                    data: null
                });
            }
        }
    }

    // validateRequest = (type) => (req, res, next) => {
    //     let isValid = true;

    //     isValid = validateEmail(req.body.email); // undefined returns false. THIS MUST HAPPEN FIRST!! or something like isValid = validate(email) && isValid
    //     if (!req.body.password) isValid = false;
    //     if (type !== 'login') if (!req.body.nome) isValid = false; // This way to prevent trying to access body.nome when it doesn't exist

    //     if (isValid) {
    //         next()
    //     }
    //     else {
    //         console.log('ERROR: body incomplete')
    //         return res.status(400).send({
    //             success: false,
    //             data: null
    //         });
    //     }
    // }

    // Lists all usuarios from empresa (not listing owner)
    async list(req, res) {
        const { empresa_id } = req.params;

        const users = await this.usuariosRepo.findAllByEmpresaId(empresa_id)
            .catch(err => {
                console.log(err);
                return res.status(400).send({
                    success: false,
                    data: null
                });
            });

        const data = this._removePassword(users);

        return res.status(200).send({
            success: true,
            data
        });
    }
    
    
    // Creates a new usuario
    async create(req, res) {
        const { nome, email, password } = req.body;
        let { empresa_id } = req.params;
        if (empresa_id) {   // If owner is creating new usuario
            const usuario_id = req.authData.id;
        }
        else {  // If registering new owner
            empresa_id = 0;
            const usuario_id = null;
        }
    
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
                console.log(err); // probably violating unique email
                return res.status(409).send({
                    success: false,
                    data: null
                });
            });

        const data = this._removePassword(users);

        return res.status(201).send({
            success: true,
            data
        });
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
                console.log(err); // probably violating unique email
                return res.status(409).send({
                    success: false,
                    data: null
                });
            });

        if (!users[0]) {
            console.log(`ERROR: this Usuario does not belong to this Empresa`);
            return res.status(400).send({
                success: false,
                data: null
            });
        }

        const data = this._removePassword(users);

        return res.status(200).send({
            success: true,
            data
        });
    }
    
    // Deletes usuario
    async remove(req, res) {
        const { empresa_id, usuario_id } = req.params;

        const users = await this.usuariosRepo.remove(empresa_id, usuario_id)
            .catch(err => {
                console.log(err);
                return res.status(400).send({
                    success: false,
                    data: null
                });
            });

        if (!users[0]) {
            console.log(`ERROR: this Usuario does not belong to this Empresa`);
            return res.status(400).send({
                success: false,
                data: null
            });
        }

        const data = this._removePassword(users);

        return res.status(200).send({
            success: true,
            data
        });
    }
}


module.exports = UsuariosController;