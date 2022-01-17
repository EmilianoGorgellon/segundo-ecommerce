const fs = require("fs");
class Products {
    constructor(url, db_client, db_collection, db_name){
        this.url = url,
        this.db_client = db_client,
        this.db_collection = db_collection,
        this.db_name = db_name
    }

    async getAll() {
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
            let getAllProducts = await fs.promises.readFile(`${this.url}`, 'utf-8');
            return JSON.parse(getAllProducts);
        } catch (error) {
            console.log(error);
        }
    }

    async getProductById(id) {
        try {
            let getAllProducts = await this.getAll();
            id = parseInt(id.id);
            if (id !== undefined && !Number.isNaN(id)) {
                if(id <= 0){
                    return { "error": `No hay producto con id: ${id.id}`}
                }
                let getProduct = getAllProducts.filter(data => data.id === id);
                return getProduct.length !== 0 ? getProduct : `Error no hay productos con id: ${id}`;
            } 
            return getAllProducts;
        } catch (error) {
            console.log(error);
        }
    }


    async sendProduct(data) {
        try {
            if (this.db_name === "sqlite3") {
                await this.db_client.from(`${this.db_collection}`).insert(data);
                return {"response" : `Producto agregado`}
            }
            let getAllProducts = await this.getAll();
            let newId = await this.newId(getAllProducts);
            let sendData = {
                "id": newId,
                ...data
            }
            if (this.db_name === "mongo") {
                return await this.db_client.create(sendData);
            } else if (this.db_name === "firebase") {
                return await this.db_client.collection(`${this.db_collection}`).doc().set(sendData);
            }
            getAllProducts.push(sendData)
            await fs.promises.writeFile(`${this.url}`, JSON.stringify(getAllProducts, null, 2));
            return sendData;
        } catch (error) {
            console.log(error)
        }
    }

    async newId(data) {
        try {
            if (data.length === 0) {
                return 1;
            } else if (data.length === 1) {
                return 2;
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
    
    async updateProduct(id, updateData){
        try {
            id = parseInt(id.id)
            if (id >= 1){
                if (this.db_name === "sqlite3") {
                    await this.db_client.from(`${this.db_collection}`).where({id: id}).update({...updateData});
                    return {"response": `Producto actualizado con id: ${id}`}
                }
                let newProduct = {
                    "id": id,
                    ...updateData
                }
                if (this.db_name === "mongo") {
                    await this.db_client.updateOne({id:id}, {...updateData})
                    return {"response" : `Producto actualizado con id: ${id}`}
                } else if (this.db_name === "firebase") {
                    let getProductos = await this.db_client.collection(`${this.db_collection}`).get();
                    let productoActualizado = false;
                    getProductos.forEach(async element => {
                        if (element.data().id === id) {
                            productoActualizado = true;
                            await this.db_client.collection(`${this.db_collection}`).doc(element.id).update({id:id, ...updateData});
                            return;
                        }
                    })
                    return productoActualizado ? {"response" : `Producto actualizado en id: ${id}`} : {"response" : `No existe producto ${id}`}
                }
                let getAllProducts = await this.getAll();
                getAllProducts.splice(id - 1, 1, newProduct);
                await fs.promises.writeFile(`${this.url}`, JSON.stringify(getAllProducts, null, 2))
                return newProduct;
            }
            return {"error": `No hay producto con el id ${id}`}
        } catch (error) {
            console.log(error);
        }
    }

    async deleteProduct(id){
        try {
            id = parseInt(id.id);
            if (this.db_name === "mongo") {
                await this.db_client.deleteOne({id: id});
                return {"response": `Producto eliminado con id: ${id}`}
            } else if (this.db_name === "sqlite3") {
                await this.db_client.from(`${this.db_collection}`).where({id: id}).del();
                return {"response" : `Producto eliminado con id: ${id}`}
            } else if (this.db_name === "firebase") {
                let getProductos = await this.db_client.collection(`${this.db_collection}`).get();
                let productoEliminado = false;
                getProductos.forEach(async element => {
                    if (element.data().id === id) {
                        productoEliminado = true;
                        return await this.db_client.collection(`${this.db_collection}`).doc(element.id).delete();
                    }
                })
                return productoEliminado ? {"response": `Producto eliminado con id: ${id}`} : {"response": `No hay producto con id: ${id}`}                
            }
            let getAllProducts = await this.getAll();
            let newAllProducts = getAllProducts.filter(data => data.id !== id);
            let deleteProduct = getAllProducts.filter(data => data.id === id);
            await fs.promises.writeFile(`${this.url}`, JSON.stringify(newAllProducts, null, 2));
            return deleteProduct;
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = Products;