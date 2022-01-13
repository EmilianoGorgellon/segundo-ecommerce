let express = require("express");
let router = express.Router();
const {getProducts, sendProduct, updateProduct, deleteProduct} = require("../components/productos/controllers/productosController")

router.get('/:id?', getProducts);
router.post('/', sendProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct)

module.exports = router;