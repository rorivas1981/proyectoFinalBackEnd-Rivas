const express = require('express');

function productRoutes(productManager) {
    const router = express.Router();

    router.get('/', async (req, res) => {
        try {

            res.json(await productManager.getProducts());
        } catch (error) {
            console.error('Error obteniendo productos:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });

    router.get('/:pid', async (req, res) => {
        try {
            const { pid } = req.params;
            const product = await productManager.getProductById(parseInt(pid));
            if (!product) {
                res.status(404).json({ error: 'Producto no encontrado' });
                return;
            }
            res.json(product);
        } catch (error) {
            console.error('Error obteniendo producto:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });


    return router;
}

module.exports = productRoutes;
