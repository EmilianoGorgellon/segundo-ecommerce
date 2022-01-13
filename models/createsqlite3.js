const dbSqlite = require("../config/sqlite3");

const startSqlite3 = async () => {
    try {
        // create table productos in sqlite3
        let hastable = await dbSqlite.client.schema.hasTable('productos');
        if(!hastable){
            await dbSqlite.client.schema.createTable('productos', table =>{
                table.increments("id").primary(),
                table.string("timestamp"),
                table.string("nombre"),
                table.string("descripcion"),
                table.integer("codigo"),
                table.string("foto"),
                table.integer("precio"),
                table.string("stock")
            });
        } else {
            console.log("Ya existe la tabla productos")
        }
    } catch (error) {
        console.log("Error: " + error);
    }
};
module.exports = { startSqlite3 };