const genericRepository = require('./genericRepository');

class tokensRepository extends genericRepository{
    constructor(db) {
        super(db, 'tokens');
    }

    async remove(token) {
        return super.remove({ token });
    }

}

module.exports = tokensRepository;