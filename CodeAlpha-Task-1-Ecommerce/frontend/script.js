const productsContainer = document.getElementById("products");
const cartCount = document.getElementById("cartCount");

const cartBtn = document.getElementById("cartBtn");
const cartSection = document.getElementById("cartSection");
const closeCart = document.getElementById("closeCart");

const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

const clearCart = document.getElementById("clearCart");
const checkoutBtn = document.getElementById("checkoutBtn");

const checkoutSection = document.getElementById("checkoutSection");
const closeCheckout = document.getElementById("closeCheckout");

const checkoutForm = document.getElementById("checkoutForm");
const checkoutItems = document.getElementById("checkoutItems");
const checkoutTotal = document.getElementById("checkoutTotal");

const successSection = document.getElementById("successSection");
const continueShopping = document.getElementById("continueShopping");

let products = [];
let cart = [];


// =========================
// LOAD PRODUCTS FROM API
// =========================

async function loadProducts() {

  try {

    const response = await fetch(
      "http://localhost:5000/api/products"
    );

    if (!response.ok) {
      throw new Error("Products could not be loaded");
    }

    products = await response.json();

    displayProducts();

  } catch (error) {

    console.error(error);

    productsContainer.innerHTML = `
      <p>
        Unable to load products.
        Please make sure the backend is running.
      </p>
    `;
  }
}


// =========================
// DISPLAY PRODUCTS
// =========================

function displayProducts() {

  productsContainer.innerHTML = "";

  products.forEach((product) => {

    const card = document.createElement("div");

    card.className = "product-card";

    card.innerHTML = `

      <img
        src="${product.image}"
        alt="${product.name}"
      >

      <h3>${product.name}</h3>

      <p>${product.description}</p>

      <strong>
        Rs. ${product.price}
      </strong>

      <button onclick="addToCart(${product.id})">
        🛒 Add to Cart
      </button>

    `;

    productsContainer.appendChild(card);

  });
}


// =========================
// ADD TO CART
// =========================

function addToCart(productId) {

  const existingProduct = cart.find(
    item => item.id === productId
  );

  if (existingProduct) {

    existingProduct.quantity++;

  } else {

    const product = products.find(
      item => item.id === productId
    );

    if (!product) return;

    cart.push({
      ...product,
      quantity: 1
    });
  }

  updateCart();

  alert("✅ Product added to cart!");
}


// =========================
// UPDATE CART
// =========================

function updateCart() {

  const totalQuantity = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  cartCount.textContent = totalQuantity;

  displayCart();

  displayCheckoutSummary();
}


// =========================
// DISPLAY CART
// =========================

function displayCart() {

  cartItems.innerHTML = "";

  if (cart.length === 0) {

    cartItems.innerHTML = `
      <p>Your cart is empty 🛒</p>
    `;

    cartTotal.textContent = "Rs. 0";

    return;
  }

  let total = 0;

  cart.forEach((item) => {

    total += item.price * item.quantity;

    const cartItem = document.createElement("div");

    cartItem.className = "cart-item";

    cartItem.innerHTML = `

      <img
        src="${item.image}"
        alt="${item.name}"
      >

      <div class="cart-item-info">

        <h3>${item.name}</h3>

        <p>
          Rs. ${item.price}
        </p>

      </div>

      <div class="quantity-controls">

        <button onclick="decreaseQuantity(${item.id})">
          −
        </button>

        <span>
          ${item.quantity}
        </span>

        <button onclick="increaseQuantity(${item.id})">
          +
        </button>

      </div>

      <strong>
        Rs. ${item.price * item.quantity}
      </strong>

      <button
        class="remove-btn"
        onclick="removeFromCart(${item.id})"
      >
        🗑️ Remove
      </button>

    `;

    cartItems.appendChild(cartItem);

  });

  cartTotal.textContent = `Rs. ${total}`;
}


// =========================
// INCREASE QUANTITY
// =========================

function increaseQuantity(productId) {

  const item = cart.find(
    item => item.id === productId
  );

  if (item) {

    item.quantity++;

    updateCart();

  }
}


// =========================
// DECREASE QUANTITY
// =========================

function decreaseQuantity(productId) {

  const item = cart.find(
    item => item.id === productId
  );

  if (!item) return;

  if (item.quantity > 1) {

    item.quantity--;

  } else {

    cart = cart.filter(
      item => item.id !== productId
    );

  }

  updateCart();
}


