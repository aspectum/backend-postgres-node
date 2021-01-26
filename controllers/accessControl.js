const jwt = require('jsonwebtoken');
const TokensRepository = require('../repositories/tokensRepository');

const secret_key = 'canIPutAnythingHere'; // I think I should read this from a file or env variable

class AccessController {

    // Needs usuariosController for login
    constructor(db, usuariosController) {
        this.usuariosController = usuariosController;
        this.tokensRepo = new TokensRepository(db);

        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
    }
    
    // Middleware to validate authentication token
    // If I implement blacklisting, I'll check that here
    validateAuth(req, res, next) {
        const { authorization } = req.headers;
    
        if (!authorization) {
            console.log('ERROR: no authorization header')
            return res.status(401).send({
                success: false,
                data: null
            });
        }
    
        const token = authorization.split(' ')[1];
    
        jwt.verify(token, secret_key, (err, data) => {
            if (err) {
                console.log(err)
                return res.status(403).send({
                    success: false,
                    data: null
                });
            }
            req.authData = {
                token,
                id: data.id
            };
            next();
        });
    }
    
    // Handles authentication
    authenticate(id) {
        return jwt.sign({ id }, secret_key);
    }

    // Uses UsuariosController to check credentials and handles token creation
    async login(req, res) {
        const { email, password } = req.body;

        const id = await this.usuariosController.loginHandler(email, password);

        if (id) {
            const token = this.authenticate(id);

            const entry = {
                token,
                usuario_id: id
            }

            const data = await this.tokensRepo.create(entry)
                .catch(err => {
                    console.log(err);
                    return res.status(400).send({
                        success: false,
                        data: null
                    });
                });

            return res.status(200).send({
                success: true,
                data: null,
                token: data[0].token
            });
        }
        else {
            console.log('ERROR: wrong credentials')
            return res.status(400).send({
                success: false,
                data: null
            });
        }
    
    } 
    
    // Handles logout
    async logout(req, res) {
        const { token  } = req.authData;

        const data = await this.tokensRepo.remove(token)
            .catch(err => {
                console.log(err);
                return res.status(400).send({
                    success: false,
                    data: null,
                });
            });

        return res.status(200).send({
            success: true,
            data: null,
        });
    }
}


module.exports = AccessController;