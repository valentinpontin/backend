const addListeners = () => {
    const addToCartButtons = document.querySelectorAll('.addToCart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

const addToCart = async (event) => {
    const productId = event.target.dataset.id;
    let cartId = localStorage.getItem('cartId');
    if (!cartId) {
        const createCartFetch = await fetch('/api/carts', {
          method: 'POST'
        });

        const result = await createCartFetch.json();
        if (result.status === 1) {
            cartId = result.cartId;
            localStorage.setItem('cartId', cartId);
          } else {
            console.error('Error al crear un nuevo carrito');
          };
    }

    const addProductFetch = await fetch(`/api/carts/${cartId}/products/${productId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const result = await addProductFetch.json();
    if (result.status === 1) {
        alert(`Producto agregado al carrito ${cartId} exitosamente!`);
    } else {
        alert(`Error al agregar el producto al carrito ${result.errorObject.message}`);
    }
}

addListeners();