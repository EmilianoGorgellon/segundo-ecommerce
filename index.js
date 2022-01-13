let express = require("express");
let app = express();
let cors = require("cors");
let path = require('path');
const {config} = require("./config");

// Middlewares
app.use(express.static(path.join(__dirname, "public", "html")));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors(config.cors));

// Routes
app.use('/api/productos', require('./routes/productos'));
app.use('/api/carrito', require('./routes/carrito'))


app.listen(config.port);