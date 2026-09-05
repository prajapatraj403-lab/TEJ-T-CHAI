const WHATSAPP_NUMBER = "919511551294";
const BACKEND_URL = "https://tej-t-chai.onrender.com";

const PRODUCTS = {
  premium100: {
    id: "premium100",
    name: "TEJ-T Premium Blend",
    weight: "100g",
    price: 69,
    image: "tej-t-product.jpeg"
  },

  elaichi250: {
    id: "elaichi250",
    name: "TEJ-T Elaichi Tea",
    weight: "250g",
    price: 110,
    image: "TEJ.T-CHAI.jpg"
  },

  elaichi500: {
    id: "elaichi500",
    name: "TEJ-T Elaichi Tea",
    weight: "500g",
    price: 160,
    image: "TEJ.T-CHAI.jpg"
  },

  elaichi1kg: {
    id: "elaichi1kg",
    name: "TEJ-T Elaichi Tea",
    weight: "1KG",
    price: 300,
    image: "TEJ.T-CHAI.jpg"
  }
};

let selectedProduct = "premium100";
let qty = 1;

let cart = [];

let appliedCoupon = "";
let discount = 0;
let razorpayKeyId = "";


/* =========================
   PRODUCT HELPERS
========================= */

function getProduct(id) {
  return PRODUCTS[id];
}

function getCartQuantity() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartSubtotal() {
  return cart.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  );
}


/* =========================
   WHATSAPP
========================= */

function waLink(productId = "premium100", quantity = 1) {

  const product = getProduct(productId);

  const total = product.price * quantity;

  const message =
`Namaste TEJ-T CHAI! ☕

Mujhe ${product.name} - ${product.weight} ke ${quantity} pack order karne hain.

Price: ₹${product.price} / Pack
Total: ₹${total}

Thank you!`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}


/* =========================
   INITIAL LOAD
========================= */

document.addEventListener("DOMContentLoaded", async () => {

  const heroWhatsapp = document.getElementById("heroWhatsapp");
  const productWhatsapp = document.getElementById("productWhatsapp");

  if (heroWhatsapp) {
    heroWhatsapp.href = waLink("premium100", 1);
  }

  if (productWhatsapp) {
    productWhatsapp.href = waLink("premium100", 1);
  }

  createElaichiProduct();

  updateCart();

  try {

    const response = await fetch(`${BACKEND_URL}/config`);

    const data = await response.json();

    if (data.success) {
      razorpayKeyId = data.key_id;
    }

  } catch (error) {

    console.warn(
      "Backend config not available yet:",
      error
    );

  }

});


/* =========================
   ADD ELAICHI PRODUCT
========================= */

function createElaichiProduct() {

  const productSection =
    document.querySelector("#product .container");

  if (!productSection) return;

  if (document.getElementById("elaichiProduct")) {
    return;
  }

  const elaichiHTML = `

    <div class="product-card"
         id="elaichiProduct"
         style="margin-top:30px">

      <div class="product-image">

        <img
          src="TEJ.T-CHAI.jpg"
          alt="TEJ-T Elaichi Tea"
        >

      </div>

      <div class="product-info">

        <span class="tag">
          NEW PRODUCT
        </span>

        <h3>
          TEJ-T Elaichi Tea
        </h3>

        <h4>
          इलायची वाली दमदार चाय
        </h4>

        <p>
          Premium tea blend के साथ
          इलायची का शानदार aroma और rich taste।
        </p>

        <ul class="check-list">

          <li>Premium Tea Leaves</li>

          <li>Natural Elaichi</li>

          <li>Strong Aroma</li>

          <li>Rich Taste</li>

          <li>100% Veg</li>

        </ul>

      </div>

      <div class="buy-box">

        <span>
          वजन चुनें
        </span>

        <select
          id="elaichiWeight"
          onchange="changeElaichiProduct()"
          style="
            width:100%;
            padding:12px;
            margin:12px 0;
            border:1px solid #ddd;
            border-radius:8px;
            background:white;
          "
        >

          <option value="elaichi250">
            250g — ₹110
          </option>

          <option value="elaichi500">
            500g — ₹160
          </option>

          <option value="elaichi1kg">
            1KG — ₹300
          </option>

        </select>

        <strong id="elaichiPrice">
          ₹110
        </strong>

        <small id="elaichiWeightText">
          250g Pack
        </small>

        <div class="qty">

          <button
            onclick="changeElaichiQty(-1)"
          >
            −
          </button>

          <span id="elaichiQty">
            1
          </span>

          <button
            onclick="changeElaichiQty(1)"
          >
            +
          </button>

        </div>

        <button
          class="btn btn-primary full"
          onclick="addElaichiToCart()"
        >
          🛒 ADD TO CART
        </button>

        <button
          class="btn btn-gold full"
          onclick="buyElaichiNow()"
        >
          ⚡ BUY NOW
        </button>

        <a
          class="btn btn-white full"
          id="elaichiWhatsapp"
          target="_blank"
          rel="noopener"
        >
          💬 WHATSAPP ORDER
        </a>

      </div>

    </div>
  `;

  productSection.insertAdjacentHTML(
    "beforeend",
    elaichiHTML
  );

  updateElaichiWhatsapp();
}


