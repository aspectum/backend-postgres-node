const GenericRepository = require('./genericRepository');

class TokensRepository extends GenericRepository{
    constructor(db) {
        super(db, 'tokens');
    }

    async remove(token) {
        return super.remove({ token });
    }

}

module.exports = TokensRepository;