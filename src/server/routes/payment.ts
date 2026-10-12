import { Router, Request, Response } from 'express';
import { storage } from '../storage';

const router = Router();

// Charges ₹499 per hour, ₹1,699 for a day (24h), ₹4,999 for Pro Access
router.get('/status', (_req: Request, res: Response) => {
  const status = storage.getLicenseStatus();
  res.json(status);
});

router.get('/licenses', (_req: Request, res: Response) => {
  const licenses = storage.getLicenses();
  res.json({ licenses });
});

router.post('/create-order', (req: Request, res: Response) => {
  const { plan, customerName, customerEmail, gateway } = req.body;
  if (!plan || !['hourly', 'daily', 'pro'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan: must be hourly, daily, or pro' });
  }
  const order = storage.createPaymentOrder(
    plan,
    { name: customerName, email: customerEmail },
    gateway === 'paytm' ? 'paytm' : 'razorpay'
  );
  res.json(order);
});

router.post('/verify', (req: Request, res: Response) => {
  const {
    gateway,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    paytm_order_id,
    paytm_txn_id,
    plan,
    customerName,
    customerEmail,
    gstDetails,
  } = req.body;

  const isPaytm = gateway === 'paytm' || !!paytm_order_id;
  if (!isPaytm && (!razorpay_order_id || !razorpay_payment_id)) {
    return res.status(400).json({ error: 'Missing Razorpay verification credentials' });
  }
  if (isPaytm && (!paytm_order_id || !paytm_txn_id)) {
    return res.status(400).json({ error: 'Missing Paytm verification credentials' });
  }
  if (!plan) {
    return res.status(400).json({ error: 'Missing license pass plan' });
  }

  const license = storage.verifyPayment({
    gateway: isPaytm ? 'paytm' : 'razorpay',
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    paytm_order_id,
    paytm_txn_id,
    plan,
    customerName,
    customerEmail,
    gstDetails,
  });

  res.json({ success: true, license, status: storage.getLicenseStatus() });
});

router.get('/invoice/:orderId', (req: Request, res: Response) => {
  const license = storage.getLicenseByOrderId(req.params.orderId);
  if (!license || !license.gstInvoice) {
    return res.status(404).json({ error: 'GST Tax invoice not found for this order' });
  }
  res.json({ invoice: license.gstInvoice, license });
});

export default router;

