require("dotenv").config();
const mongoose = require("mongoose");
const {config} = require("./index");
if (config.db_name === "mongo") {
    let connection;
    (async () => {
        try {
            connection = mongoose.connect(config.mongo_atlas, {useNewUrlParser:true, useUnifiedTopology: true})
            console.log("Coneccion conectada por mongodb")
        } catch (error) {
            console.log(error);
        }
    })()

    module.exports = {connection}
}
