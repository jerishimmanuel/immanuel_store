const state = {
  products: [],
  cart: [],
  user: null
};

let toastTimer = null;

const STORAGE_KEYS = {
  user: 'codealpha-user',
  cart: 'codealpha-cart',
  theme: 'codealpha-theme',
  remember: 'codealpha-remember'
};

function getUser() {
  const stored = localStorage.getItem(STORAGE_KEYS.user);
  return stored ? JSON.parse(stored) : null;
}

function saveUser(user) {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  state.user = user;
}

function clearUser() {
  localStorage.removeItem(STORAGE_KEYS.user);
  state.user = null;
}

function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastTimer = setTimeout(() => {
    toast.remove();
    if (!container.children.length) {
      container.remove();
    }
  }, 3000);
}

function getCart() {
  const stored = localStorage.getItem(STORAGE_KEYS.cart);
  return stored ? JSON.parse(stored) : [];
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  state.cart = cart;
}

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme || 'light');
  localStorage.setItem(STORAGE_KEYS.theme, theme || 'light');
}

function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || 'light';
  applyTheme(savedTheme);
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  }
}

function toggleTheme() {
  const current = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(current);
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.textContent = current === 'dark' ? '☀️' : '🌙';
  }
}

function updateAuthStatus() {
  const statusEl = document.getElementById('auth-status');
  const user = getUser();
  if (statusEl) {
    if (user) {
      statusEl.textContent = `Signed in as ${user.name}. You can add to cart and place orders.`;
    } else {
      statusEl.textContent = 'Please login to start shopping.';
    }
  }
}

async function loadProducts() {
  const searchBox = document.getElementById('search-box');
  const categoryFilter = document.getElementById('category-filter');
  const search = searchBox ? searchBox.value : '';
  const category = categoryFilter ? categoryFilter.value : '';
  const query = new URLSearchParams({ search, category }).toString();
  const response = await fetch(`/api/products?${query}`);
  state.products = await response.json();
  renderProducts();
}

function renderProducts() {
  const container = document.getElementById('product-list');
  if (!container) return;
  container.innerHTML = '';
  state.products.forEach((product) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p><strong>₹${product.price.toLocaleString('en-IN')}</strong></p>
      <div class="inline-actions">
        <button onclick="viewProduct(${product.id})" type="button">View Details</button>
        <button onclick="addToCart(${product.id})" type="button">Add to Cart</button>
      </div>
    `;
    container.appendChild(card);
  });
}

async function viewProduct(id) {
  const response = await fetch(`/api/products/${id}`);
  const product = await response.json();
  const detail = document.getElementById('product-detail');
  if (detail) {
    detail.innerHTML = `
      <h2>${product.name}</h2>
      <p>${product.description}</p>
      <p><strong>₹${product.price.toLocaleString('en-IN')}</strong></p>
      <button onclick="addToCart(${product.id})" type="button">Add to Cart</button>
    `;
  }
}

function addToCart(id) {
  const user = getUser();
  if (!user) {
    showToast('Please register or login first to add items to your cart.', 'error');
    setTimeout(() => {
      window.location.href = '/login';
    }, 900);
    return;
  }

  const product = state.products.find((item) => item.id === id);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
  if (window.location.pathname === '/cart') {
    renderCartPage();
  }
  showToast(`${product.name} added to your cart.`, 'success');
}

function removeCartItem(id) {
  const cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
  renderCartPage();
}

function renderCartPage() {
  const cartItems = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const noteEl = document.getElementById('delivery-note');
  if (!cartItems || !totalEl) return;

  const cart = getCart();
  if (!cart.length) {
    cartItems.innerHTML = '<p>Your cart is empty.</p>';
    totalEl.textContent = '0';
    if (noteEl) {
      noteEl.textContent = 'Enter your address to place an order.';
    }
    return;
  }

  cartItems.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <div>
        <strong>${item.name}</strong>
        <div class="small">Qty: ${item.quantity} · ₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
      </div>
      <button onclick="removeCartItem(${item.id})" type="button">Remove</button>
    </div>
  `).join('');
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  totalEl.textContent = total.toLocaleString('en-IN');
  if (noteEl) {
    noteEl.textContent = 'Delivery usually reaches you within 4 days.';
  }
}

