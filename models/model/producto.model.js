let {Schema, model} = require("mongoose");
let {productosSchema} = require("../schema/productos.schema");
let productoSchema = new Schema(productosSchema);
let productoModel = new model("productos", productoSchema);

module.exports = {productoModel};