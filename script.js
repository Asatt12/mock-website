const CART_KEY = "northpeakCart";
const cartButtons = document.querySelectorAll("[data-product]");
const form = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = loadCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach((node) => {
    node.textContent = String(count);
  });
}

function getCartPath() {
  return window.location.pathname.includes("/products/") ? "../cart.html" : "./cart.html";
}

function addToCart(productName, priceValue) {
  const cart = loadCart();
  const existing = cart.find((item) => item.name === productName);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      name: productName,
      price: Number(priceValue) || 0,
      quantity: 1
    });
  }
  saveCart(cart);
}

function renderCartPage() {
  const cartContainer = document.getElementById("cart-items");
  if (!cartContainer) return;

  const subtotalEl = document.getElementById("cart-subtotal");
  const shippingEl = document.getElementById("cart-shipping");
  const totalEl = document.getElementById("cart-total");
  const clearBtn = document.getElementById("clear-cart");
  const checkoutBtn = document.getElementById("checkout-btn");
  const checkoutNote = document.getElementById("checkout-note");

  const cart = loadCart();
  if (cart.length === 0) {
    cartContainer.innerHTML = "<p class='muted'>Your cart is empty. Add products to continue.</p>";
    subtotalEl.textContent = "$0.00";
    shippingEl.textContent = "$0.00";
    totalEl.textContent = "$0.00";
    checkoutBtn.disabled = true;
    return;
  }

  let subtotal = 0;
  cartContainer.innerHTML = cart
    .map((item, index) => {
      const line = item.price * item.quantity;
      subtotal += line;
      return `
        <div class="cart-row">
          <div>
            <strong>${item.name}</strong>
            <p class="muted small">$${item.price.toFixed(2)} each</p>
          </div>
          <input class="qty-input" type="number" min="1" value="${item.quantity}" data-qty-index="${index}" />
          <p><strong>$${line.toFixed(2)}</strong></p>
          <button class="btn btn-outline" data-remove-index="${index}">Remove</button>
        </div>
      `;
    })
    .join("");

  const shipping = subtotal >= 50 ? 0 : 6.99;
  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  shippingEl.textContent = `$${shipping.toFixed(2)}`;
  totalEl.textContent = `$${(subtotal + shipping).toFixed(2)}`;
  checkoutBtn.disabled = false;

  cartContainer.querySelectorAll("[data-remove-index]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-remove-index"));
      const next = loadCart();
      next.splice(idx, 1);
      saveCart(next);
      renderCartPage();
    });
  });

  cartContainer.querySelectorAll("[data-qty-index]").forEach((input) => {
    input.addEventListener("change", () => {
      const idx = Number(input.getAttribute("data-qty-index"));
      const nextQty = Math.max(1, Number(input.value) || 1);
      const next = loadCart();
      next[idx].quantity = nextQty;
      saveCart(next);
      renderCartPage();
    });
  });

  clearBtn?.addEventListener("click", () => {
    saveCart([]);
    renderCartPage();
  });

  checkoutBtn?.addEventListener("click", () => {
    if (checkoutNote) {
      checkoutNote.textContent = "Checkout is disabled in this demo environment.";
    }
  });
}

cartButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const productName = button.getAttribute("data-product");
    const productPrice = button.getAttribute("data-price");
    addToCart(productName, productPrice);
    window.location.href = getCartPath();
  });
});

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("name");
    formStatus.textContent = `Thanks ${name.value || "there"} - we received your message.`;
    form.reset();
  });
}

updateCartCount();
renderCartPage();