/* =========================
   PREMIUM PRODUCT QUANTITY
========================= */

function changeQty(amount) {

  qty = Math.max(
    1,
    qty + amount
  );

  const qtyElement =
    document.getElementById("qty");

  if (qtyElement) {
    qtyElement.textContent = qty;
  }

  const productWhatsapp =
    document.getElementById("productWhatsapp");

  if (productWhatsapp) {

    productWhatsapp.href =
      waLink(
        "premium100",
        qty
      );

  }

}


/* =========================
   PREMIUM ADD TO CART
========================= */

function addToCart() {

  addProductToCart(
    "premium100",
    qty
  );

  alert(
    `${qty} Pack Cart में add हो गया।`
  );

}


/* =========================
   PREMIUM BUY NOW
========================= */

function buyNow() {

  addProductToCart(
    "premium100",
    qty
  );

  updateCart();

  openCheckout();

}


/* =========================
   ELAICHI PRODUCT
========================= */

let elaichiQty = 1;


function getSelectedElaichi() {

  const select =
    document.getElementById(
      "elaichiWeight"
    );

  if (!select) {
    return "elaichi250";
  }

  return select.value;
}


function changeElaichiProduct() {

  const productId =
    getSelectedElaichi();

  const product =
    getProduct(productId);

  const price =
    document.getElementById(
      "elaichiPrice"
    );

  const weight =
    document.getElementById(
      "elaichiWeightText"
    );

  if (price) {
    price.textContent =
      `₹${product.price}`;
  }

  if (weight) {
    weight.textContent =
      `${product.weight} Pack`;
  }

  updateElaichiWhatsapp();
}


function changeElaichiQty(amount) {

  elaichiQty = Math.max(
    1,
    elaichiQty + amount
  );

  const element =
    document.getElementById(
      "elaichiQty"
    );

  if (element) {
    element.textContent =
      elaichiQty;
  }

  updateElaichiWhatsapp();
}


function updateElaichiWhatsapp() {

  const productId =
    getSelectedElaichi();

  const link =
    document.getElementById(
      "elaichiWhatsapp"
    );

  if (link) {

    link.href =
      waLink(
        productId,
        elaichiQty
      );

  }

}


function addElaichiToCart() {

  const productId =
    getSelectedElaichi();

  addProductToCart(
    productId,
    elaichiQty
  );

  alert(
    `${elaichiQty} Pack Cart में add हो गया।`
  );

}


function buyElaichiNow() {

  const productId =
    getSelectedElaichi();

  addProductToCart(
    productId,
    elaichiQty
  );

  updateCart();

  openCheckout();

}


/* =========================
   CART ADD
========================= */

function addProductToCart(
  productId,
  quantity
) {

  const product =
    getProduct(productId);

  if (!product) return;

  const existing =
    cart.find(
      item =>
        item.productId === productId
    );

  if (existing) {

    existing.quantity += quantity;

  } else {

    cart.push({

      productId: product.id,

      name: product.name,

      weight: product.weight,

      price: product.price,

      image: product.image,

      quantity: quantity

    });

  }

  updateCart();

}


/* =========================
   CART COUNT
========================= */

function updateCart() {

  const cartCount =
    document.getElementById(
      "cartCount"
    );

  if (cartCount) {

    cartCount.textContent =
      getCartQuantity();

  }

}


