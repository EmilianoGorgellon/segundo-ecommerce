let fs = require("fs");
class Carrito {
    constructor(url, db_client, db_collection, db_name){
        this.url = url,
        this.db_client = db_client,
        this.db_collection = db_collection,
        this.db_name = db_name
    }
    async getAll(){
        try {
            console.log("ENTRE AVER EL GET ALL")
            if (this.db_name === "mongo") {
                console.log("ESTOY EN MONGODB")
                return await this.db_client.find({});
            } else if (this.db_name === "sqlite3") {
                return await this.db_client.from(`${this.db_collection}`);
            } else if (this.db_name === "firebase") {
                return await this.db_client.collection(`${this.db_collection}`).get();
                // creo que es asi pero falta habilitar el firebase store
            }
            let getAllData = await fs.promises.readFile(`${this.url}`, 'utf-8')
            return JSON.parse(getAllData)
        } catch (error) {
            console.log(error);
        }
    }

    async createCarrito(time){
        try {
            let getAllCarrito = await this.getAll();
            let newId = await this.newId(getAllCarrito)
            let newCarrito = {
                "id": newId,
                "timestamp": time,
                "productos": []
            }
            getAllCarrito.push(newCarrito);
            console.log(getAllCarrito)
            // await fs.promises.writeFile(`${this.url}`, JSON.stringify(getAllCarrito, null, 2));
            return newId;
        } catch (error) {
            console.log(error);
        }
    } 
    
    async deleteCarrito (id){
        try {
            id = parseInt(id.id);
            let getAllCarrito = await this.getAll();
            let newAllCarrito = getAllCarrito.filter(data => data.id !== id)
            await fs.promises.writeFile(`${this.url}`, JSON.stringify(newAllCarrito, null, 2))
        } catch (error) {
            console.log(error);
        }
    }

    async getCarritoProducts(id){
        try {
            id = parseInt(id.id)
            let getAllCarrito = await this.getAll();
            console.log(getAllCarrito)
            let newAllCarrito = getAllCarrito.filter(data => data.id === id)
            return newAllCarrito;
        } catch (error) {
            console.log(error)
        }
    }

    async addProductCarrito (id){
        try {
            let Producto = require("../../productos/services/productosService");
            let producto = new Producto("./data/productos.txt");
            id = parseInt(id.id);
            let getAllCarrito = await this.getAll();
            let getProduct = await producto.getProductById({"id": id});
            getAllCarrito[0].productos.push(getProduct[0]);
            await fs.promises.writeFile(`${this.url}`, JSON.stringify(getAllCarrito, null, 2));
        } catch (error) {
            console.log(error);
        }
    }

    async deleteCarritoProductByIds(id, time){
        try {
            let carritoId = parseInt(id.id);
            let prodId = parseInt(id.id_prod);
            let getAllCarrito = await this.getAll();
            let getCarritoById = getAllCarrito.filter(data => data.id === carritoId);
            if (getCarritoById.length !== 0) {
                let getNewListProduct = getCarritoById.map(data => data.productos.filter(data => data.id !== prodId))[0]
                let sendData = {
                    "id": getCarritoById[0].id,
                    "timestamp": time,
                    "productos": getNewListProduct
                }
                getAllCarrito.splice(carritoId - 1, 1);
                getAllCarrito.push(sendData);
                getAllCarrito.sort((prev, current) => (prev.id - current.id))
                await fs.promises.writeFile(`${this.url}`, JSON.stringify(getAllCarrito, null, 2))
            } else {
                return {"Error": `No hay carrito con id ${carritoId}`}
            }    
        } catch (error) {
            console.log(error);
        }
    }

    async newId(data) {
        try {
            let idMax = data.reduce((prev, current) => {
                if (prev.id > current.id){
                    return prev.id;
                }
                return current.id;
            })
            return idMax + 1;
        } catch (error) {
            console.log(error);
        }
    }

}

module.exports = Carrito;