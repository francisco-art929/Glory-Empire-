// js/app.js - Glory Empire Master Script (Includes Phase 6 Cart Engine & WhatsApp Multi-Checkout)

// 1. CONFIGURATION & STATE
const GLORY_EMPIRE_CONFIG = {
  whatsappNumber: "233540952697", // Replace with your actual WhatsApp line
  paystackPublicKey: "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" // Replace with your Paystack Public Key
};

let selectedProduct = null;
let selectedColor = "";
let selectedSize = "";
let selectedQuantity = 1;

// Phase 5 State
let currentCategory = "All";
let searchQuery = "";

// Phase 6 Cart State (Persisted in localStorage)
let cart = JSON.parse(localStorage.getItem("ge_cart") || "[]");

// 2. DOM CONTENT LOADED INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initDrawerAndModals();
  initProductDetailModal();
  initVipSubscriptionModal();
  initSearchAndFilters();
  initCartEngine();
  
  if (typeof storeProducts !== "undefined") {
    renderCategoryChips();
    filterAndRenderProducts();
  }

  updateCartUI();
});

// 3. PHASE 6: CART ENGINE & MULTI-ITEM CHECKOUT LOGIC
function initCartEngine() {
  const openBtn = document.getElementById("openCartDrawerBtn");
  const closeBtn = document.getElementById("closeCartDrawerBtn");
  const clearBtn = document.getElementById("clearCartBtn");
  const checkoutBtn = document.getElementById("whatsappCheckoutBtn");

  const overlay = document.getElementById("cartDrawerOverlay");
  const panel = document.getElementById("cartDrawerPanel");

  const openCart = () => {
    overlay?.classList.remove("hidden");
    setTimeout(() => panel?.classList.remove("translate-x-full"), 10);
  };

  const closeCart = () => {
    panel?.classList.add("translate-x-full");
    setTimeout(() => overlay?.classList.add("hidden"), 200);
  };

  openBtn?.addEventListener("click", openCart);
  closeBtn?.addEventListener("click", closeCart);
  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) closeCart();
  });

  clearBtn?.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      cart = [];
      saveCart();
      updateCartUI();
    }
  });

  checkoutBtn?.addEventListener("click", handleMultiItemCheckout);
}

function saveCart() {
  localStorage.setItem("ge_cart", JSON.stringify(cart));
}

function addToCart(productId, quantity = 1, color = "", size = "") {
  if (typeof storeProducts === "undefined") return;
  const product = storeProducts.find(p => p.id === productId);
  if (!product) return;

  const itemKey = `${productId}-${color}-${size}`;
  const existingItem = cart.find(item => item.key === itemKey);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      key: itemKey,
      id: product.id,
      title: product.title,
      image: product.images[0],
      retailPrice: product.retailPrice,
      vipPrice: product.vipPrice,
      wholesalePrice: product.wholesalePrice,
      wholesaleMinQty: product.wholesaleMinQty,
      color: color,
      size: size,
      quantity: quantity
    });
  }

  saveCart();
  updateCartUI();
}

function removeFromCart(itemKey) {
  cart = cart.filter(item => item.key !== itemKey);
  saveCart();
  updateCartUI();
}

function updateCartItemQuantity(itemKey, change) {
  const item = cart.find(i => i.key === itemKey);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    removeFromCart(itemKey);
  } else {
    saveCart();
    updateCartUI();
  }
}

function calculateItemUnitPrice(item, isVip) {
  // Apply wholesale pricing if min quantity met, otherwise VIP or Retail
  if (item.quantity >= item.wholesaleMinQty) {
    return item.wholesalePrice;
  }
  return isVip ? item.vipPrice : item.retailPrice;
}