/* =========================
   CART OPEN
========================= */

function openCart() {

  const box =
    document.getElementById(
      "cartContent"
    );

  const modal =
    document.getElementById(
      "cartModal"
    );

  if (!box || !modal) return;


  if (cart.length === 0) {

    box.innerHTML = `

      <div
        style="
          text-align:center;
          padding:35px 10px
        "
      >

        <div
          style="font-size:55px"
        >
          🛒
        </div>

        <h3
          style="
            color:#063b25;
            margin-top:10px
          "
        >
          आपका Cart खाली है
        </h3>

        <p
          style="
            color:#66736c;
            margin-top:8px
          "
        >
          TEJ-T CHAI अभी खरीदें।
        </p>

      </div>

    `;

    modal.classList.add("open");

    return;
  }


  const subtotal =
    getCartSubtotal();

  const safeDiscount =
    Math.min(
      discount || 0,
      subtotal
    );

  const finalTotal =
    subtotal - safeDiscount;


  let productsHTML = "";


  cart.forEach(
    (item, index) => {

      productsHTML += `

        <div
          style="
            border:1px solid #e7e1d2;
            border-radius:12px;
            padding:15px;
            margin-bottom:12px
          "
        >

          <div
            style="
              display:flex;
              align-items:center;
              gap:12px
            "
          >

            <img
              src="${item.image}"
              style="
                width:65px;
                height:65px;
                object-fit:contain;
                border-radius:10px;
                background:#fbf6e9;
              "
            >

            <div style="flex:1">

              <b
                style="
                  color:#063b25;
                  font-size:16px
                "
              >
                ${item.name}
              </b>

              <small
                style="
                  display:block;
                  color:#66736c
                "
              >
                ${item.weight}
              </small>

              <b
                style="
                  color:#063b25
                "
              >
                ₹${item.price} / Pack
              </b>

            </div>

            <button
              onclick="removeCartItem(${index})"
              style="
                border:0;
                background:none;
                cursor:pointer;
                font-size:20px
              "
            >
              🗑️
            </button>

          </div>


          <div
            style="
              display:flex;
              justify-content:space-between;
              align-items:center;
              margin-top:15px;
              padding-top:12px;
              border-top:1px solid #e7e1d2
            "
          >

            <b>
              Quantity
            </b>

            <div
              style="
                display:flex;
                align-items:center;
                gap:12px
              "
            >

              <button
                onclick="decreaseCartItem(${index})"
                style="
                  width:35px;
                  height:35px;
                  cursor:pointer
                "
              >
                −
              </button>

              <b>
                ${item.quantity}
              </b>

              <button
                onclick="increaseCartItem(${index})"
                style="
                  width:35px;
                  height:35px;
                  cursor:pointer
                "
              >
                +
              </button>

            </div>

          </div>


          <div
            style="
              text-align:right;
              margin-top:10px;
              color:#063b25;
              font-weight:bold
            "
          >
            ₹${item.price * item.quantity}
          </div>

        </div>

      `;

    }
  );


  const couponStatus =
    appliedCoupon
      ? `<div style="margin-top:8px;color:#08783f;font-size:13px">
          ✅ ${appliedCoupon} applied
        </div>`
      : "";


  box.innerHTML = `

    ${productsHTML}

    <div
      style="
        margin-top:20px;
        padding:15px;
        background:#fbf6e9;
        border-radius:10px
      "
    >

      <b>🎟️ Coupon Code</b>

      <div
        style="
          display:flex;
          gap:8px;
          margin-top:10px
        "
      >

        <input
          id="couponCode"
          type="text"
          value="${appliedCoupon}"
          placeholder="Enter coupon"
          style="
            flex:1;
            min-width:0;
            padding:11px;
            border:1px solid #ddd;
            border-radius:7px
          "
        >

        <button
          type="button"
          onclick="applyCoupon()"
          style="
            padding:10px 15px;
            background:#063b25;
            color:white;
            border:0;
            border-radius:7px;
            cursor:pointer;
            font-weight:bold
          "
        >
          APPLY
        </button>

      </div>

      <div
        id="couponMessage"
        style="
          margin-top:8px;
          font-size:13px
        "
      >
        ${couponStatus}
      </div>

    </div>


    <div
      style="
        margin-top:20px;
        border-top:1px solid #e7e1d2;
        padding-top:15px
      "
    >

      <div
        style="
          display:flex;
          justify-content:space-between;
          margin-bottom:8px
        "
      >
        <span>Subtotal</span>
        <b>₹${subtotal}</b>
      </div>

      <div
        style="
          display:flex;
          justify-content:space-between;
          margin-bottom:8px
        "
      >
        <span>Discount</span>

        <b style="color:#08783f">
          - ₹${safeDiscount}
        </b>

      </div>

      <div
        style="
          display:flex;
          justify-content:space-between;
          margin-bottom:12px
        "
      >

        <span>
          Delivery
        </span>

        <b style="color:#08783f">
          FREE
        </b>

      </div>

      <div
        style="
          display:flex;
          justify-content:space-between;
          font-size:21px;
          color:#063b25;
          border-top:1px solid #e7e1d2;
          padding-top:12px
        "
      >

        <strong>
          Final Total
        </strong>

        <strong>
          ₹${finalTotal}
        </strong>

      </div>

    </div>


    <button
      class="btn btn-gold full"
      onclick="checkout()"
    >
      PROCEED TO CHECKOUT
    </button>

    <button
      class="btn btn-white full"
      onclick="closeCart()"
    >
      CONTINUE SHOPPING
    </button>

  `;

  modal.classList.add("open");

}


