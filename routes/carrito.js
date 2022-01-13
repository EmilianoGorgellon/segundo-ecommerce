let express = require("express");
let router = express.Router();
const {createCarrito, deleteCarrito, getCarritoProducts, addProductCarrito, deleteCarritoProductByIds} = require('../components/carrito/controllers/carritoControllers');

router.post('/', createCarrito)
router.delete('/:id', deleteCarrito)
router.get('/:id/productos', getCarritoProducts);
router.post('/:id/productos', addProductCarrito);
router.delete('/:id/productos/:id_prod', deleteCarritoProductByIds)
module.exports = router;