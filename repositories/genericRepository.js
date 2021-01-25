class GenericRepository {
    constructor(db, table_name) {
        this.db = db;
        this.table_name = table_name;

        this.find = this.find.bind(this);
        this.findById = this.findById.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.remove = this.remove.bind(this);
    }

    async find(criteria) {
        return await db.select('*').from(this.table_name).where(criteria);
    }

    async findById(id) {
        // return await db.select('*').from(this.table_name).where('id', '=', id);
        return await this.find({ id });
    }
    
    async create(row) {
        return await db.insert(row).into(this.table_name).returning('*');
    }

    async update(values, criteria) {
        return await db.from(this.table_name).where(criteria).update(values, '*');
    }

    async remove(criteria) {
        return await db.from(this.table_name).where(criteria).del('*');
    }
}

module.exports = GenericRepository;