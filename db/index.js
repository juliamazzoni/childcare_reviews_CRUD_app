const pg = require('pg')

//CHECK .ENV FILE
const connectionString = process.env.DATABASE_URL

const db = new pg.Pool({
    connectionString: connectionString
})

// console.log(connectionString);
module.exports = db