/**
 * Glory Empire - E-Commerce Engine & Application Script
 */

// 1. GLOBAL STORE CONFIGURATION
const STORE_CONFIG = {
  currencySymbol: 'GH₵',
  whatsappPhone: '233540952697',
  vipMonthlyFee: 50.00
};

// 2. PRODUCT CATALOG DATA ARRAY
const PRODUCTS = [
  {
    id: "ge-prod-001",
    title: "Unisex Designer Comfort Sandals",
    category: "Footwear & Sandals",
    badge: "Trending",
    retailPrice: 150.00,
    vipPrice: 110.00,
    wholesalePrice: 95.00,
    description: "Durable, high-comfort luxury slides built for daily casual wear. Designed with weather-resistant materials for everyday durability.",
    images: [
      "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80"
    ],
    colors: ["Black", "Brown", "White"],
    sizes: ["39", "40", "41", "42", "43", "44"]
  },
  {
    id: "ge-prod-002",
    title: "Smart Watch Series 9 (iOS & Android Compatible)",
    category: "Phones & Laptops",
    badge: "Hot Sale",
    retailPrice: 280.00,
    vipPrice: 220.00,
    wholesalePrice: 190.00,
    description: "Full HD touchscreen smartwatch featuring fitness tracking, WhatsApp alert synchronization, heart rate monitoring, and extended battery performance.",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80"
    ],
    colors: ["Space Gray", "Silver", "Rose Gold"],
    sizes: ["45mm Standard"]
  },
  {
    id: "ge-prod-003",
    title: "Luxury Gold Plated Cuban Chain",
    category: "Chains & Accessories",
    badge: "VIP Choice",
    retailPrice: 120.00,
    vipPrice: 85.00,
    wholesalePrice: 70.00,
    description: "Heavyweight tarnish-resistant gold plated chain designed for long-lasting shine and durability.",
    images: [
  "images/chains.webp"
],
    colors: ["Gold", "Silver"],
    sizes: ["20 Inch", "24 Inch"]
  },
  {
    id: "ge-prod-004",
    title: "Oud Royale EDP Perfume - 100ml",
    category: "Perfumes & Beauty",
    badge: "New Arrival",
    retailPrice: 210.00,
    vipPrice: 165.00,
    wholesalePrice: 140.00,
    description: "Long-lasting premium oriental fragrance with deep notes of agarwood, amber, and subtle vanilla notes.",
    images: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80"
    ],
    colors: ["Original Bottle"],
    sizes: ["100ml"]
  }
];

// 3. STATE MANAGEMENT
let state = {
  products: [...PRODUCTS],
  activeCategory: "All Items",
  searchQuery: "",
  cart: JSON.parse(localStorage.getItem('ge_cart')) || [],
  wishlist: JSON.parse(localStorage.getItem('ge_wishlist')) || [],
  isVip: JSON.parse(localStorage.getItem('ge_is_vip')) || false,
  currency: localStorage.getItem('ge_currency') || STORE_CONFIG.currencySymbol,
  deliveryCity: localStorage.getItem('ge_city') || 'Kumasi',
  activeModalProduct: null,
  selectedColor: "",
  selectedSize: "",
  selectedQty: 1
};

