import { productsUpdated } from "../utils/socketUtils.js";
import { ProductService } from "../services/products.services.js";

const productService = new ProductService();

const getProducts = async (req, res, next) => {
    try {
        const { limit = 10, page = 1, sort, category, available } = req.query;
        const baseUrl = `${req.protocol}://${req.get('host')}${req.originalUrl.split('?')[0]}`;
        const products = await productService.getProducts(limit, page, sort, category, available, baseUrl);
        res.send({ status: 1, ...products });
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const product = await productService.getProductById(productId)
        res.send({ status: 1, product: product });
    } catch (error) {
        next(error);
    }
};

const addProduct = async (req, res, next) => {
    try {
        const newProductFields = req.body;
        const files = req.files;
        const filesUrls = files.map(file => `${process.env.APP_URL}/files/uploads/products/${file.filename}`);
        if (filesUrls.length > 0) {
            newProductFields.thumbnails = filesUrls;
        } else {
            newProductFields.thumbnails = [];
        }
        if (req.user.role === 'premium') {
            newProductFields.owner = req.user.email;
        }
        const newProduct = await productService.addProduct(newProductFields);
        productsUpdated(req.app.get('io'));
        res.send({ status: 1, msg: 'Product added successfully', product: newProduct });
    } catch (error) {
        next(error);
    }
};

const updateProductById = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const updatedProductFields = req.body;
        if (Object.keys(req.body).length === 0) throw new Error('Empty request body');
        const updatedProduct = await productService.updateProduct(productId, updatedProductFields, req.user);
        productsUpdated(req.app.get('io'));
        res.send({ status: 1, msg: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        next(error);
    }
};

const deleteProductById = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        await productService.deleteProduct(productId, req.user);

        productsUpdated(req.app.get('io'));
        res.send({ status: 1, msg: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const getMockingProducts = async (req, res, next) => {
    try {
        const products = await productService.getMockingProducts();
        res.send({ status: 1, products: products });
    } catch (error) {
        next(error);
    }
};

export default {
    getProducts,
    getProductById,
    addProduct,
    updateProductById,
    deleteProductById,
    getMockingProducts
};
