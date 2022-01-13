let joi = require("joi");
let id = joi.number();
let timestamp = joi.string().min(3);
let nombre = joi.string().min(3);
let descripcion = joi.string().min(3);
let codigo = joi.number();
let foto = joi.string().min(3);
let precio = joi.number();
let stock = joi.number();

let productosSchema = {
    id: id.required(),
    timestamp: timestamp.required(),
    nombre: nombre.required(),
    descripcion: descripcion.required(),
    codigo: codigo.required(),
    foto: foto.required(),
    precio: precio.required(),
    stock: stock.required()
}

module.exports = {productosSchema}
