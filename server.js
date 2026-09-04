require("dotenv").config();

const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("ERROR: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET .env में सेट करें।");
  process.exit(1);
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.get("/config", (req, res) => {
  res.json({
    success: true,
    key_id: process.env.RAZORPAY_KEY_ID
  });
});

function calculateDiscount(quantity, coupon) {
  const subtotal = quantity * 69;
  let discount = 0;

  if (coupon === "TEJ10") discount = Math.round(subtotal * 0.10);
  if (coupon === "TEJ20") discount = Math.round(subtotal * 0.20);

  return {
    subtotal,
    discount: Math.min(discount, subtotal),
    total: subtotal - Math.min(discount, subtotal)
  };
}

app.post("/create-order", async (req, res) => {
  try {
    const quantity = Number(req.body.quantity);
    const coupon = String(req.body.coupon || "").trim().toUpperCase();

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      return res.status(400).json({
        success: false,
        message: "Quantity invalid है।"
      });
    }

    const totals = calculateDiscount(quantity, coupon);

    const order = await razorpay.orders.create({
      amount: totals.total * 100,
      currency: "INR",
      receipt: "TEJT_" + Date.now(),
      notes: {
        quantity: String(quantity),
        coupon: coupon || "No Coupon"
      }
    });

    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Razorpay order create नहीं हुआ।"
    });
  }
});

app.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      quantity,
      coupon
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment response अधूरा है।"
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const valid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature, "utf8"),
      Buffer.from(String(razorpay_signature), "utf8")
    );

    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    // Optional server-side sanity check of quantity/coupon.
    const q = Number(quantity);
    if (!Number.isInteger(q) || q < 1 || q > 100) {
      return res.status(400).json({
        success: false,
        message: "Quantity invalid है।"
      });
    }

    res.json({
      success: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      message: "Payment verified successfully"
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });
  }
});

app.get("/", (req, res) => {
  res.send("TEJ-T CHAI server running");
});

app.listen(PORT, () => {
  console.log(`TEJ-T CHAI server running at http://localhost:${PORT}`);
});
