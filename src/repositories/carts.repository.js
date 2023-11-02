export default class CartsRepository {
        
        constructor(dao) {
            this.dao = dao;
        }
    
        createCart = async () => {
            const newCart = await this.dao.createCart();
            return newCart;
        }

        getCartById = async (cartId) => {
            const cart = await this.dao.getCartById(cartId);
            return cart;
        }

        updateCartProducts = async (cartId, newCartProducts) => {
            const cart = await this.dao.updateCartProducts(cartId, newCartProducts);
            return cart;
        }
    
    }