// =========================
// REMOVE PRODUCT
// =========================

function removeFromCart(productId) {

  cart = cart.filter(
    item => item.id !== productId
  );

  updateCart();
}


// =========================
// OPEN CART
// =========================

cartBtn.addEventListener("click", () => {

  cartSection.style.display = "block";

  cartSection.scrollIntoView({
    behavior: "smooth"
  });

});


// =========================
// CLOSE CART
// =========================

closeCart.addEventListener("click", () => {

  cartSection.style.display = "none";

});


// =========================
// CLEAR CART
// =========================

clearCart.addEventListener("click", () => {

  if (cart.length === 0) {

    alert("Cart is already empty.");

    return;
  }

  cart = [];

  updateCart();

  alert("🗑️ Cart cleared!");

});


// =========================
// OPEN CHECKOUT
// =========================

checkoutBtn.addEventListener("click", () => {

  if (cart.length === 0) {

    alert("🛒 Your cart is empty!");

    return;
  }

  cartSection.style.display = "none";

  displayCheckoutSummary();

  checkoutSection.style.display = "block";

});


// =========================
// CHECKOUT SUMMARY
// =========================

function displayCheckoutSummary() {

  checkoutItems.innerHTML = "";

  let total = 0;

  cart.forEach((item) => {

    total += item.price * item.quantity;

    const checkoutItem = document.createElement("div");

    checkoutItem.className = "checkout-item";

    checkoutItem.innerHTML = `

      <div>

        <div class="checkout-item-name">
          ${item.name}
        </div>

        <small>
          Quantity: ${item.quantity}
        </small>

      </div>

      <div class="checkout-item-price">
        Rs. ${item.price * item.quantity}
      </div>

    `;

    checkoutItems.appendChild(checkoutItem);

  });

  checkoutTotal.textContent = `Rs. ${total}`;
}


// =========================
// CLOSE CHECKOUT
// =========================

closeCheckout.addEventListener("click", () => {

  checkoutSection.style.display = "none";

});


// =========================
// PLACE ORDER
// =========================

checkoutForm.addEventListener("submit", async (event) => {

  event.preventDefault();


  const fullName =
    document.getElementById("fullName").value.trim();

  const email =
    document.getElementById("email").value.trim();

  const phone =
    document.getElementById("phone").value.trim();

  const address =
    document.getElementById("address").value.trim();


  if (!fullName || !email || !phone || !address) {

    alert("Please fill in all fields.");

    return;
  }


  // Calculate total

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );


  // Get logged-in user

  const savedUser =
    localStorage.getItem("user");

  const user =
    savedUser
      ? JSON.parse(savedUser)
      : null;


  try {

    const response = await fetch(
      "http://localhost:5000/api/orders",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          user_id:
            user ? user.id : null,

          customer_name:
            fullName,

          email:
            email,

          phone:
            phone,

          address:
            address,

          total:
            total

        })
      }
    );


    const data = await response.json();


    if (!response.ok) {

      alert(
        "❌ " + data.message
      );

      return;
    }


    console.log(
      "Order saved successfully."
    );

    console.log(
      "Order ID:",
      data.orderId
    );


    // Hide checkout

    checkoutSection.style.display =
      "none";


    // Show success message

    successSection.style.display =
      "flex";


    // Clear cart

    cart = [];

    updateCart();


    // Clear form

    checkoutForm.reset();


  } catch (error) {

    console.error(error);

    alert(
      "❌ Unable to connect to the server."
    );

  }

});


// =========================
// CONTINUE SHOPPING
// =========================

continueShopping.addEventListener(
  "click",
  () => {

    successSection.style.display =
      "none";

    document
      .getElementById("products-section")
      .scrollIntoView({
        behavior: "smooth"
      });

  }
);


// =========================
// SHOP NOW BUTTON
// =========================

const shopButton =
  document.querySelector(".shop-btn");

if (shopButton) {

  shopButton.addEventListener(
    "click",
    () => {

      document
        .getElementById("products-section")
        .scrollIntoView({
          behavior: "smooth"
        });

    }
  );

}


// =========================
// START APPLICATION
// =========================

loadProducts();