/* =========================
   CART ITEM CONTROLS
========================= */

function increaseCartItem(index) {

  cart[index].quantity++;

  updateCart();

  openCart();

}


function decreaseCartItem(index) {

  if (
    cart[index].quantity > 1
  ) {

    cart[index].quantity--;

  } else {

    cart.splice(index, 1);

  }

  updateCart();

  openCart();

}


function removeCartItem(index) {

  cart.splice(index, 1);

  if (cart.length === 0) {

    appliedCoupon = "";
    discount = 0;

  }

  updateCart();

  openCart();

}


/* =========================
   OLD CART FUNCTIONS
========================= */

function increaseCart() {

  if (cart.length > 0) {

    cart[0].quantity++;

  }

  updateCart();

  openCart();

}


function decreaseCart() {

  if (cart.length > 0) {

    decreaseCartItem(0);

  }

}


function removeFromCart() {

  cart = [];

  appliedCoupon = "";

  discount = 0;

  updateCart();

  openCart();

}


/* =========================
   COUPON
========================= */

function applyCoupon() {

  const couponInput =
    document.getElementById(
      "couponCode"
    );

  const message =
    document.getElementById(
      "couponMessage"
    );

  if (!couponInput || !message)
    return;


  const code =
    couponInput.value
      .trim()
      .toUpperCase();


  if (!code) {

    appliedCoupon = "";

    discount = 0;

    message.innerHTML =
      "कृपया Coupon Code डालें।";

    openCart();

    return;

  }


  if (cart.length === 0) {

    message.innerHTML =
      "पहले product cart में add करें।";

    return;

  }


  const subtotal =
    getCartSubtotal();


  if (code === "TEJ10") {

    appliedCoupon = "TEJ10";

    discount =
      Math.round(
        subtotal * 0.10
      );

  }

  else if (code === "TEJ20") {

    appliedCoupon = "TEJ20";

    discount =
      Math.round(
        subtotal * 0.20
      );

  }

  else {

    appliedCoupon = "";

    discount = 0;

    message.innerHTML =
      "❌ Invalid Coupon Code";

    openCart();

    return;

  }


  openCart();

}


/* =========================
   CHECKOUT
========================= */

function checkout() {

  if (cart.length === 0) {

    alert(
      "पहले product cart में add करें।"
    );

    return;

  }

  closeCart();

  openCheckout();

}


function openCheckout() {

  const modal =
    document.getElementById(
      "checkoutModal"
    );

  if (modal) {
    modal.classList.add("open");
  }

}


function closeCheckout() {

  const modal =
    document.getElementById(
      "checkoutModal"
    );

  if (modal) {
    modal.classList.remove("open");
  }

}


/* =========================
   TOTALS
========================= */

function calculateTotals() {

  const subtotal =
    getCartSubtotal();

  const safeDiscount =
    Math.min(
      discount || 0,
      subtotal
    );

  return {

    subtotal,

    discount:
      safeDiscount,

    total:
      subtotal - safeDiscount

  };

}