// 4. RENDER PRODUCTS TO GRID
function renderProducts() {
  const productGrid = document.getElementById('productGrid');
  const resultsCount = document.getElementById('resultsCount');
  if (!productGrid) return;

  const filtered = state.products.filter(p => {
    const matchesCategory = state.activeCategory === "All Items" || p.category === state.activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(state.searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (resultsCount) resultsCount.textContent = filtered.length;

  if (filtered.length === 0) {
    productGrid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-sm text-gray-500 dark:text-gray-400">No products found matching your current filter.</p>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = filtered.map(p => {
    const displayPrice = state.isVip ? p.vipPrice : p.retailPrice;
    const isWishlisted = state.wishlist.some(item => item.id === p.id);

    return `
      <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
        <div class="relative aspect-square bg-gray-100 dark:bg-gray-800 cursor-pointer overflow-hidden" onclick="openProductModal('${p.id}')">
          <img src="${p.images[0]}" alt="${p.title}" class="w-full h-full object-cover hover:scale-105 transition duration-300">
          <span class="absolute top-2 left-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            ${p.badge}
          </span>
          <button onclick="event.stopPropagation(); toggleWishlist('${p.id}')" class="absolute top-2 right-2 p-1.5 rounded-full ${isWishlisted ? 'bg-brand text-white' : 'bg-white/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-200'} transition">
            ♥
          </button>
        </div>

        <div class="p-3.5 flex flex-col flex-1 justify-between">
          <div>
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">${p.category}</span>
            <h4 class="font-bold text-xs text-gray-900 dark:text-white line-clamp-1 mt-0.5 cursor-pointer" onclick="openProductModal('${p.id}')">
              ${p.title}
            </h4>
          </div>

          <div class="mt-3">
            <div class="flex items-baseline gap-1.5">
              <span class="text-sm font-black text-gray-900 dark:text-white">
                ${state.currency} ${displayPrice.toFixed(2)}
              </span>
              ${state.isVip ? `<span class="text-[10px] text-gray-400 line-through">${state.currency} ${p.retailPrice.toFixed(2)}</span>` : ''}
            </div>

            <div class="mt-2.5 flex items-center gap-1.5">
              <button onclick="openProductModal('${p.id}')" class="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-900 dark:text-white font-bold text-[11px] py-2 rounded-xl transition">
                View Specs
              </button>
              <button onclick="quickAddToCart('${p.id}')" class="bg-black dark:bg-brand hover:bg-gray-800 text-white p-2 rounded-xl transition">
                + Add
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 5. CATEGORY CHIPS RENDER & FILTERING
function renderCategoryChips() {
  const container = document.getElementById('categoryChips');
  if (!container) return;

  const categories = ["All Items", Footwear & Sandals", "Phones & Laptops", "Chains & Accessories", "Perfumes & Beauty"];
  
  container.innerHTML = categories.map(cat => {
    const isActive = state.activeCategory === cat;
    return `
      <button onclick="setCategory('${cat}')" class="px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
        isActive 
          ? 'bg-brand text-white shadow-sm' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }">
        ${cat}
      </button>
    `;
  }).join('');
}

function setCategory(cat) {
  state.activeCategory = cat;
  renderCategoryChips();
  renderProducts();
}

// 6. PRODUCT DETAIL MODAL & VARIANTS
function openProductModal(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  state.activeModalProduct = product;
  state.selectedColor = product.colors[0] || "";
  state.selectedSize = product.sizes[0] || "";
  state.selectedQty = 1;

  document.getElementById('pDetailCategory').textContent = product.category;
  document.getElementById('pDetailBadge').textContent = product.badge;
  document.getElementById('pDetailTitle').textContent = product.title;
  document.getElementById('pDetailDescription').textContent = product.description;
  document.getElementById('pDetailRetailPrice').textContent = `${state.currency} ${product.retailPrice.toFixed(2)}`;
  document.getElementById('pDetailVipPrice').textContent = `${state.currency} ${product.vipPrice.toFixed(2)}`;
  document.getElementById('pDetailWholesalePrice').textContent = `${state.currency} ${product.wholesalePrice.toFixed(2)}`;
  document.getElementById('pDetailMainImage').src = product.images[0];
  document.getElementById('pDetailQty').textContent = state.selectedQty;

  // Render Thumbnails
  const thumbsContainer = document.getElementById('pDetailThumbnails');
  if (thumbsContainer) {
    thumbsContainer.innerHTML = product.images.map(img => `
      <img src="${img}" class="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition" onclick="document.getElementById('pDetailMainImage').src = '${img}'">
    `).join('');
  }

  // Render Colors
  renderVariantOptions('colorOptions', product.colors, state.selectedColor, (val) => {
    state.selectedColor = val;
    renderVariantOptions('colorOptions', product.colors, state.selectedColor, arguments.callee);
  });

  // Render Sizes
  renderVariantOptions('sizeOptions', product.sizes, state.selectedSize, (val) => {
    state.selectedSize = val;
    renderVariantOptions('sizeOptions', product.sizes, state.selectedSize, arguments.callee);
  });

  updateModalTotal();
  document.getElementById('productDetailModal').classList.remove('hidden');
}

function renderVariantOptions(containerId, options, selectedVal, onSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = options.map(opt => `
    <button type="button" data-val="${opt}" class="variant-btn border px-3 py-1.5 text-xs font-bold rounded-lg transition ${
      opt === selectedVal 
        ? 'border-brand bg-brand/10 text-brand' 
        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
    }">
      ${opt}
    </button>
  `).join('');

  container.querySelectorAll('.variant-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const val = e.currentTarget.getAttribute('data-val');
      if (containerId === 'colorOptions') state.selectedColor = val;
      if (containerId === 'sizeOptions') state.selectedSize = val;
      renderVariantOptions(containerId, options, val, onSelect);
    });
  });
}

function updateModalTotal() {
  if (!state.activeModalProduct) return;
  const unitPrice = state.isVip ? state.activeModalProduct.vipPrice : state.activeModalProduct.retailPrice;
  const total = unitPrice * state.selectedQty;
  document.getElementById('pDetailTotalPrice').textContent = `${state.currency} ${total.toFixed(2)}`;
}

// Quantity Adjusters
document.getElementById('qtyDecreaseBtn')?.addEventListener('click', () => {
  if (state.selectedQty > 1) {
    state.selectedQty--;
    document.getElementById('pDetailQty').textContent = state.selectedQty;
    updateModalTotal();
  }
});

document.getElementById('qtyIncreaseBtn')?.addEventListener('click', () => {
  state.selectedQty++;
  document.getElementById('pDetailQty').textContent = state.selectedQty;
  updateModalTotal();
});

// Single Product Direct Order via WhatsApp
document.getElementById('pDetailOrderBtn')?.addEventListener('click', () => {
  const p = state.activeModalProduct;
  if (!p) return;

  const unitPrice = state.isVip ? p.vipPrice : p.retailPrice;
  const total = unitPrice * state.selectedQty;
  const text = `*New Direct Order - Glory Empire*%0A%0A` +
               `*Item:* ${p.title}%0A` +
               `*Color:* ${state.selectedColor}%0A` +
               `*Size/Variant:* ${state.selectedSize}%0A` +
               `*Quantity:* ${state.selectedQty}%0A` +
               `*VIP Discount Applied:* ${state.isVip ? 'Yes' : 'No'}%0A` +
               `*Total Amount:* ${state.currency} ${total.toFixed(2)}%0A` +
               `*Delivery Town:* ${state.deliveryCity}`;

  window.open(`https://wa.me/${STORE_CONFIG.whatsappPhone}?text=${text}`, '_blank');
});

// 7. CART & WISHLIST ENGINE
function quickAddToCart(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const cartItem = {
    id: product.id,
    title: product.title,
    color: product.colors[0] || 'Default',
    size: product.sizes[0] || 'Standard',
    retailPrice: product.retailPrice,
    vipPrice: product.vipPrice,
    qty: 1,
    image: product.images[0]
  };

  const existingIndex = state.cart.findIndex(i => i.id === product.id && i.color === cartItem.color && i.size === cartItem.size);
  if (existingIndex > -1) {
    state.cart[existingIndex].qty += 1;
  } else {
    state.cart.push(cartItem);
  }

  saveCart();
  updateCartUI();
  openCartDrawer();
}

function saveCart() {
  localStorage.setItem('ge_cart', JSON.stringify(state.cart));
}

function toggleWishlist(productId) {
  const index = state.wishlist.findIndex(i => i.id === productId);
  if (index > -1) {
    state.wishlist.splice(index, 1);
  } else {
    const product = state.products.find(p => p.id === productId);
    if (product) state.wishlist.push(product);
  }
  localStorage.setItem('ge_wishlist', JSON.stringify(state.wishlist));
  updateBadges();
  renderProducts();
}

function updateBadges() {
  const cartCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const cartBadge = document.getElementById('cartBadge');
  const wishlistBadge = document.getElementById('wishlistBadge');
  const floatingCartBadge = document.getElementById('floatingCartBadge');

  if (cartBadge) cartBadge.textContent = cartCount;
  if (wishlistBadge) wishlistBadge.textContent = state.wishlist.length;
  if (floatingCartBadge) floatingCartBadge.textContent = cartCount;
}

function updateCartUI() {
  updateBadges();

  const cartItemsList = document.getElementById('cartItemsList');
  const cartHeaderBadge = document.getElementById('cartHeaderBadge');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartSavings = document.getElementById('cartSavings');
  const cartGrandTotal = document.getElementById('cartGrandTotal');
  const floatingCartBar = document.getElementById('floatingCartBar');

  const totalItems = state.cart.reduce((sum, i) => sum + i.qty, 0);
  if (cartHeaderBadge) cartHeaderBadge.textContent = `${totalItems} items`;

  let subtotal = 0;
  let totalSavings = 0;

  if (state.cart.length === 0) {
    if (cartItemsList) {
      cartItemsList.innerHTML = `
        <div class="text-center py-12">
          <p class="text-sm text-gray-400">Your shopping cart is currently empty.</p>
        </div>
      `;
    }
    if (floatingCartBar) floatingCartBar.classList.add('hidden');
  } else {
    if (floatingCartBar) floatingCartBar.classList.remove('hidden');

    if (cartItemsList) {
      cartItemsList.innerHTML = state.cart.map((item, index) => {
        const itemPrice = state.isVip ? item.vipPrice : item.retailPrice;
        const itemTotal = itemPrice * item.qty;
        subtotal += itemTotal;
        
        if (state.isVip) {
          totalSavings += (item.retailPrice - item.vipPrice) * item.qty;
        }

        return `
          <div class="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
            <img src="${item.image}" class="w-14 h-14 object-cover rounded-lg">
            <div class="flex-1">
              <h5 class="font-bold text-xs text-gray-900 dark:text-white line-clamp-1">${item.title}</h5>
              <p class="text-[10px] text-gray-400">${item.color} | ${item.size}</p>
              <div class="text-xs font-black text-brand mt-1">${state.currency} ${itemTotal.toFixed(2)}</div>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="changeCartQty(${index}, -1)" class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-bold">-</button>
              <span class="text-xs font-bold">${item.qty}</span>
              <button onclick="changeCartQty(${index}, 1)" class="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-bold">+</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  if (cartSubtotal) cartSubtotal.textContent = `${state.currency} ${(subtotal + totalSavings).toFixed(2)}`;
  if (cartSavings) cartSavings.textContent = `- ${state.currency} ${totalSavings.toFixed(2)}`;
  if (cartGrandTotal) cartGrandTotal.textContent = `${state.currency} ${subtotal.toFixed(2)}`;

  // Floating Bar Text Updates
  const floatingCartCountText = document.getElementById('floatingCartCountText');
  const floatingCartTotal = document.getElementById('floatingCartTotal');
  if (floatingCartCountText) floatingCartCountText.textContent = `${totalItems} Items`;
  if (floatingCartTotal) floatingCartTotal.textContent = `${state.currency} ${subtotal.toFixed(2)}`;
}

function changeCartQty(index, delta) {
  if (state.cart[index]) {
    state.cart[index].qty += delta;
    if (state.cart[index].qty <= 0) {
      state.cart.splice(index, 1);
    }
    saveCart();
    updateCartUI();
  }
}

// Multi-Item Order via WhatsApp
document.getElementById('whatsappCheckoutBtn')?.addEventListener('click', () => {
  if (state.cart.length === 0) return;

  let orderSummary = `*Multi-Item Order - Glory Empire*%0A%0A`;
  let grandTotal = 0;

  state.cart.forEach((item, idx) => {
    const price = state.isVip ? item.vipPrice : item.retailPrice;
    const total = price * item.qty;
    grandTotal += total;
    orderSummary += `${idx + 1}. *${item.title}*%0A   - Variant: ${item.color} / ${item.size}%0A   - Qty: ${item.qty} x ${state.currency}${price.toFixed(2)} = ${state.currency}${total.toFixed(2)}%0A`;
  });

  orderSummary += `%0A*VIP Discount Status:* ${state.isVip ? 'Active VIP Member' : 'Standard Buyer'}`;
  orderSummary += `%0A*Grand Total:* ${state.currency} ${grandTotal.toFixed(2)}`;
  orderSummary += `%0A*Delivery City:* ${state.deliveryCity}`;

  window.open(`https://wa.me/${STORE_CONFIG.whatsappPhone}?text=${orderSummary}`, '_blank');
});

document.getElementById('clearCartBtn')?.addEventListener('click', () => {
  state.cart = [];
  saveCart();
  updateCartUI();
});

// 8. DRAWER & MODAL TOGGLE HANDLERS
function openCartDrawer() {
  const overlay = document.getElementById('cartDrawerOverlay');
  const panel = document.getElementById('cartDrawerPanel');
  if (overlay && panel) {
    overlay.classList.remove('hidden');
    setTimeout(() => panel.classList.remove('translate-x-full'), 10);
  }
}

function closeCartDrawer() {
  const overlay = document.getElementById('cartDrawerOverlay');
  const panel = document.getElementById('cartDrawerPanel');
  if (overlay && panel) {
    panel.classList.add('translate-x-full');
    setTimeout(() => overlay.classList.add('hidden'), 300);
  }
}

// Corner Menu Three-Dot Drawer Toggle
document.getElementById('menuTriggerBtn')?.addEventListener('click', () => {
  const overlay = document.getElementById('drawerOverlay');
  const panel = document.getElementById('drawerPanel');
  if (overlay && panel) {
    overlay.classList.remove('hidden');
    setTimeout(() => panel.classList.remove('translate-x-full'), 10);
  }
});

function closeCornerDrawer() {
  const overlay = document.getElementById('drawerOverlay');
  const panel = document.getElementById('drawerPanel');
  if (overlay && panel) {
    panel.classList.add('translate-x-full');
    setTimeout(() => overlay.classList.add('hidden'), 300);
  }
}

// Event Listeners for Closing Overlays
document.getElementById('closeDrawerBtn')?.addEventListener('click', closeCornerDrawer);
document.getElementById('drawerOverlay')?.addEventListener('click', (e) => {
  if (e.target.id === 'drawerOverlay') closeCornerDrawer();
});

document.getElementById('cartBtn')?.addEventListener('click', openCartDrawer);
document.getElementById('openCartDrawerBtn')?.addEventListener('click', openCartDrawer);
document.getElementById('closeCartDrawerBtn')?.addEventListener('click', closeCartDrawer);
document.getElementById('cartDrawerOverlay')?.addEventListener('click', (e) => {
  if (e.target.id === 'cartDrawerOverlay') closeCartDrawer();
});

document.getElementById('closeProductModalBtn')?.addEventListener('click', () => {
  document.getElementById('productDetailModal').classList.add('hidden');
});

// VIP Modal Triggers
document.getElementById('joinVipBtn')?.addEventListener('click', openVipModal);
document.getElementById('menuVipHubBtn')?.addEventListener('click', () => {
  closeCornerDrawer();
  openVipModal();
});

function openVipModal() {
  const modal = document.getElementById('vipModal');
  if (modal) modal.classList.remove('hidden');
}

document.getElementById('closeVipModalBtn')?.addEventListener('click', () => {
  document.getElementById('vipModal').classList.add('hidden');
});

// Settings Modal Controls
document.getElementById('menuSettingsBtn')?.addEventListener('click', () => {
  closeCornerDrawer();
  document.getElementById('settingsModal').classList.remove('hidden');
});

document.getElementById('closeSettingsBtn')?.addEventListener('click', () => {
  document.getElementById('settingsModal').classList.add('hidden');
});

// Dark Mode Switcher & Settings Persistence
document.getElementById('darkModeToggle')?.addEventListener('click', () => {
  const html = document.documentElement;
  html.classList.toggle('dark');
  const isDark = html.classList.contains('dark');
  localStorage.setItem('ge_theme', isDark ? 'dark' : 'light');
});

document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
  const cityInput = document.getElementById('settingCityInput').value;
  const currSelect = document.getElementById('settingCurrencySelect').value;

  if (cityInput) {
    state.deliveryCity = cityInput;
    localStorage.setItem('ge_city', cityInput);
  }
  if (currSelect) {
    state.currency = currSelect;
    localStorage.setItem('ge_currency', currSelect);
  }

  document.getElementById('settingsModal').classList.add('hidden');
  renderProducts();
  updateCartUI();
});

// 9. PAYSTACK VIP SUBSCRIPTION INITIALIZATION
document.getElementById('paystackVipBtn')?.addEventListener('click', () => {
  const name = document.getElementById('vipCustomerName')?.value || 'Valued Customer';
  const email = document.getElementById('vipCustomerEmail')?.value;

  if (!email) {
    alert('Please enter a valid email or contact address to proceed with VIP registration.');
    return;
  }

  if (typeof PaystackPop === 'undefined') {
    alert('Paystack SDK is loading or unavailable. Check your internet connection.');
    return;
  }

  const handler = PaystackPop.setup({
    key: 'pk_test_sample_key', // Replace with your live Paystack public key
    email: email,
    amount: STORE_CONFIG.vipMonthlyFee * 100, // Amount in pesewas
    currency: 'GHS',
    ref: 'GE_VIP_' + Math.floor((Math.random() * 1000000000) + 1),
    callback: function(response) {
      state.isVip = true;
      localStorage.setItem('ge_is_vip', JSON.stringify(true));
      alert('Congratulations! VIP Membership successfully activated.');
      document.getElementById('vipModal').classList.add('hidden');
      updateVipBadgeUI();
      renderProducts();
      updateCartUI();
    },
    onClose: function() {
      alert('VIP subscription process was canceled.');
    }
  });

  handler.openIframe();
});

function updateVipBadgeUI() {
  const vipStatusBadge = document.getElementById('vipStatusBadge');
  const drawerVipStatus = document.getElementById('drawerVipStatus');

  if (state.isVip) {
    if (vipStatusBadge) {
      vipStatusBadge.textContent = 'Active Member';
      vipStatusBadge.className = 'text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-500 text-white';
    }
    if (drawerVipStatus) {
      drawerVipStatus.textContent = 'Status: 👑 VIP Member';
    }
  }
}

// 10. SEARCH LISTENERS & INITIALIZATION
function setupSearchListeners() {
  const desktopSearch = document.getElementById('searchInput');
  const mobileSearch = document.getElementById('mobileSearchInput');

  const handleSearch = (e) => {
    state.searchQuery = e.target.value;
    renderProducts();
  };

  if (desktopSearch) desktopSearch.addEventListener('input', handleSearch);
  if (mobileSearch) mobileSearch.addEventListener('input', handleSearch);
}

// Initial Load Handler
document.addEventListener('DOMContentLoaded', () => {
  // Theme check
  const savedTheme = localStorage.getItem('ge_theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }

  renderCategoryChips();
  renderProducts();
  updateCartUI();
  updateVipBadgeUI();
  setupSearchListeners();
});