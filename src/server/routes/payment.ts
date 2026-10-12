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
  const { plan, customerName, customerEmail } = req.body;
  if (!plan || !['hourly', 'daily', 'pro'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan: must be hourly, daily, or pro' });
  }
  const order = storage.createPaymentOrder(plan, { name: customerName, email: customerEmail });
  res.json(order);
});

router.post('/verify', (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, customerName, customerEmail } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !plan) {
    return res.status(400).json({ error: 'Missing payment verification credentials' });
  }
  const license = storage.verifyPayment({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    plan,
    customerName,
    customerEmail,
  });
  res.json({ success: true, license, status: storage.getLicenseStatus() });
});

export default router;