/* =========================
   PLACE ORDER
========================= */

async function placeOrder(event) {

  event.preventDefault();


  const name =
    document.getElementById(
      "name"
    ).value.trim();

  const phone =
    document.getElementById(
      "phone"
    ).value.trim();

  const address =
    document.getElementById(
      "address"
    ).value.trim();

  const city =
    document.getElementById(
      "city"
    ).value.trim();

  const state =
    document.getElementById(
      "state"
    ).value;

  const pincode =
    document.getElementById(
      "pincode"
    ).value.trim();

  const payment =
    document.getElementById(
      "payment"
    ).value;


  if (!cart.length)
    return alert(
      "पहले product cart में add करें।"
    );


  if (!name)
    return alert(
      "कृपया अपना पूरा नाम डालें।"
    );


  if (!/^[0-9]{10}$/.test(phone))
    return alert(
      "कृपया सही 10 digit mobile number डालें।"
    );


  if (!address)
    return alert(
      "कृपया पूरा पता डालें।"
    );


  if (!city)
    return alert(
      "कृपया City / Village डालें।"
    );


  if (state !== "Rajasthan")
    return alert(
      "अभी TEJ-T CHAI की delivery केवल Rajasthan में उपलब्ध है।"
    );


  if (!/^[0-9]{6}$/.test(pincode))
    return alert(
      "कृपया 6 digit PIN Code डालें।"
    );


  if (!/^(30|31|32|33|34)[0-9]{4}$/.test(pincode))
    return alert(
      "यह Rajasthan का valid PIN Code नहीं लगता।"
    );


  if (!payment)
    return alert(
      "कृपया Payment Method चुनें।"
    );


  const customer = {

    name,
    phone,
    address,
    city,
    state,
    pincode

  };


  const button =
    document.getElementById(
      "placeOrderBtn"
    );


  if (button) {

    button.disabled = true;

    button.textContent =
      "PROCESSING...";

  }


  try {

    if (payment === "cod") {

      processCODOrder(
        customer
      );

    } else {

      await startRazorpayPayment(
        customer
      );

    }

  }

  finally {

    if (button) {

      button.disabled = false;

      button.textContent =
        "PLACE ORDER";

    }

  }

}


/* =========================
   RAZORPAY
========================= */

async function startRazorpayPayment(
  customer
) {

  try {

    if (!window.Razorpay) {

      throw new Error(
        "Razorpay checkout load नहीं हुआ।"
      );

    }


    if (!razorpayKeyId) {

      const configResponse =
        await fetch(
          `${BACKEND_URL}/config`
        );

      const config =
        await configResponse.json();

      if (!config.success) {

        throw new Error(
          "Razorpay configuration नहीं मिली।"
        );

      }

      razorpayKeyId =
        config.key_id;

    }


    const totals =
      calculateTotals();


    /*
      IMPORTANT:
      Backend को अब items + total मिलेगा.
      Backend update के बाद यही सही
      multi-product amount Razorpay में जाएगा.
    */

    const response =
      await fetch(
        `${BACKEND_URL}/create-order`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            items: cart,

            quantity:
              getCartQuantity(),

            coupon:
              appliedCoupon || "",

            customer,

            subtotal:
              totals.subtotal,

            discount:
              totals.discount,

            total:
              totals.total

          })

        }
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        "Razorpay order create नहीं हुआ।"
      );

    }


    const options = {

      key:
        razorpayKeyId,

      amount:
        data.amount,

      currency:
        "INR",

      name:
        "TEJ-T CHAI",

      description:
        "TEJ-T CHAI Order",

      order_id:
        data.order_id,

      prefill: {

        name:
          customer.name,

        contact:
          customer.phone

      },

      notes: {

        items:
          JSON.stringify(cart),

        coupon:
          appliedCoupon ||
          "No Coupon",

        city:
          customer.city,

        pincode:
          customer.pincode

      },

      theme: {
        color:
          "#063b25"
      },

      handler:
        async function(
          paymentResponse
        ) {

          await verifyRazorpayPayment(
            paymentResponse,
            customer,
            data
          );

        },

      modal: {

        ondismiss:
          function() {

            alert(
              "Payment cancel कर दिया गया। आपका order अभी confirm नहीं हुआ है।"
            );

          }

      }

    };


    const rzp =
      new window.Razorpay(
        options
      );


    rzp.on(
      "payment.failed",
      function(response) {

        console.error(
          "Razorpay Payment Failed:",
          response.error
        );

        alert(
          "❌ Payment failed.\n\nकृपया दोबारा कोशिश करें।"
        );

      }
    );


    rzp.open();

  }

  catch (error) {

    console.error(error);

    alert(
      `❌ Online Payment शुरू नहीं हो पाया।\n\n${error.message}`
    );

  }

}