function updateCartUI() {
  const isVip = localStorage.getItem("ge_is_vip") === "true";
  const cartList = document.getElementById("cartItemsList");
  const floatingBar = document.getElementById("floatingCartBar");
  
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Update Badges & Headers
  const floatingBadge = document.getElementById("floatingCartBadge");
  const floatingCountText = document.getElementById("floatingCartCountText");
  const headerBadge = document.getElementById("cartHeaderBadge");

  if (floatingBadge) floatingBadge.innerText = totalItemCount;
  if (floatingCountText) floatingCountText.innerText = `${totalItemCount} Item${totalItemCount === 1 ? '' : 's'}`;
  if (headerBadge) headerBadge.innerText = `${totalItemCount} item${totalItemCount === 1 ? '' : 's'}`;

  // Toggle Floating Bar Visibility
  if (totalItemCount > 0) {
    floatingBar?.classList.remove("hidden");
    setTimeout(() => floatingBar?.classList.remove("translate-y-24"), 10);
  } else {
    floatingBar?.classList.add("translate-y-24");
    setTimeout(() => floatingBar?.classList.add("hidden"), 300);
  }

  // Calculate Subtotals, Savings & Totals
  let grandTotal = 0;
  let standardTotal = 0;

  cart.forEach(item => {
    const activePrice = calculateItemUnitPrice(item, isVip);
    grandTotal += activePrice * item.quantity;
    standardTotal += item.retailPrice * item.quantity;
  });

  const totalSavings = standardTotal - grandTotal;

  document.getElementById("floatingCartTotal").innerText = `GH₵ ${grandTotal.toFixed(2)}`;
  document.getElementById("cartSubtotal").innerText = `GH₵ ${standardTotal.toFixed(2)}`;
  document.getElementById("cartSavings").innerText = `- GH₵ ${Math.max(0, totalSavings).toFixed(2)}`;
  document.getElementById("cartGrandTotal").innerText = `GH₵ ${grandTotal.toFixed(2)}`;

  // Render Items List inside Drawer
  if (!cartList) return;

  if (cart.length === 0) {
    cartList.innerHTML = `
      <div class="text-center py-12 text-gray-400 dark:text-gray-500">
        <div class="text-3xl mb-2">🛍️</div>
        <p class="text-xs font-bold text-gray-700 dark:text-gray-300">Your cart is empty</p>
        <p class="text-[11px]">Explore products and add items to place a multi-order.</p>
      </div>
    `;
    return;
  }

  cartList.innerHTML = cart.map(item => {
    const activePrice = calculateItemUnitPrice(item, isVip);
    const itemSubtotal = activePrice * item.quantity;
    const isWholesaleTier = item.quantity >= item.wholesaleMinQty;

    return `
      <div class="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-800">
        <img src="${item.image}" alt="${item.title}" class="w-14 h-14 rounded-lg object-cover shrink-0">
        <div class="flex-1 min-w-0">
          <h5 class="text-xs font-bold text-gray-900 dark:text-white truncate">${item.title}</h5>
          <p class="text-[10px] text-gray-500 dark:text-gray-400">
            ${item.color ? `Color: ${item.color} ` : ''}${item.size ? `| Size: ${item.size}` : ''}
          </p>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs font-black text-brand">GH₵ ${activePrice.toFixed(2)}</span>
            ${isWholesaleTier ? `<span class="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded">Wholesale</span>` : ''}
          </div>
        </div>

        <div class="flex flex-col items-end gap-1.5">
          <button onclick="removeFromCart('${item.key}')" class="text-red-500 hover:text-red-700 text-[10px]">✕</button>
          <div class="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
            <button onclick="updateCartItemQuantity('${item.key}', -1)" class="px-2 py-0.5 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800">-</button>
            <span class="px-2 text-xs font-bold text-gray-900 dark:text-white">${item.quantity}</span>
            <button onclick="updateCartItemQuantity('${item.key}', 1)" class="px-2 py-0.5 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800">+</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function handleMultiItemCheckout() {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const isVip = localStorage.getItem("ge_is_vip") === "true";
  const userCity = localStorage.getItem("ge_user_city") || "Kumasi";

  let cartItemsText = "";
  let grandTotal = 0;

  cart.forEach((item, index) => {
    const activePrice = calculateItemUnitPrice(item, isVip);
    const lineTotal = activePrice * item.quantity;
    grandTotal += lineTotal;

    const variantDetails = [];
    if (item.color) variantDetails.push(`Color: ${item.color}`);
    if (item.size) variantDetails.push(`Size: ${item.size}`);
    const variantStr = variantDetails.length > 0 ? ` (${variantDetails.join(', ')})` : '';

    cartItemsText += `${index + 1}. *${item.title}*${variantStr}\n   Qty: ${item.quantity} pcs @ GH₵ ${activePrice.toFixed(2)} = GH₵ ${lineTotal.toFixed(2)}\n`;
  });

  const textMessage = 
    `Hello *Glory Empire*! I would like to place a *Multi-Item Order* from my cart:\n\n` +
    `📋 *ORDER SUMMARY:*\n${cartItemsText}\n` +
    `👤 *Customer Status:* ${isVip ? "👑 VIP Member" : "Standard Buyer"}\n` +
    `💵 *GRAND TOTAL:* GH₵ ${grandTotal.toFixed(2)}\n` +
    `🚚 *Delivery City:* ${userCity}\n\n` +
    `Please confirm stock availability and payment details.`;

  const encodedUrl = `https://wa.me/${GLORY_EMPIRE_CONFIG.whatsappNumber}?text=${encodeURIComponent(textMessage)}`;
  window.open(encodedUrl, '_blank');
}

// 4. SEARCH & CATEGORY FILTERING ENGINE
function initSearchAndFilters() {
  const searchInput = document.getElementById("searchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");

  searchInput?.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    
    if (searchQuery.length > 0) {
      clearSearchBtn?.classList.remove("hidden");
    } else {
      clearSearchBtn?.classList.add("hidden");
    }

    filterAndRenderProducts();
  });

  clearSearchBtn?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    searchQuery = "";
    clearSearchBtn?.classList.add("hidden");
    filterAndRenderProducts();
  });
}

