/**
 * SUIT YOURSELF - Store Logic
 * Handles cart management, API calls, and UI interactions
 */

const Store = {
  cartId: null,
  cart: null,
  
  // =================================================================
  // INITIALIZATION
  // =================================================================
  
  init() {
    this.cartId = this.getCartId();
    this.loadCart();
  },
  
  getCartId() {
    let cartId = localStorage.getItem('suityourself_cart_id');
    if (!cartId) {
      cartId = 'cart_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('suityourself_cart_id', cartId);
    }
    return cartId;
  },
  
  // =================================================================
  // PRODUCT API
  // =================================================================
  
  async getProducts(category = '') {
    const url = category ? `/api/products?category=${category}` : '/api/products';
    const response = await fetch(url);
    return response.json();
  },
  
  async getProduct(id) {
    const response = await fetch(`/api/products/${id}`);
    return response.json();
  },
  
  // =================================================================
  // CART API
  // =================================================================
  
  async loadCart() {
    try {
      const response = await fetch(`/api/cart/${this.cartId}`);
      this.cart = await response.json();
      this.updateCartUI();
    } catch (error) {
      console.error('Failed to load cart:', error);
      this.cart = { items: [], subtotal: 0 };
    }
  },
  
  async getCart() {
    if (!this.cart) {
      await this.loadCart();
    }
    return this.cart;
  },
  
  async addToCart(productId, size, quantity = 1) {
    try {
      const response = await fetch(`/api/cart/${this.cartId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, size, quantity })
      });
      this.cart = await response.json();
      this.updateCartUI();
      return this.cart;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  },
  
  async removeFromCart(itemId) {
    try {
      const response = await fetch(`/api/cart/${this.cartId}/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });
      this.cart = await response.json();
      this.updateCartUI();
      return this.cart;
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  },
  
  async updateCartItem(itemId, quantity) {
    try {
      const response = await fetch(`/api/cart/${this.cartId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity })
      });
      this.cart = await response.json();
      this.updateCartUI();
      return this.cart;
    } catch (error) {
      console.error('Failed to update cart:', error);
      throw error;
    }
  },
  
  clearCart() {
    localStorage.removeItem('suityourself_cart_id');
    this.cartId = null;
    this.cart = null;
  },
  
  // =================================================================
  // UI UPDATES
  // =================================================================
  
  updateCartUI() {
    // Update cart count in header
    const countEl = document.getElementById('cart-count');
    if (countEl && this.cart) {
      const totalItems = this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
      countEl.textContent = totalItems;
    }
    
    // Update cart drawer
    this.renderCartDrawer();
  },
  
  renderCartDrawer() {
    const itemsEl = document.getElementById('cart-items');
    const footerEl = document.getElementById('cart-footer');
    const subtotalEl = document.getElementById('cart-subtotal');
    
    if (!itemsEl || !this.cart) return;
    
    if (this.cart.items.length === 0) {
      itemsEl.innerHTML = `
        <div class="cart-empty">
          <p>Your bag is empty</p>
          <a href="/products.html" class="btn btn-secondary" style="margin-top: 1rem;">Shop Now</a>
        </div>
      `;
      if (footerEl) footerEl.style.display = 'none';
      return;
    }
    
    itemsEl.innerHTML = this.cart.items.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p>Size: ${item.size}</p>
          <p class="cart-item-price">$${item.price.toFixed(2)}</p>
          <button class="cart-item-remove" onclick="Store.removeFromCart('${item.id}')">Remove</button>
        </div>
      </div>
    `).join('');
    
    if (footerEl) footerEl.style.display = 'block';
    if (subtotalEl) subtotalEl.textContent = `$${this.cart.subtotal.toFixed(2)}`;
  }
};

// =================================================================
// CART DRAWER FUNCTIONS (Global)
// =================================================================

function openCart() {
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function toggleMenu() {
  // Mobile menu toggle - implement as needed
}

// Make Store globally available
window.Store = Store;