/* =========================
   VERIFY PAYMENT
========================= */

async function verifyRazorpayPayment(
  paymentResponse,
  customer,
  razorpayOrderData
) {

  try {

    const totals =
      calculateTotals();


    const response =
      await fetch(
        `${BACKEND_URL}/verify-payment`,
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            razorpay_payment_id:
              paymentResponse.razorpay_payment_id,

            razorpay_order_id:
              paymentResponse.razorpay_order_id,

            razorpay_signature:
              paymentResponse.razorpay_signature,

            items:
              cart,

            quantity:
              getCartQuantity(),

            coupon:
              appliedCoupon || "",

            customer,

            subtotal:
              totals.subtotal,

            discount:
              totals.discount,

            total:
              totals.total,

            expected_amount:
              razorpayOrderData.amount

          })

        }
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      !data.success
    ) {

      alert(
        `❌ Payment verification failed.\n\n${
          data.message ||
          "Order confirm नहीं हुआ।"
        }`
      );

      return;

    }


    processSuccessfulOnlineOrder(
      customer,
      data
    );

  }

  catch (error) {

    console.error(error);

    alert(
      "Payment verification में समस्या आई।"
    );

  }

}


/* =========================
   COD
========================= */

function processCODOrder(
  customer
) {

  const totals =
    calculateTotals();

  const orderId =
    generateOrderId();


  const order = {

    orderId,

    items:
      cart,

    name:
      customer.name,

    phone:
      customer.phone,

    address:
      customer.address,

    city:
      customer.city,

    state:
      customer.state,

    pincode:
      customer.pincode,

    payment:
      "cod",

    paymentStatus:
      "Pending",

    quantity:
      getCartQuantity(),

    subtotal:
      totals.subtotal,

    coupon:
      appliedCoupon || "",

    discount:
      totals.discount,

    total:
      totals.total,

    status:
      "Order Received",

    createdAt:
      new Date().toLocaleString(
        "en-IN"
      )

  };


  localStorage.setItem(
    orderId,
    JSON.stringify(order)
  );


  sendWhatsAppOrder(
    order,
    "Cash on Delivery"
  );


  alert(
`✅ Order successfully received!

Order ID: ${orderId}

Items: ${getCartQuantity()} Pack

Total: ₹${totals.total}

अब WhatsApp खुलेगा।`
  );


  resetAfterOrder();

}


/* =========================
   ONLINE SUCCESS
========================= */

function processSuccessfulOnlineOrder(
  customer,
  paymentData
) {

  const totals =
    calculateTotals();

  const orderId =
    generateOrderId();


  const order = {

    orderId,

    items:
      cart,

    name:
      customer.name,

    phone:
      customer.phone,

    address:
      customer.address,

    city:
      customer.city,

    state:
      customer.state,

    pincode:
      customer.pincode,

    payment:
      "online",

    paymentStatus:
      "Paid",

    razorpayPaymentId:
      paymentData.payment_id,

    razorpayOrderId:
      paymentData.order_id,

    quantity:
      getCartQuantity(),

    subtotal:
      totals.subtotal,

    coupon:
      appliedCoupon || "",

    discount:
      totals.discount,

    total:
      totals.total,

    status:
      "Order Received",

    createdAt:
      new Date().toLocaleString(
        "en-IN"
      )

  };


  localStorage.setItem(
    orderId,
    JSON.stringify(order)
  );


  sendWhatsAppOrder(
    order,
    "Online Payment - PAID"
  );


  alert(
`✅ Payment Successful!

Order ID: ${orderId}

Payment: PAID

Items: ${getCartQuantity()} Pack

Total: ₹${totals.total}

अब WhatsApp खुलेगा।`
  );


  resetAfterOrder();

}


