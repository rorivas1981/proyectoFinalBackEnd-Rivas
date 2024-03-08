const fs = require('fs');

class CartManager {
    constructor(filePath) {
        this.filePath = filePath;
        
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '[]');
        }
    }

    async createCart() {
        try {
            const carts = await this.getCarts();
            const newCart = {
                id: Math.floor(Math.random() * 1000), 
                products: [] 
            };
            carts.push(newCart);
            await this.writeCarts(carts);
            return newCart;
        } catch (error) {
            console.error('Error creando carrito:', error);
            throw error;
        }
    }

    async getCartById(cid) {
        try {
            const carts = await this.getCarts();
            return carts.find(cart => cart.id == cid);
        } catch (error) {
            console.error('Error obteniendo carrito:', error);
            throw error;
        }
    }

    async addProductToCart(cid, pid, quantity) {
        try {
            const carts = await this.getCarts();
            const cartIndex = carts.findIndex(cart => cart.id == cid);

          
            if (cartIndex === -1) {
                throw new Error('Carrito no encontrado');
            }

            
            const existingProductIndex = carts[cartIndex].products.findIndex(product => product.product === pid);

            if (existingProductIndex !== -1) {
                
                carts[cartIndex].products[existingProductIndex].quantity++;
            } else {
               
                carts[cartIndex].products.push({ product: pid, quantity: quantity });
            }

            
            await this.writeCarts(carts);

            return carts[cartIndex];
        } catch (error) {
            console.error('Error agregando producto al carrito:', error);
            throw error;
        }
    }

    async getCarts() {
        try {
            const data = await fs.promises.readFile(this.filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error obteniendo carritos:', error);
            throw error;
        }
    }

    async writeCarts(carts) {
        try {
            await fs.promises.writeFile(this.filePath, JSON.stringify(carts, null, 2));
        } catch (error) {
            console.error('Error escribiendo carritos en el archivo:', error);
            throw error;
        }
    }

}

module.exports = CartManager;
