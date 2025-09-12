import { getLocalStorage, setLocalStorage } from './utils.mjs';

export default class productDetails 
{
    constructor(productId, dataSource) {
        this.productID = productId;
        this.product = {};
        this.dataSource = dataSource;
    }

    async init() {
        this.product = await this.dataSource.findProductById(this.productId);
        this.renderProductDetails();

        document.getElementById('addToCart')
            .addEventListener('click', this.addToCart.bind(this));
    }

    addProductToCart() {
       const cartItem = getLocalStorage("so-cart") || [];
       cartItem.push(this.product);
       setLocalStorage("so-cart", cartItem); 
    }

    renderProductDetails() {
        productDetailsTemplate(this.product);
    }
}