/* =========================
   WHATSAPP ORDER
========================= */

function sendWhatsAppOrder(
  order,
  paymentText
) {

  let itemText = "";


  order.items.forEach(
    item => {

      itemText +=
`${item.name} - ${item.weight}
₹${item.price} × ${item.quantity} = ₹${item.price * item.quantity}

`;

    }
  );


  const whatsappMessage =
`Namaste TEJ-T CHAI! ☕

NEW ORDER

Order ID:
${order.orderId}

PRODUCTS:

${itemText}
Subtotal:
₹${order.subtotal}

Coupon:
${order.coupon || "No Coupon"}

Discount:
₹${order.discount}

FINAL TOTAL:
₹${order.total}

Payment:
${paymentText}

Customer Name:
${order.name}

Mobile:
${order.phone}

Address:
${order.address}

City / Village:
${order.city}

Rajasthan PIN:
${order.pincode}

Thank you for ordering TEJ-T CHAI! ☕`;


  const whatsappURL =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${
      encodeURIComponent(
        whatsappMessage
      )
    }`;


  window.open(
    whatsappURL,
    "_blank",
    "noopener"
  );

}


/* =========================
   ORDER ID
========================= */

function generateOrderId() {

  return (
    "TEJT" +
    Math.floor(
      1000 +
      Math.random() * 9000
    )
  );

}


/* =========================
   RESET
========================= */

function resetAfterOrder() {

  cart = [];

  appliedCoupon = "";

  discount = 0;

  qty = 1;

  elaichiQty = 1;

  updateCart();


  const qtyElement =
    document.getElementById(
      "qty"
    );

  if (qtyElement) {

    qtyElement.textContent =
      "1";

  }


  const elaichiQtyElement =
    document.getElementById(
      "elaichiQty"
    );

  if (elaichiQtyElement) {

    elaichiQtyElement.textContent =
      "1";

  }


  const form =
    document.getElementById(
      "checkoutForm"
    );

  if (form) {

    form.reset();

  }


  closeCheckout();

}


/* =========================
   TRACK ORDER
========================= */

function trackOrder() {

  const input =
    document.getElementById(
      "orderId"
    );

  const result =
    document.getElementById(
      "trackResult"
    );

  if (!input || !result)
    return;


  const id =
    input.value
      .trim()
      .toUpperCase();


  if (!id) {

    result.innerHTML =
      `<div class="notice">
        कृपया Order ID डालें।
      </div>`;

    return;

  }


  const order =
    localStorage.getItem(id);


  if (order) {

    const data =
      JSON.parse(order);


    result.innerHTML =
      `<div class="notice">
        Order <b>${id}</b> —
        <b>${data.status || "Order Received"}</b> ✅
        <br>
        Payment:
        <b>${data.paymentStatus}</b>
      </div>`;

  }

  else {

    result.innerHTML =
      `<div class="notice">
        Order <b>${id}</b>
        इस browser में नहीं मिला।
      </div>`;

  }

}


/* =========================
   NEWSLETTER
========================= */

function subscribe(event) {

  event.preventDefault();


  const email =
    document.getElementById(
      "email"
    ).value.trim();


  localStorage.setItem(
    "tejTNewsletterEmail",
    email
  );


  alert(
    "धन्यवाद! आपका email subscription save हो गया।"
  );


  event.target.reset();

}


/* =========================
   MOBILE MENU
========================= */

function toggleMenu() {

  const nav =
    document.querySelector(
      "nav"
    );

  if (!nav) return;


  nav.style.display =
    nav.style.display === "flex"
      ? ""
      : "flex";

  nav.style.position =
    "absolute";

  nav.style.top =
    "70px";

  nav.style.left =
    "0";

  nav.style.right =
    "0";

  nav.style.background =
    "#fff";

  nav.style.padding =
    "20px";

  nav.style.flexDirection =
    "column";

  nav.style.boxShadow =
    "0 10px 20px #0001";

}


/* =========================
   MODAL CLOSE
========================= */

window.addEventListener(
  "click",
  function(e) {

    if (
      e.target.classList.contains(
        "modal"
      )
    ) {

      e.target.classList.remove(
        "open"
      );

    }

  }
);
