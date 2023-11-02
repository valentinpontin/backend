import ProductsModel from '../models/products.model.js';
import EnumErrors from '../../utils/errorHandler/enum.js';
import FloweryCustomError from '../../utils/errorHandler/FloweryCustomError.js';

class ProductMongoManager {
  constructor() {
    this.productsModel = ProductsModel;
  }

  getProducts = async (limit = 10, page = 1, sort, category, available) => {
    try {
      let query = this.productsModel.find();
      if (category) {
        const trimmedCategory = category.trim();
        const categoryRegex = new RegExp(`^${trimmedCategory}$`, 'i');
        query = query.where('category').equals(categoryRegex);
      }
      if (available) {
        const lowerAvailable = available.toLowerCase();
        if (lowerAvailable === 'true') {
          query = query.where('stock').gt(0);
        } else {
          query = query.where('stock').equals(0);
        }
      }
      if (sort) {
        const lowerSort = sort.toLowerCase();
        if (lowerSort === 'asc') {
          query = query.sort({ price: 1 });
        } else {
          query = query.sort({ price: -1 });
        }
      }

      const products = await this.productsModel.paginate(query, {
        limit: parseInt(limit) || 10,
        lean: true,
        page: parseInt(page) || 1,
        customLabels: {
          docs: 'products',
          totalDocs: 'totalProducts',
        }
      });

      return products;
    } catch (error) {
      FloweryCustomError.createError({
        name: 'getProducts Error',
        message: `Failed to retrieve: ${error.message}`,
        type: EnumErrors.DATABASE_ERROR.type,
        statusCode: EnumErrors.DATABASE_ERROR.statusCode
      });
    }
  }

  addProduct = async (newFields) => {
    try {
      const newProduct = await this.productsModel.create(newFields);
      return newProduct;
    } catch (error) {
      FloweryCustomError.createError({
        name: 'addProduct Error',
        message: `Failed to add product: ${error.message}`,
        type: EnumErrors.DATABASE_ERROR.type,
        statusCode: EnumErrors.DATABASE_ERROR.statusCode
      });
    }
  }

  getProductById = async (productId) => {
    try {
      const product = await this.productsModel.findById(productId);
      return product;
    } catch (error) {
      FloweryCustomError.createError({
        name: 'getProductById Error',
        message: `Failed to retrieve: ${error.message}`,
        type: EnumErrors.DATABASE_ERROR.type,
        statusCode: EnumErrors.DATABASE_ERROR.statusCode
      });
    }
  }

  getProductByCode = async (productCode) => {
    try {
      const product = await this.productsModel.findOne({ code: productCode });
      return product;
    } catch (error) {
      FloweryCustomError.createError({
        name: 'getProductByCode Error',
        message: `Failed to retrieve: ${error.message}`,
        type: EnumErrors.DATABASE_ERROR.type,
        statusCode: EnumErrors.DATABASE_ERROR.statusCode
      });
    }
  }

  deleteProduct = async (productId) => {
    try {
      const product = await this.productsModel.findByIdAndDelete(productId);
      if (!product) {
        FloweryCustomError.createError({
          name: 'deleteProduct Error',
          message: 'Product not found',
          type: EnumErrors.DATABASE_ERROR.type,
          statusCode: EnumErrors.DATABASE_ERROR.statusCode
        });        
      }
    } catch (error) {
      FloweryCustomError.createError({
        name: 'deleteProduct Error',
        message: `Failed to delete product: ${error.message}`,
        type: EnumErrors.DATABASE_ERROR.type,
        statusCode: EnumErrors.DATABASE_ERROR.statusCode
      });
    }
  }

  updateProduct = async (productId, updatedFields) => {
    try {
      const { code, price, stock, thumbnails, ...otherFields } = updatedFields;
      const updatedProduct = await this.productsModel.findByIdAndUpdate(
        productId,
        {
          $set: {
            ...otherFields,
            ...(code && { code }),
            ...(price && { price }),
            stock: stock !== undefined ? stock : 0,
            ...(thumbnails && { thumbnails }),
          },
        },
        { new: true, runValidators: true }
      );

      if (!updatedProduct) {
        FloweryCustomError.createError({
          name: 'updateProduct Error',
          message: 'Product not found',
          type: EnumErrors.DATABASE_ERROR.type,
          statusCode: EnumErrors.DATABASE_ERROR.statusCode
        });        
      }

      return updatedProduct;

    } catch (error) {
      FloweryCustomError.createError({
        name: 'deleteProduct Error',
        message: `Failed to update product: ${error.message}`,
        type: EnumErrors.DATABASE_ERROR.type,
        statusCode: EnumErrors.DATABASE_ERROR.statusCode
      });
    }
  }
}

export default ProductMongoManager;
