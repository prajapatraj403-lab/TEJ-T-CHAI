const WHATSAPP_NUMBER = "919511551294";
const PRICE = 69;
const BACKEND_URL = "https://tej-t-chai.onrender.com/";

let qty = 1;
let cartQty = 0;
let appliedCoupon = "";
let discount = 0;
let razorpayKeyId = "";

function waLink(quantity = 1) {
  const message = `Namaste TEJ-T CHAI! ☕\n\nMujhe TEJ-T Premium Blend 100g ke ${quantity} pack order karne hain.\n\nTotal: ₹${quantity * PRICE}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const heroWhatsapp = document.getElementById("heroWhatsapp");
  const productWhatsapp = document.getElementById("productWhatsapp");

  if (heroWhatsapp) heroWhatsapp.href = waLink(1);
  if (productWhatsapp) productWhatsapp.href = waLink(1);

  updateCart();

  try {
    const response = await fetch(`${BACKEND_URL}/config`);
    const data = await response.json();
    if (data.success) razorpayKeyId = data.key_id;
  } catch (error) {
    console.warn("Backend config not available yet:", error);
  }
});

function changeQty(amount) {
  qty = Math.max(1, qty + amount);
  const qtyElement = document.getElementById("qty");
  if (qtyElement) qtyElement.textContent = qty;
  const productWhatsapp = document.getElementById("productWhatsapp");
  if (productWhatsapp) productWhatsapp.href = waLink(qty);
}

function addToCart() {
  cartQty += qty;
  updateCart();
  alert(`${qty} pack cart में add हो गया।`);
}

function buyNow() {
  cartQty += qty;
  updateCart();
  openCheckout();
}

function updateCart() {
  const cartCount = document.getElementById("cartCount");
  if (cartCount) cartCount.textContent = cartQty;
}

function increaseCart() {
  cartQty++;
  updateCart();
  openCart();
}

function decreaseCart() {
  if (cartQty > 1) cartQty--;
  else {
    cartQty = 0;
    appliedCoupon = "";
    discount = 0;
  }
  updateCart();
  openCart();
}

function removeFromCart() {
  cartQty = 0;
  appliedCoupon = "";
  discount = 0;
  updateCart();
  openCart();
}

function applyCoupon() {
  const couponInput = document.getElementById("couponCode");
  const message = document.getElementById("couponMessage");
  if (!couponInput || !message) return;

  const code = couponInput.value.trim().toUpperCase();

  if (!code) {
    appliedCoupon = "";
    discount = 0;
    message.innerHTML = "कृपया Coupon Code डालें।";
    openCart();
    return;
  }

  if (!cartQty) {
    message.innerHTML = "पहले product cart में add करें।";
    return;
  }

  const subtotal = cartQty * PRICE;

  if (code === "TEJ10") {
    appliedCoupon = "TEJ10";
    discount = Math.round(subtotal * 0.10);
  } else if (code === "TEJ20") {
    appliedCoupon = "TEJ20";
    discount = Math.round(subtotal * 0.20);
  } else {
    appliedCoupon = "";
    discount = 0;
    message.innerHTML = "❌ Invalid Coupon Code";
    openCart();
    return;
  }

  openCart();
}

function openCart() {
  const box = document.getElementById("cartContent");
  const modal = document.getElementById("cartModal");
  if (!box || !modal) return;

  if (cartQty <= 0) {
    box.innerHTML = `
      <div style="text-align:center;padding:35px 10px">
        <div style="font-size:55px">🛒</div>
        <h3 style="color:#063b25;margin-top:10px">आपका Cart खाली है</h3>
        <p style="color:#66736c;margin-top:8px">TEJ-T Premium Blend अभी खरीदें।</p>
      </div>`;
    modal.classList.add("open");
    return;
  }

  const subtotal = cartQty * PRICE;
  const safeDiscount = Math.min(discount || 0, subtotal);
  const finalTotal = subtotal - safeDiscount;
  const couponStatus = appliedCoupon
    ? `<div style="margin-top:8px;color:#08783f;font-size:13px">✅ ${appliedCoupon} applied</div>`
    : "";

  box.innerHTML = `
    <div style="border:1px solid #e7e1d2;border-radius:12px;padding:15px">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="width:60px;height:60px;border-radius:10px;background:#fbf6e9;display:grid;place-items:center;font-size:35px">☕</div>
        <div style="flex:1">
          <b style="color:#063b25;font-size:17px">TEJ-T Premium Blend</b>
          <small style="display:block;color:#66736c">100g Pack</small>
          <b style="color:#063b25">₹${PRICE} / Pack</b>
        </div>
        <button onclick="removeFromCart()" style="border:0;background:none;cursor:pointer;font-size:20px">🗑️</button>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px;padding-top:15px;border-top:1px solid #e7e1d2">
        <b>Quantity</b>
        <div style="display:flex;align-items:center;gap:12px">
          <button onclick="decreaseCart()" style="width:35px;height:35px;cursor:pointer">−</button>
          <b>${cartQty}</b>
          <button onclick="increaseCart()" style="width:35px;height:35px;cursor:pointer">+</button>
        </div>
      </div>

      <div style="margin-top:20px;padding:15px;background:#fbf6e9;border-radius:10px">
        <b>🎟️ Coupon Code</b>
        <div style="display:flex;gap:8px;margin-top:10px">
          <input id="couponCode" type="text" value="${appliedCoupon}" placeholder="Enter coupon" style="flex:1;min-width:0;padding:11px;border:1px solid #ddd;border-radius:7px">
          <button type="button" onclick="applyCoupon()" style="padding:10px 15px;background:#063b25;color:white;border:0;border-radius:7px;cursor:pointer;font-weight:bold">APPLY</button>
        </div>
        <div id="couponMessage" style="margin-top:8px;font-size:13px">${couponStatus}</div>
      </div>

      <div style="margin-top:20px;border-top:1px solid #e7e1d2;padding-top:15px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span>Subtotal</span><b>₹${subtotal}</b></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span>Discount</span><b style="color:#08783f">- ₹${safeDiscount}</b></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px"><span>Delivery</span><b style="color:#08783f">FREE</b></div>
        <div style="display:flex;justify-content:space-between;font-size:21px;color:#063b25;border-top:1px solid #e7e1d2;padding-top:12px">
          <strong>Final Total</strong><strong>₹${finalTotal}</strong>
        </div>
      </div>

      <button class="btn btn-gold full" onclick="checkout()">PROCEED TO CHECKOUT</button>
      <button class="btn btn-white full" onclick="closeCart()">CONTINUE SHOPPING</button>
    </div>`;

  modal.classList.add("open");
}

function closeCart() {
  const modal = document.getElementById("cartModal");
  if (modal) modal.classList.remove("open");
}

function checkout() {
  if (!cartQty) {
    alert("पहले product cart में add करें।");
    return;
  }
  closeCart();
  openCheckout();
}

function openCheckout() {
  const modal = document.getElementById("checkoutModal");
  if (modal) modal.classList.add("open");
}

function closeCheckout() {
  const modal = document.getElementById("checkoutModal");
  if (modal) modal.classList.remove("open");
}

async function placeOrder(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const city = document.getElementById("city").value.trim();
  const state = document.getElementById("state").value;
  const pincode = document.getElementById("pincode").value.trim();
  const payment = document.getElementById("payment").value;

  if (!cartQty) return alert("पहले product cart में add करें।");
  if (!name) return alert("कृपया अपना पूरा नाम डालें।");
  if (!/^[0-9]{10}$/.test(phone)) return alert("कृपया सही 10 digit mobile number डालें।");
  if (!address) return alert("कृपया पूरा पता डालें।");
  if (!city) return alert("कृपया City / Village डालें।");
  if (state !== "Rajasthan") return alert("अभी TEJ-T CHAI की delivery केवल Rajasthan में उपलब्ध है।");
  if (!/^[0-9]{6}$/.test(pincode)) return alert("कृपया 6 digit PIN Code डालें।");
  if (!/^(30|31|32|33|34)[0-9]{4}$/.test(pincode)) return alert("यह Rajasthan का valid PIN Code नहीं लगता।");
  if (!payment) return alert("कृपया Payment Method चुनें।");

  const customer = { name, phone, address, city, state, pincode };

  const button = document.getElementById("placeOrderBtn");
  if (button) {
    button.disabled = true;
    button.textContent = "PROCESSING...";
  }

  try {
    if (payment === "cod") {
      processCODOrder(customer);
    } else {
      await startRazorpayPayment(customer);
    }
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "PLACE ORDER";
    }
  }
}

async function startRazorpayPayment(customer) {
  try {
    if (!window.Razorpay) throw new Error("Razorpay checkout load नहीं हुआ।");
    if (!razorpayKeyId) {
      const configResponse = await fetch(`${BACKEND_URL}/config`);
      const config = await configResponse.json();
      if (!config.success) throw new Error("Razorpay configuration नहीं मिली।");
      razorpayKeyId = config.key_id;
    }

    const response = await fetch(`${BACKEND_URL}/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quantity: cartQty,
        coupon: appliedCoupon || "",
        customer
      })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Razorpay order create नहीं हुआ।");
    }

    const options = {
      key: razorpayKeyId,
      amount: data.amount,
      currency: "INR",
      name: "TEJ-T CHAI",
      description: "TEJ-T Premium Blend 100g",
      order_id: data.order_id,
      prefill: { name: customer.name, contact: customer.phone },
      notes: {
        quantity: String(cartQty),
        coupon: appliedCoupon || "No Coupon",
        city: customer.city,
        pincode: customer.pincode
      },
      theme: { color: "#063b25" },
      handler: async function(paymentResponse) {
        await verifyRazorpayPayment(paymentResponse, customer, data);
      },
      modal: {
        ondismiss: function() {
          alert("Payment cancel कर दिया गया। आपका order अभी confirm नहीं हुआ है।");
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function(response) {
      console.error("Razorpay Payment Failed:", response.error);
      alert("❌ Payment failed.\n\nकृपया दोबारा कोशिश करें।");
    });
    rzp.open();
  } catch (error) {
    console.error(error);
    alert(`❌ Online Payment शुरू नहीं हो पाया।\n\n${error.message}`);
  }
}

