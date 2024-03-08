const fs = require('fs');

class ProductManager {
    constructor(filePath) {
        this.filePath = filePath;
    }

    async getProducts() {
        try {
            const data = await fs.promises.readFile(this.filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error obteniendo productos:', error);
            throw error;
        }
    }

    async getProductById(pid) {
        try {
            const products = await this.getProducts();
            return products.find(product => product.id === pid);
        } catch (error) {
            console.error('Error obteniendo producto:', error);
            throw error;
        }
    }

    async addProduct(newProduct) {
        try {
            let products = await this.getProducts();
            newProduct.id = products.length + 1;
            products.push(newProduct);
            await fs.promises.writeFile(this.filePath, JSON.stringify(products, null, 2));
            return newProduct;
        } catch (error) {
            console.error('Error agregando producto:', error);
            throw error;
        }
    }

    async deleteProduct(pid) {
        try {
            let products = await this.getProducts();
        
            products = products.filter(product => product.id !== pid);
          
            await fs.promises.writeFile(this.filePath, JSON.stringify(products, null, 2));
        } catch (error) {
            console.error('Error eliminando producto:', error);
            throw error;
        }
    }
    
    async updateProduct(pid, updatedProduct) {
        try {
            let products = await this.getProducts();
            const index = products.findIndex(product => product.id === pid);
            if (index !== -1) {
                products[index] = { ...products[index], ...updatedProduct };
                await fs.promises.writeFile(this.filePath, JSON.stringify(products, null, 2));
                return products[index];
            } else {
                throw new Error('Producto no encontrado');
            }
        } catch (error) {
            console.error('Error actualizando producto:', error);
            throw error;
        }
    }
 
}

module.exports = ProductManager;
