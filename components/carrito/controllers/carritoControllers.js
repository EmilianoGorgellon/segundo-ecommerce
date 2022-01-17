let moment = require("moment");
// config
const { config } = require("../../../config");
// mongo db
let {carritoModel} = require("../../../models/model/carrito.model");
let {connection} = require("../../../config/mongodb");
// sqlite3
let dbSqlite = require("../../../config/sqlite3");
// firebase
let {db:firebaseDB} = require("../../../utils/firebase/index");
let Carrito = require("../services/carritoServices");
let carrito;
if (config.db_name === "mongo") {
    carrito = new Carrito(null, carritoModel, null, config.db_name);
} else if (config.db_name === "sqlite3") {
    carrito = new Carrito(null, dbSqlite, "carrito", config.db_name);
} else if (config.db_name === "firebase") {
    carrito = new Carrito(null, firebaseDB, "carrito", config.db_name);
} else {
    carrito = new Carrito("./data/carrito.txt", null, null, null);
}

const createCarrito = async (req, res) => {
    let time = moment().format('MMMM Do YYYY, h:mm:ss a');
    res.json(await carrito.createCarrito(time));
}
const deleteCarrito = async (req, res) => {
    res.json(await carrito.deleteCarrito(req.params));
}

const getCarritoProducts = async (req, res) => {
    res.json(await carrito.getCarritoProducts(req.params));
}

const addProductCarrito = async (req, res) => {
    res.json(await carrito.addProductCarrito(req.params));
}

const deleteCarritoProductByIds = async (req, res) => {
    let time = moment().format('MMMM Do YYYY, h:mm:ss a');
    res.json(await carrito.deleteCarritoProductByIds(req.params, time));
}

module.exports = {createCarrito, deleteCarrito, getCarritoProducts, addProductCarrito, deleteCarritoProductByIds}