async function verifyRazorpayPayment(paymentResponse, customer, razorpayOrderData) {
  try {
    const response = await fetch(`${BACKEND_URL}/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        quantity: cartQty,
        coupon: appliedCoupon || "",
        customer,
        expected_amount: razorpayOrderData.amount
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      alert(`❌ Payment verification failed.\n\n${data.message || "Order confirm नहीं हुआ।"}`);
      return;
    }

    processSuccessfulOnlineOrder(customer, data);
  } catch (error) {
    console.error(error);
    alert("Payment verification में समस्या आई।");
  }
}

function calculateTotals() {
  const subtotal = cartQty * PRICE;
  const safeDiscount = Math.min(discount || 0, subtotal);
  return { subtotal, discount: safeDiscount, total: subtotal - safeDiscount };
}

function processCODOrder(customer) {
  const totals = calculateTotals();
  const orderId = generateOrderId();

  const order = {
    orderId,
    name: customer.name,
    phone: customer.phone,
    address: customer.address,
    city: customer.city,
    state: customer.state,
    pincode: customer.pincode,
    payment: "cod",
    paymentStatus: "Pending",
    quantity: cartQty,
    subtotal: totals.subtotal,
    coupon: appliedCoupon || "",
    discount: totals.discount,
    total: totals.total,
    status: "Order Received",
    createdAt: new Date().toLocaleString("en-IN")
  };

  localStorage.setItem(orderId, JSON.stringify(order));
  sendWhatsAppOrder(order, "Cash on Delivery");

  alert(`✅ Order successfully received!\n\nOrder ID: ${orderId}\n\nQuantity: ${cartQty} Pack\n\nTotal: ₹${totals.total}\n\nअब WhatsApp खुलेगा।`);
  resetAfterOrder();
}

function processSuccessfulOnlineOrder(customer, paymentData) {
  const totals = calculateTotals();
  const orderId = generateOrderId();

  const order = {
    orderId,
    name: customer.name,
    phone: customer.phone,
    address: customer.address,
    city: customer.city,
    state: customer.state,
    pincode: customer.pincode,
    payment: "online",
    paymentStatus: "Paid",
    razorpayPaymentId: paymentData.payment_id,
    razorpayOrderId: paymentData.order_id,
    quantity: cartQty,
    subtotal: totals.subtotal,
    coupon: appliedCoupon || "",
    discount: totals.discount,
    total: totals.total,
    status: "Order Received",
    createdAt: new Date().toLocaleString("en-IN")
  };

  localStorage.setItem(orderId, JSON.stringify(order));
  sendWhatsAppOrder(order, "Online Payment - PAID");

  alert(`✅ Payment Successful!\n\nOrder ID: ${orderId}\n\nPayment: PAID\n\nQuantity: ${cartQty} Pack\n\nTotal: ₹${totals.total}\n\nअब WhatsApp खुलेगा।`);
  resetAfterOrder();
}

function generateOrderId() {
  return "TEJT" + Math.floor(1000 + Math.random() * 9000);
}

function sendWhatsAppOrder(order, paymentText) {
  const whatsappMessage = `Namaste TEJ-T CHAI! ☕\n\nNEW ORDER\n\nOrder ID:\n${order.orderId}\n\nProduct:\nTEJ-T Premium Blend 100g\n\nQuantity:\n${order.quantity} Pack\n\nSubtotal:\n₹${order.subtotal}\n\nCoupon:\n${order.coupon || "No Coupon"}\n\nDiscount:\n₹${order.discount}\n\nFINAL TOTAL:\n₹${order.total}\n\nPayment:\n${paymentText}\n\nCustomer Name:\n${order.name}\n\nMobile:\n${order.phone}\n\nAddress:\n${order.address}\n\nCity / Village:\n${order.city}\n\nRajasthan PIN:\n${order.pincode}\n\nThank you for ordering TEJ-T CHAI! ☕`;

  const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
  window.open(whatsappURL, "_blank", "noopener");
}

function resetAfterOrder() {
  cartQty = 0;
  appliedCoupon = "";
  discount = 0;
  qty = 1;
  updateCart();

  const qtyElement = document.getElementById("qty");
  if (qtyElement) qtyElement.textContent = "1";

  const form = document.getElementById("checkoutForm");
  if (form) form.reset();

  closeCheckout();
}

function trackOrder() {
  const input = document.getElementById("orderId");
  const result = document.getElementById("trackResult");
  if (!input || !result) return;

  const id = input.value.trim().toUpperCase();
  if (!id) {
    result.innerHTML = `<div class="notice">कृपया Order ID डालें।</div>`;
    return;
  }

  const order = localStorage.getItem(id);
  if (order) {
    const data = JSON.parse(order);
    result.innerHTML = `<div class="notice">Order <b>${id}</b> — <b>${data.status || "Order Received"}</b> ✅<br>Payment: <b>${data.paymentStatus}</b></div>`;
  } else {
    result.innerHTML = `<div class="notice">Order <b>${id}</b> इस browser में नहीं मिला।</div>`;
  }
}

function subscribe(event) {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  localStorage.setItem("tejTNewsletterEmail", email);
  alert("धन्यवाद! आपका email subscription save हो गया।");
  event.target.reset();
}

function toggleMenu() {
  const nav = document.querySelector("nav");
  if (!nav) return;
  nav.style.display = nav.style.display === "flex" ? "" : "flex";
  nav.style.position = "absolute";
  nav.style.top = "70px";
  nav.style.left = "0";
  nav.style.right = "0";
  nav.style.background = "#fff";
  nav.style.padding = "20px";
  nav.style.flexDirection = "column";
  nav.style.boxShadow = "0 10px 20px #0001";
}

window.addEventListener("click", function(e) {
  if (e.target.classList.contains("modal")) e.target.classList.remove("open");
});