function renderCategoryChips() {
  const container = document.getElementById("categoryChips");
  if (!container || typeof storeProducts === "undefined") return;

  const categories = ["All", ...new Set(storeProducts.map(p => p.category).filter(Boolean))];

  container.innerHTML = categories.map(cat => `
    <button onclick="selectCategory('${cat}')" 
            id="catChip-${cat.replace(/\s+/g, '-')}"
            class="chip-btn shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${cat === currentCategory ? 'bg-brand text-white shadow-sm' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'}">
      ${cat}
    </button>
  `).join('');
}

function selectCategory(cat) {
  currentCategory = cat;

  document.querySelectorAll(".chip-btn").forEach(btn => {
    btn.className = "chip-btn shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold transition bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800";
  });

  const activeChip = document.getElementById(`catChip-${cat.replace(/\s+/g, '-')}`);
  if (activeChip) {
    activeChip.className = "chip-btn shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold transition bg-brand text-white shadow-sm";
  }

  filterAndRenderProducts();
}

function filterAndRenderProducts() {
  if (typeof storeProducts === "undefined") return;

  let filtered = storeProducts;

  if (currentCategory !== "All") {
    filtered = filtered.filter(p => p.category === currentCategory);
  }

  if (searchQuery !== "") {
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(searchQuery) ||
      (p.category && p.category.toLowerCase().includes(searchQuery)) ||
      (p.badge && p.badge.toLowerCase().includes(searchQuery)) ||
      (p.description && p.description.toLowerCase().includes(searchQuery))
    );
  }

  const resultsCount = document.getElementById("resultsCount");
  const activeFilterLabel = document.getElementById("activeFilterLabel");
  
  if (resultsCount) resultsCount.innerText = filtered.length;
  if (activeFilterLabel) {
    if (currentCategory !== "All" || searchQuery !== "") {
      activeFilterLabel.classList.remove("hidden");
    } else {
      activeFilterLabel.classList.add("hidden");
    }
  }

  renderProductGrid(filtered);
}

