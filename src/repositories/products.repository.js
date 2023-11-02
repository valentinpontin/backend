export default class ProductsRepository {

    constructor(dao) {
        this.dao = dao;
    }

    getProducts = async ( limit = 10, page = 1, sort, category, available ) => {
        const products = await this.dao.getProducts(limit, page, sort, category, available);
        return products;
    }

    getProductById = async (id) => {
        const product = await this.dao.getProductById(id);
        return product;
    }

    addProduct = async (product) => {
        const newProduct = await this.dao.addProduct(product);
        return newProduct;
    }

    updateProduct = async (id, product) => {
        const updatedProduct = await this.dao.updateProduct(id, product);
        return updatedProduct;
    }

    deleteProduct = async (id) => {
        const deletedProduct = await this.dao.deleteProduct(id);
        return deletedProduct;
    }

    getProductByCode = async (code) => {
        const product = await this.dao.getProductByCode(code);
        return product;
    }
}
