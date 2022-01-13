let knex = require("knex");
const {config} = require("./index");

if (config.db_name === "sqlite3") {
    let sqlite3 = knex({
        client: 'sqlite3',
        connection: {
            filename: './db/ecommerce2.sqlite'
        }
    });
    
    class DatabaseSQlite3 {
        static client;
        constructor() {
            if (DatabaseSQlite3.client) {
                return DatabaseSQlite3.client
            }
            DatabaseSQlite3.client = sqlite3
            this.client = DatabaseSQlite3.client
        }
    }
    module.exports = new DatabaseSQlite3();
}