// 5. RENDER PRODUCT GRID
function renderProductGrid(products) {
  const container = document.getElementById("productGrid");
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 px-4">
        <div class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
          🔍
        </div>
        <h4 class="text-sm font-bold text-gray-900 dark:text-white">No products found</h4>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search terms or category filter.</p>
        <button onclick="resetFilters()" class="mt-4 bg-brand text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-brand-dark transition">
          Reset All Filters
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div class="relative bg-gray-100 dark:bg-gray-800 aspect-square cursor-pointer" onclick="openProductModal('${product.id}')">
          <img src="${product.images[0]}" alt="${product.title}" class="w-full h-full object-cover">
          <span class="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-md">${product.badge}</span>
          ${product.stockCount <= 5 ? `<span class="absolute bottom-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">Only ${product.stockCount} left</span>` : ''}
        </div>
        <div class="p-3">
          <h4 onclick="openProductModal('${product.id}')" class="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 cursor-pointer hover:text-brand transition">${product.title}</h4>
          
          <div class="mt-2 space-y-1">
            <div class="flex items-baseline gap-2">
              <span class="text-base font-black text-brand">GH₵ ${product.retailPrice.toFixed(2)}</span>
              <span class="text-[11px] text-gray-400">Retail</span>
            </div>
            <div class="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
              👑 VIP: GH₵ ${product.vipPrice.toFixed(2)} / pc
            </div>
            <div class="text-[11px] text-gray-500 dark:text-gray-400">
              📦 Wholesale: GH₵ ${product.wholesalePrice.toFixed(2)} (Min: ${product.wholesaleMinQty} pcs)
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="p-3 pt-0 flex gap-2">
        <button onclick="addToCart('${product.id}', 1)" class="w-1/3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold text-xs py-2.5 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-1">
          + Cart
        </button>
        <button onclick="triggerWhatsAppOrder('${product.id}')" 
                class="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.122.553 4.195 1.604 6.01L0 24l6.104-1.603a12.003 12.003 0 005.927 1.568h.005c6.645 0 12.03-5.385 12.03-12.031C24.066 5.385 18.676 0 12.031 0z"/></svg>
          Buy Now
        </button>
      </div>
    </div>
  `).join('');
}

function resetFilters() {
  const searchInput = document.getElementById("searchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");

  if (searchInput) searchInput.value = "";
  searchQuery = "";
  clearSearchBtn?.classList.add("hidden");

  selectCategory("All");
}

// 6. PRODUCT DETAIL MODAL CONTROLLERS
function openProductModal(productId) {
  if (typeof storeProducts === "undefined") return;

  selectedProduct = storeProducts.find(p => p.id === productId);
  if (!selectedProduct) return;

  selectedQuantity = 1;
  selectedColor = selectedProduct.colors ? selectedProduct.colors[0] : "";
  selectedSize = selectedProduct.sizes ? selectedProduct.sizes[0] : "";

  document.getElementById("pDetailCategory").innerText = selectedProduct.category || "General";
  document.getElementById("pDetailBadge").innerText = selectedProduct.badge || "Popular";
  document.getElementById("pDetailTitle").innerText = selectedProduct.title;
  document.getElementById("pDetailDescription").innerText = selectedProduct.description || "No description provided.";
  document.getElementById("pDetailMainImage").src = selectedProduct.images[0];
  document.getElementById("pDetailQty").innerText = selectedQuantity;

  document.getElementById("pDetailRetailPrice").innerText = `GH₵ ${selectedProduct.retailPrice.toFixed(2)}`;
  document.getElementById("pDetailVipPrice").innerText = `GH₵ ${selectedProduct.vipPrice.toFixed(2)}`;
  document.getElementById("pDetailWholesalePrice").innerText = `GH₵ ${selectedProduct.wholesalePrice.toFixed(2)} (${selectedProduct.wholesaleMinQty}+ pcs)`;

  const thumbContainer = document.getElementById("pDetailThumbnails");
  thumbContainer.innerHTML = selectedProduct.images.map(img => `
    <img src="${img}" alt="Thumbnail" onclick="switchMainImage('${img}')" class="w-12 h-12 rounded-lg object-cover cursor-pointer border-2 border-transparent hover:border-brand transition shrink-0">
  `).join('');

  const colorContainer = document.getElementById("colorOptions");
  if (selectedProduct.colors && selectedProduct.colors.length > 0) {
    document.getElementById("colorPickerContainer").classList.remove("hidden");
    colorContainer.innerHTML = selectedProduct.colors.map(color => `
      <button onclick="selectColor('${color}')" id="colorBtn-${color}" class="color-btn border border-gray-300 dark:border-gray-700 px-3 py-1 rounded-lg text-xs font-semibold ${color === selectedColor ? 'bg-brand text-white border-brand' : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}">
        ${color}
      </button>
    `).join('');
  } else {
    document.getElementById("colorPickerContainer").classList.add("hidden");
  }

  const sizeContainer = document.getElementById("sizeOptions");
  if (selectedProduct.sizes && selectedProduct.sizes.length > 0) {
    document.getElementById("sizePickerContainer").classList.remove("hidden");
    sizeContainer.innerHTML = selectedProduct.sizes.map(size => `
      <button onclick="selectSize('${size}')" id="sizeBtn-${size}" class="size-btn border border-gray-300 dark:border-gray-700 px-3 py-1 rounded-lg text-xs font-semibold ${size === selectedSize ? 'bg-brand text-white border-brand' : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}">
        ${size}
      </button>
    `).join('');
  } else {
    document.getElementById("sizePickerContainer").classList.add("hidden");
  }

  updateTotalPrice();
  document.getElementById("productDetailModal").classList.remove("hidden");
}

function switchMainImage(imgUrl) {
  document.getElementById("pDetailMainImage").src = imgUrl;
}

function selectColor(color) {
  selectedColor = color;
  document.querySelectorAll(".color-btn").forEach(btn => {
    btn.classList.remove("bg-brand", "text-white", "border-brand");
    btn.classList.add("bg-gray-50", "dark:bg-gray-800", "text-gray-700", "dark:text-gray-200");
  });
  const activeBtn = document.getElementById(`colorBtn-${color}`);
  if (activeBtn) activeBtn.classList.add("bg-brand", "text-white", "border-brand");
}

function selectSize(size) {
  selectedSize = size;
  document.querySelectorAll(".size-btn").forEach(btn => {
    btn.classList.remove("bg-brand", "text-white", "border-brand");
    btn.classList.add("bg-gray-50", "dark:bg-gray-800", "text-gray-700", "dark:text-gray-200");
  });
  const activeBtn = document.getElementById(`sizeBtn-${size}`);
  if (activeBtn) activeBtn.classList.add("bg-brand", "text-white", "border-brand");
}

function updateTotalPrice() {
  if (!selectedProduct) return;
  const isVip = localStorage.getItem("ge_is_vip") === "true";
  let unitPrice = isVip ? selectedProduct.vipPrice : selectedProduct.retailPrice;

  if (selectedQuantity >= selectedProduct.wholesaleMinQty) {
    unitPrice = selectedProduct.wholesalePrice;
  }

  const grandTotal = unitPrice * selectedQuantity;
  document.getElementById("pDetailTotalPrice").innerText = `GH₵ ${grandTotal.toFixed(2)}`;
}

function initProductDetailModal() {
  const modal = document.getElementById("productDetailModal");
  const closeBtn = document.getElementById("closeProductModalBtn");
  const qtyDecreaseBtn = document.getElementById("qtyDecreaseBtn");
  const qtyIncreaseBtn = document.getElementById("qtyIncreaseBtn");
  const orderBtn = document.getElementById("pDetailOrderBtn");

  closeBtn?.addEventListener("click", () => modal.classList.add("hidden"));

  qtyDecreaseBtn?.addEventListener("click", () => {
    if (selectedQuantity > 1) {
      selectedQuantity--;
      document.getElementById("pDetailQty").innerText = selectedQuantity;
      updateTotalPrice();
    }
  });

  qtyIncreaseBtn?.addEventListener("click", () => {
    selectedQuantity++;
    document.getElementById("pDetailQty").innerText = selectedQuantity;
    updateTotalPrice();
  });

  orderBtn?.addEventListener("click", () => {
    if (!selectedProduct) return;

    // Add selected items directly to cart and open cart drawer
    addToCart(selectedProduct.id, selectedQuantity, selectedColor, selectedSize);
    modal.classList.add("hidden");

    const cartDrawerOverlay = document.getElementById("cartDrawerOverlay");
    const cartDrawerPanel = document.getElementById("cartDrawerPanel");
    cartDrawerOverlay?.classList.remove("hidden");
    setTimeout(() => cartDrawerPanel?.classList.remove("translate-x-full"), 10);
  });
}

// 7. PAYSTACK VIP SUBSCRIPTION ENGINE
function initVipSubscriptionModal() {
  const vipModal = document.getElementById("vipModal");
  const closeBtn = document.getElementById("closeVipModalBtn");
  const paystackBtn = document.getElementById("paystackVipBtn");
  const vipStatusBadge = document.getElementById("vipStatusBadge");

  const isVip = localStorage.getItem("ge_is_vip") === "true";
  if (isVip && vipStatusBadge) {
    vipStatusBadge.innerText = "👑 Active Member";
    vipStatusBadge.className = "text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-500 text-white";
  }

  document.querySelectorAll(".open-vip-modal-trigger").forEach(trigger => {
    trigger.addEventListener("click", () => {
      vipModal?.classList.remove("hidden");
    });
  });

  closeBtn?.addEventListener("click", () => vipModal?.classList.add("hidden"));

  paystackBtn?.addEventListener("click", () => {
    const nameInput = document.getElementById("vipCustomerName")?.value.trim();
    const emailInput = document.getElementById("vipCustomerEmail")?.value.trim();

    if (!nameInput || !emailInput) {
      alert("Please enter both your name and email/MoMo contact.");
      return;
    }

    if (typeof PaystackPop === "undefined") {
      alert("Paystack SDK failed to load. Please check your internet connection.");
      return;
    }

    const handler = PaystackPop.setup({
      key: GLORY_EMPIRE_CONFIG.paystackPublicKey,
      email: emailInput,
      amount: 3000,
      currency: "GHS",
      ref: "GE_VIP_" + Math.floor((Math.random() * 1000000000) + 1),
      metadata: {
        custom_fields: [{ display_name: "Customer Name", variable_name: "customer_name", value: nameInput }]
      },
      callback: function(response) {
        localStorage.setItem("ge_is_vip", "true");
        localStorage.setItem("ge_vip_ref", response.reference);
        
        if (vipStatusBadge) {
          vipStatusBadge.innerText = "👑 Active Member";
          vipStatusBadge.className = "text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-500 text-white";
        }

        vipModal?.classList.add("hidden");
        alert("🎉 Congratulations! Your VIP status is now ACTIVE. Enjoy VIP discounts on all orders!");
        filterAndRenderProducts();
        updateCartUI();
      },
      onClose: function() {
        alert("Payment window closed.");
      }
    });

    handler.openIframe();
  });
}

// 8. DIRECT WHATSAPP ORDER ENGINE (Quick Single Buy)
function triggerWhatsAppOrder(productId) {
  if (typeof storeProducts === "undefined") return;

  const product = storeProducts.find(p => p.id === productId);
  if (!product) return;

  const userCity = localStorage.getItem("ge_user_city") || "Kumasi";
  const isVip = localStorage.getItem("ge_is_vip") === "true";
  const appliedPrice = isVip ? product.vipPrice : product.retailPrice;

  const textMessage = 
    `Hello *Glory Empire*! I would like to place an order:\n\n` +
    `🛍️ *Product:* ${product.title}\n` +
    `👤 *Customer Status:* ${isVip ? "👑 VIP Member (Monthly Subscriber)" : "Standard Retail Buyer"}\n` +
    `💵 *Price:* GH₵ ${appliedPrice.toFixed(2)}\n` +
    `🚚 *Delivery City:* ${userCity}\n\n` +
    `Please confirm stock and delivery arrangements.`;

  const encodedUrl = `https://wa.me/${GLORY_EMPIRE_CONFIG.whatsappNumber}?text=${encodeURIComponent(textMessage)}`;
  window.open(encodedUrl, '_blank');
}

