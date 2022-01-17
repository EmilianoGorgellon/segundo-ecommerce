let {Schema, model} = require("mongoose");
let {carritosSchema} = require("../schema/carrito.schema");
let carritoSchema = new Schema(carritosSchema);
let carritoModel = new model("carrito", carritoSchema);

module.exports = {carritoModel};