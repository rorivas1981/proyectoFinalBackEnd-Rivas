const express = require('express');
const ProductManager = require('./productManager');
const CartManager = require('./cartManager');
const fs = require('fs');

//Genero un ID aleatorio
function generateProductId() {
    return Math.floor(Math.random() * 1000);
}

const app = express();
const PORT = 8080;

const productManager = new ProductManager('productos.json');
const cartManager = new CartManager('carrito.json');

app.use(express.json());

//Obtengo lista de carritos desde file json
async function getCartList() {
    try {
        const data = await fs.promises.readFile('carrito.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

//Guardo lista de carritos en file json
async function saveCartList(cartList) {
    await fs.promises.writeFile('carrito.json', JSON.stringify(cartList, null, 2));
}

//Listo todos los productos
app.get('/api/products/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.json(products);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error' });
    }
});

//Obtener producto por ID
app.get('/api/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;

        const product = await productManager.getProductById(parseInt(pid));
        if (!product) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.json(product);

    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ error: 'Error' });
    }
});

//Agrego nuevo producto
app.post('/api/products/', async (req, res) => {
    try {
        const { title, description, code, price, stock, category, thumbnails } = req.body;
        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const id = generateProductId();

        const newProduct = {
            id,
            title,
            description,
            code,
            price,
            status: true,
            stock,
            category,
            thumbnails: thumbnails || []
        };

        const product = await productManager.addProduct(newProduct);

        res.json(product);
    } catch (error) {
        console.error('Error al agregar producto:', error);
        res.status(500).json({ error: 'Error' });
    }
});

//Actualizar producto por ID
app.put('/api/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const updatedProduct = req.body;

        const product = await productManager.updateProduct(parseInt(pid), updatedProduct);

        res.json(product);
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error' });
    }
});

//Eliminar producto por ID
app.delete('/api/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;

        await productManager.deleteProduct(parseInt(pid));

        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error' });
    }
});

//Crear nuevo carrito
app.post('/api/carts/', async (req, res) => {
    try {

        const newCartId = Date.now().toString();

        const newCart = {
            id: newCartId,
            products: []
        };

        const cartList = await getCartList();

        cartList.push(newCart);

        await saveCartList(cartList);
        res.status(200).json({ message: 'Nuevo carrito creado', cartId: newCartId });
    } catch (error) {
        console.error('Error al crear un nuevo carrito:', error);
        res.status(500).json({ error: 'Error' });
    }
});

//Listar productos de carrito por ID
app.get('/api/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        const cartList = await getCartList();

        const cart = cartList.find(cart => cart.id === cid);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        res.status(200).json(cart.products);
    } catch (error) {
        console.error('Error al obtener productos del carrito:', error);
        res.status(500).json({ error: 'Error' });
    }
});

//Agrego producto al carrito elegido
app.post('/api/carts/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (!quantity || isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ error: 'La cantidad del producto debe ser un número entero mayor que 0' });
        }

        let cartList = await getCartList();

        const cartIndex = cartList.findIndex(cart => cart.id === cid);
        if (cartIndex === -1) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        const cart = cartList[cartIndex];


        const productIndex = cart.products.findIndex(product => product.id === pid);
        if (productIndex !== -1) {

            cart.products[productIndex].quantity += parseInt(quantity);
        } else {

            cart.products.push({ id: pid, quantity: parseInt(quantity) });
        }


        cartList[cartIndex] = cart;
        await saveCartList(cartList);

        res.status(200).json({ message: `Producto ${pid} agregado al carrito ${cid}` });
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ error: 'Error' });
    }
});

//Eliminar producto de carrito elegido
app.delete('/api/carts/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        let cartList = await getCartList();

        const cartIndex = cartList.findIndex(cart => cart.id === cid);
        if (cartIndex === -1) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        const cart = cartList[cartIndex];

        const productIndex = cart.products.findIndex(product => product.id === pid);
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
        }

        cart.products.splice(productIndex, 1);

        cartList[cartIndex] = cart;
        await saveCartList(cartList);
        res.status(200).json({ message: `Producto ${pid} eliminado del carrito ${cid}` });
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
        res.status(500).json({ error: 'Error' });
    }
});


app.get('/', (req, res) => {
    res.send('¡Bienvenido a JBL LOVERS!');
});


app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