// 9. THEME INITIALIZATION
function initTheme() {
  const savedTheme = localStorage.getItem("ge_theme") || "light";
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

// 10. DRAWER & GENERAL SETTINGS CONTROLLER
function initDrawerAndModals() {
  const drawerOverlay = document.getElementById("drawerOverlay");
  const drawerPanel = document.getElementById("drawerPanel");
  const menuTriggerBtn = document.getElementById("menuTriggerBtn");
  const closeDrawerBtn = document.getElementById("closeDrawerBtn");

  const settingsModal = document.getElementById("settingsModal");
  const menuSettingsBtn = document.getElementById("menuSettingsBtn");
  const closeSettingsBtn = document.getElementById("closeSettingsBtn");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const darkModeToggle = document.getElementById("darkModeToggle");

  menuTriggerBtn?.addEventListener("click", () => {
    drawerOverlay?.classList.remove("hidden");
    setTimeout(() => drawerPanel?.classList.remove("translate-x-full"), 10);
  });

  const closeDrawer = () => {
    drawerPanel?.classList.add("translate-x-full");
    setTimeout(() => drawerOverlay?.classList.add("hidden"), 200);
  };

  closeDrawerBtn?.addEventListener("click", closeDrawer);
  drawerOverlay?.addEventListener("click", (e) => {
    if (e.target === drawerOverlay) closeDrawer();
  });

  darkModeToggle?.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("ge_theme", isDark ? "dark" : "light");
  });

  menuSettingsBtn?.addEventListener("click", () => {
    closeDrawer();
    const cityInput = document.getElementById("settingCityInput");
    if (cityInput) {
      cityInput.value = localStorage.getItem("ge_user_city") || "Kumasi";
    }
    settingsModal?.classList.remove("hidden");
  });

  closeSettingsBtn?.addEventListener("click", () => {
    settingsModal?.classList.add("hidden");
  });

  saveSettingsBtn?.addEventListener("click", () => {
    const cityInput = document.getElementById("settingCityInput");
    if (cityInput && cityInput.value.trim()) {
      localStorage.setItem("ge_user_city", cityInput.value.trim());
    }
    settingsModal?.classList.add("hidden");
    alert("Settings saved successfully!");
  });
}