async function registerUser(event) {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (response.ok) {
      saveUser(result);
      showToast(`Welcome, ${result.name}!`, 'success');
      setTimeout(() => {
        window.location.href = '/cart';
      }, 900);
    } else {
      showToast(result.message || 'Registration failed', 'error');
    }
  } catch (error) {
    showToast('Registration failed. Please try again.', 'error');
  }
}

async function loginUser(event) {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (response.ok) {
      saveUser(result);
      showToast(`Logged in as ${result.name}`, 'success');
      setTimeout(() => {
        window.location.href = '/cart';
      }, 900);
    } else {
      showToast(result.message || 'Login failed', 'error');
    }
  } catch (error) {
    showToast('Login failed. Please try again.', 'error');
  }
}

async function placeOrder() {
  const user = getUser();
  const cart = getCart();
  const address = document.getElementById('delivery-address')?.value?.trim();
  if (!cart.length) {
    showToast('Add items to your cart first.', 'error');
    return;
  }
  if (!user) {
    showToast('Please register or login first.', 'error');
    setTimeout(() => {
      window.location.href = '/login';
    }, 900);
    return;
  }
  if (!address) {
    showToast('Please enter your delivery address.', 'error');
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: cart,
      customerName: user.name,
      customerEmail: user.email,
      address,
      total
    })
  });
  const result = await response.json();
  if (response.ok) {
    const eta = new Date(result.eta);
    showToast(`Order placed successfully! ID: ${result.id}. Delivery expected by ${eta.toDateString()}.`, 'success');
    saveCart([]);
    renderCartPage();
    if (document.getElementById('delivery-address')) {
      document.getElementById('delivery-address').value = '';
    }
  } else {
    showToast(result.message || 'Order failed', 'error');
  }
}

function logoutUser() {
  clearUser();
  updateAuthStatus();
  showToast('You have been logged out.', 'info');
}

function initPage() {
  initTheme();
  updateAuthStatus();
  state.user = getUser();
  state.cart = getCart();

  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', toggleTheme);
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', registerUser);
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', loginUser);
  }

  const checkoutButton = document.getElementById('checkout-btn');
  if (checkoutButton) {
    checkoutButton.addEventListener('click', placeOrder);
  }

  const logoutButton = document.getElementById('logout-btn');
  if (logoutButton) {
    logoutButton.addEventListener('click', logoutUser);
  }

  const settingsButton = document.getElementById('save-settings');
  if (settingsButton) {
    settingsButton.addEventListener('click', () => {
      const select = document.getElementById('theme-select');
      if (select) {
        applyTheme(select.value);
        showToast('Settings saved.', 'success');
      }
    });
  }

  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.value = document.body.getAttribute('data-theme') || 'light';
  }

  const searchBox = document.getElementById('search-box');
  if (searchBox) {
    searchBox.addEventListener('input', loadProducts);
  }

  const categoryFilter = document.getElementById('category-filter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', loadProducts);
  }

  document.querySelectorAll('.category-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const category = chip.getAttribute('data-category');
      const filter = document.getElementById('category-filter');
      if (filter) {
        filter.value = category;
        loadProducts();
      }
    });
  });

  if (document.getElementById('product-list')) {
    loadProducts();
  }

  if (document.getElementById('cart-items')) {
    renderCartPage();
  }
}

initPage();
window.viewProduct = viewProduct;
window.addToCart = addToCart;
window.removeCartItem = removeCartItem;
window.toggleTheme = toggleTheme;
window.logoutUser = logoutUser;