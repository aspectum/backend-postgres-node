const express = require('express')
const knex = require('knex')
const app = express();
const port = 3000

const db = knex({
    client: 'pg',
    connection: {
      host : 'localhost',
      user : 'postgres',
      password : 'root',    // Should I use env variables or it doesn't matter because it's the backend?
      database : 'db'
    }
});

app.get('/', (req, res) => {
    db.select('*').from('usuarios')
        .then(data => {
            res.json(data)
        })
})

app.listen(port, () => {
    console.log(`running on port ${port}`);
})