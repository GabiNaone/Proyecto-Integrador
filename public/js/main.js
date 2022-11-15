class Main {

    async ajax(url, method = 'get') {
        return await fetch(url, { method: method }).then(r => r.text());
    }

    getIdFromHash() {
        let id = location.hash.slice(1);
        if (id[0] === '/') {
            id = id.slice(1);
        }
        return id || 'inicio';
    }

    getViewUrlFromId(id) {
        return `views/${id}.html`;
    }

    getModuleUrlFromId(id) {
        return `./modules/${id}.js`;
    }

    setActiveLink(id) {
        const links = document.querySelectorAll('.main-nav__link');
        links.forEach(link => {
            if (link.getAttribute('href') === `#/${id}`) {
                link.classList.add('main-nav__link--active');
                link.ariaCurrent = 'page';
            } else {
                link.classList.remove('main-nav__link--active');
                link.removeAttribute('aria-current');
            }
        });
    }

    async initJS(id) {
        const moduleUrl = this.getModuleUrlFromId(id);
        try {
            const {default: module} = await import(moduleUrl);
            if (typeof module.init !== 'function') {
                console.error(`El módulo ${id} no posee un método init().`);
                return;
            }
            module.init();
        } catch (error) {
            console.error(`No se pudo importar el módulo ${moduleUrl}.`);
        }
    }

    async loadTemplate() {
        const id = this.getIdFromHash();
        const idTitle = id[0].toUpperCase() + id.substring(1);

        const viewUrl = this.getViewUrlFromId(id);
        const viewContent = await this.ajax(viewUrl);
        document.querySelector('main').innerHTML = viewContent;
        document.querySelector('title').innerHTML = `${idTitle} - Jugueteria Cósmica`;

        this.setActiveLink(id);

        this.initJS(id);
    }

    async loadTemplates() {
        this.loadTemplate();
        window.addEventListener('hashchange', () => this.loadTemplate());
    }

    async start() {
        await this.loadTemplates();
    }
}

const main = new Main();
main.start();

///////////////////////////////////////////////////////////////////////////////

// Variables modal

let cartBtn = document.querySelector('.cart-button-image');
let cartModal = document.querySelector('.cart-modal-container');
let cartCloseModal = document.querySelector('.cart-modal__close');


// Cambia la apariencia del carrito.
cartBtn.addEventListener('click', e =>{
    cartBtn.classList.toggle('main-header__cart-button-container--active');
    cartModal.classList.toggle('cart-modal-container--enabled');
})

// Se cierra el modal presinando Esc.
document.addEventListener('keydown', e =>{
    if (e.key == 'Escape'){
        cartModal.classList.remove('cart-modal-container--enabled');
        cartBtn.classList.remove('main-header__cart-button-container--active');
        return;
    }
    
})

// Se cierra el modal haciendo click en la X.
cartCloseModal.addEventListener('click', e =>{
    cartModal.classList.toggle('cart-modal-container--enabled');
    cartBtn.classList.toggle('main-header__cart-button-container--active');
    return;
});

const shoppingCartItemsContainer = document.querySelector('.shoppingCartItemsContainer');

// Se cierra el modal haciendo click cualquier parte de la pantalla.

document.addEventListener('click', e =>{    
    if(e.target != cartModal && e.target.parentNode != cartModal && e.target != cartBtn){
        cartModal.classList.remove('cart-modal-container--enabled');
        cartBtn.classList.remove('main-header__cart-button-container--active');
        return;
    }
});

const addToCartClicked = (e) => {
    const btn = e.target;
    const product = btn.closest('.card__article');
    const itemPrice = product.querySelector('.card__price').textContent; 
    const itemTitle = product.querySelector('.card__heading').textContent;
    const itemImage = product.querySelector('.card__image').src;

    addItemToShoppingCart(itemTitle, itemPrice, itemImage);
};

// Se agrega al carrito los produnctos seleccionados
const addToShoppingCartButtons = document.querySelectorAll('.card__link');
addToShoppingCartButtons.forEach((addToCartButton) => {
    addToCartButton.addEventListener('click', addToCartClicked);
});

const updateShoppingCartTotal = () => {
    let total = 0;
    const shoppingCartTotal = document.querySelector('.shoppingCartTotal');

    const shoppingCartItems = document.querySelectorAll('.shoppingCartItem');

    shoppingCartItems.forEach((shoppingCartItem) => {
        const shoppingCartItemPriceElement = shoppingCartItem.querySelector('.shoppingCartItemPrice');
        const shoppingCartItemPrice = Number(
        shoppingCartItemPriceElement.textContent.replace('$', '')
    );

    const shoppingCartItemQuantityElement = shoppingCartItem.querySelector('.shoppingCartItemQuantity');
        const shoppingCartItemQuantity = Number(shoppingCartItemQuantityElement.value);

        total = total + shoppingCartItemPrice * shoppingCartItemQuantity;
    });
    shoppingCartTotal.innerHTML = `$${total.toFixed(2)}`;
};

//Funcion agregar al carrito

const addItemToShoppingCart = (itemTitle, itemPrice, itemImage) => {
        const elementsTitle = shoppingCartItemsContainer.getElementsByClassName('shoppingCartItemTitle');

        for (let i = 0; i < elementsTitle.length; i++) {
            if (elementsTitle[i].innerText === itemTitle) {

            let elementQuantity = elementsTitle[i].parentElement.parentElement.parentElement.querySelector('.shoppingCartItemQuantity');
            elementQuantity.value++;
            updateShoppingCartTotal();
            return;
            }
        }

        const shoppingCartRow = document.createElement('tr');
        shoppingCartRow.classList.add('shoppingCartItem');
        const shoppingCartContent = `
                <td class="shopping-cart-item">
                    <img src=${itemImage} class="shopping-cart-image">
                </td>
                <td class="shopping-cart-item-title shoppingCartItemTitle">
                    ${itemTitle}
                </td>
                <td class="shopping-cart-price item-price shoppingCartItemPrice"> 
                    ${itemPrice}
                </td>
                <td class="shopping-cart-quantity">
                    <input class="shopping-cart-quantity-input shoppingCartItemQuantity" type="number" value="1">
                    <button class="btnDelete" type="button">X</button>
                </td>`;

        shoppingCartRow.innerHTML = shoppingCartContent;
        shoppingCartItemsContainer.append(shoppingCartRow);

        shoppingCartRow.querySelector('.btnDelete').addEventListener('click', removeShoppingCartItem);

        shoppingCartRow.querySelector('.shoppingCartItemQuantity').addEventListener('change', quantityChanged);

        updateShoppingCartTotal();
};

const removeShoppingCartItem = (e) => {
    const buttonClicked = e.target;
    buttonClicked.closest('.shoppingCartItem').remove();
    updateShoppingCartTotal();
};

const quantityChanged = (e) => {
    const input = e.target;
    input.value <= 0 ? (input.value = 1) : null;
    updateShoppingCartTotal();
};

const comprarButtonClicked = () => {
    shoppingCartItemsContainer.innerHTML = '';
    updateShoppingCartTotal();
};

