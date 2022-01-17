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
            if (this.db_name === "mongo") {
                return await this.db_client.find({});
            } else if (this.db_name === "sqlite3") {
                return await this.db_client.from(`${this.db_collection}`);
            } else if (this.db_name === "firebase") {
                let getProductos = await this.db_client.collection(`${this.db_collection}`).get();
                let sendData = [];
                getProductos.forEach(element => sendData.push({id:element.id, ...element.data()}))
                return sendData;
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
            if (this.db_name === "mongo") {
                await this.db_client.create(newCarrito);
                return {"response": `id: ${newId}`}
            } else if (this.db_name === "sqlite3") {
                console.log("carrito con sqlite3")
            } else if (this.db_name === "firebase") { 
                return await this.db_client.collection(`${this.db_collection}`).doc().set(newCarrito);
            }     
            getAllCarrito.push(newCarrito);
            await fs.promises.writeFile(`${this.url}`, JSON.stringify(getAllCarrito, null, 2));
            return newId;
        } catch (error) {
            console.log(error);
        }
    } 
    
    async deleteCarrito (id){
        try {
            id = parseInt(id.id);
            if (id >= 1) {  
                if (this.db_name === "mongo") {
                    return await this.db_client.deleteOne({id: id});
                } else if (this.db_name === "sqlite3") {
                    console.log("elimino carrito segun id con sqlite3")
                } else if (this.db_name === "firebase") {
                    let getProductos = await this.db_client.collection(`${this.db_collection}`).get();
                    let productoEliminado = false;
                    getProductos.forEach(async element => {
                        if (element.data().id === id) {
                            productoEliminado = true;
                            return await this.db_client.collection(`${this.db_collection}`).doc(element.id).delete();
                        }
                    })
                    return productoEliminado ? {"response": `Carrito eliminado con id: ${id}`} : {"response": `No hay carrito con id: ${id}`}  
                }
                let getAllCarrito = await this.getAll();
                let newAllCarrito = getAllCarrito.filter(data => data.id !== id);
                await fs.promises.writeFile(`${this.url}`, JSON.stringify(newAllCarrito, null, 2))
            } 
            return {"response": `Error: No existe carrito con el id: ${id}`}
        } catch (error) {
            console.log(error);
        }
    }

    async getCarritoProducts(id){
        try {
            id = parseInt(id.id)
            let getAllCarrito = await this.getAll();
            let newAllCarrito = getAllCarrito.filter(data => data.id === id)
            return newAllCarrito;
        } catch (error) {
            console.log(error)
        }
    }

    async addProductCarrito (id){
        try {
            let id_carrito = parseInt(id.id);
            let id_prod = parseInt(id.id_prod);
            let getAllCarrito = await this.getAll();
            let Producto = require("../../productos/services/productosService");
            if (this.db_name === "mongo") { 
                let {productoModel} = require("../../../models/model/producto.model")
                let producto = new Producto(this.url, productoModel, "productos", this.db_name);
                let carritoById = getAllCarrito.filter(data => data.id === id_carrito);
                let prodById = await producto.getProductById({"id": id_prod});
                if (typeof prodById === 'string') return prodById;
                carritoById[0].productos.push(prodById[0]);
                return await this.db_client.updateOne({id: id_carrito}, {productos: carritoById[0].productos})
            } else if (this.db_name === "sqlite3") {
                console.log("xd")
            } else if (this.db_name === "firebase") {
                let producto = new Producto(this.url, this.db_client, "productos", this.db_name);
                let getCarritoFirebase = await this.db_client.collection(`${this.db_collection}`).get();
                let carritoById = getAllCarrito.filter(data => data.id === id_carrito);
                let prodById = await producto.getProductById({"id": id_prod});
                if (typeof prodById === 'string') return prodById;
                carritoById[0].productos.push(prodById[0]);
                getCarritoFirebase.forEach(async (element) => {
                    if (element.data().id === id_carrito) {
                        return await this.db_client.collection(`${this.db_collection}`).doc(element.id).set({...carritoById[0]})
                    }
                })
                return {"response" : `Producto con id ${id_prod} se agrego al carrito con id ${id_carrito}`}
            }
            
            let getProduct = await producto.getProductById({"id": id});
            getAllCarrito[0].productos.push(getProduct[0]);
            console.log(getAllCarrito)
            await fs.promises.writeFile(`${this.url}`, JSON.stringify(getAllCarrito, null, 2));
        } catch (error) {
            console.log(error);
        }
    }

    async deleteCarritoProductByIds(id, time){
        try {
            let id_carrito = parseInt(id.id);
            let id_prod = parseInt(id.id_prod);
            let getAllCarrito = await this.getAll();

            if (this.db_name === "mongo") {
                let getCarrito = getAllCarrito.filter(data => data.id === id_carrito);
                let deleteProductById = getCarrito.map(data => data.productos.filter(dato => dato.id !== id_prod));
                let getProductToDelete = getCarrito.map(data => data.productos.filter(dato => dato.id === id_prod));
                return getProductToDelete[0].length !== 0 ? 
                    await this.db_client.updateOne({id: id_carrito}, {productos: deleteProductById[0]}) :
                   { "response" : `No hay producto con id ${id_prod} en carrito id ${id_carrito}`}

            } else if (this.db_name === "sqlite3") {
                return console.log("Sqlite3")
            } else if (this.db_name === "firebase") {
                let getFirebase = await this.db_client.collection(`${this.db_collection}`);
                let getCarritoFirebaseId = await getFirebase.get();
                let getCarritoById = getAllCarrito.filter(data => data.id === id_carrito);
                console.log(getCarritoById)
                let getProductById = getCarritoById.map(data => data.productos.filter(dato => dato.id !== id_prod));
                console.log(getProductById[0])
                getCarritoFirebaseId.forEach(async (element) => {
                    if (element.data().id === id_carrito) {
                        return await getFirebase.doc(element.id).set({...getProductById});
                    }
                })
                return {"response": `Productos eliminados con id ${id_prod} en carrito ${id_carrito}`}
            }
            let getCarritoById = getAllCarrito.filter(data => data.id === id_carrito);
            if (getCarritoById.length !== 0) {
                let getNewListProduct = getCarritoById.map(data => data.productos.filter(data => data.id !== id_prod))[0]
                let sendData = {
                    "id": getCarritoById[0].id,
                    "timestamp": time,
                    "productos": getNewListProduct
                }
                console.log(getNewListProduct)
                getAllCarrito.splice(id_carrito - 1, 1);
                getAllCarrito.push(sendData);
                getAllCarrito.sort((prev, current) => (prev.id - current.id))
                await fs.promises.writeFile(`${this.url}`, JSON.stringify(getAllCarrito, null, 2))
            } else {
                return {"Error": `No hay carrito con id ${id_carrito}`}
            }    
        } catch (error) {
            console.log(error);
        }
    }

    async newId(data) {
        try {
            if (data.length === 0 || data.length === 1) {
                // tengo ue solucionarlo
                return data.length + 1;
            }
            let idMax = data.reduce((prev, current) => {
                let valorId = isNaN(prev) ? prev.id : prev 
                if (valorId > current.id){
                    return valorId;
                } else {
                    return current.id;
                }
            })
            return idMax + 1;
        } catch (error) {
            console.log(error);
        }
    }

}

module.exports = Carrito;