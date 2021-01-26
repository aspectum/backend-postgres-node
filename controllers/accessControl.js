const jwt = require('jsonwebtoken');
const TokensRepository = require('../repositories/tokensRepository');
const responses = require('../helpers/responses');

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
            return responses.failure(res, 'ERROR: no authorization header', null, 401);
        }
    
        const token = authorization.split(' ')[1];
    
        jwt.verify(token, secret_key, (err, data) => {
            if (err) {
                return responses.failure(res, err, null, 403);
            }
            req.authData = {
                token,
                id: data.id
            };
            return next();
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
                    return responses.failure(res, err);
                });

            return res.status(200).send({   // can't use responses.success because of formar (token outside of data)
                success: true,
                data: null,
                token: data[0].token
            });
        }
        else {
            return responses.failure(res, 'ERROR: wrong credentials');
        }
    
    } 
    
    // Handles logout
    async logout(req, res) {
        const { token  } = req.authData;

        const data = await this.tokensRepo.remove(token)
            .catch(err => {
                return responses.failure(res, err);
            });

        return responses.success(res, `Logged out user ${JSON.stringify(data)}`);
    }
}


module.exports = AccessController;