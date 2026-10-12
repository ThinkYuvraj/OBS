import { Router, Request, Response } from 'express';
import { storage } from '../storage';

const router = Router();

// Create new client support ticket
router.post('/tickets', (req: Request, res: Response) => {
  const {
    category,
    categoryLabel,
    customCategoryTitle,
    description,
    urgency,
    userEmail,
    userName,
    matchId,
    matchName,
    sport,
    overlayToken,
    systemMeta,
    screenshots,
  } = req.body;

  if (!description || !userEmail || !category) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Category, description, and client email are required to submit an issue ticket.',
    });
  }

  const ticket = storage.createSupportTicket({
    category,
    categoryLabel: categoryLabel || category,
    customCategoryTitle,
    description,
    urgency: urgency || 'medium',
    userEmail,
    userName: userName || 'Broadcaster',
    matchId,
    matchName,
    sport,
    overlayToken,
    systemMeta: systemMeta || {
      userAgent: req.headers['user-agent'] || 'Unknown',
      screenResolution: 'Unknown',
      url: req.headers['referer'] || req.originalUrl,
      timestamp: Date.now(),
    },
    screenshots: screenshots || [],
  });

  // Construct official support mail forwarding link
  const supportEmail = 'support@marketinglu.com';
  const mailSubject = encodeURIComponent(`[${ticket.id}] [${ticket.urgency.toUpperCase()}] ${ticket.categoryLabel} - ${ticket.matchName || 'Broadcast Suite'}`);
  const mailBody = encodeURIComponent(
    `Hello MarketinGlu Support Team,\n\n` +
    `Ticket ID: ${ticket.id}\n` +
    `Client Email: ${ticket.userEmail}\n` +
    `Category: ${ticket.categoryLabel}${ticket.customCategoryTitle ? ` (${ticket.customCategoryTitle})` : ''}\n` +
    `Urgency: ${ticket.urgency.toUpperCase()}\n` +
    `Match: ${ticket.matchName || 'N/A'} (ID: ${ticket.matchId || 'N/A'}, Sport: ${ticket.sport || 'N/A'})\n` +
    `Overlay Token: ${ticket.overlayToken || 'N/A'}\n\n` +
    `Issue Details:\n${ticket.description}\n\n` +
    `Attachments: ${ticket.screenshots.length} screenshot(s) attached.\n\n` +
    `Timestamp: ${new Date(ticket.createdAt).toISOString()}\n`
  );

  const mailtoLink = `mailto:${supportEmail}?subject=${mailSubject}&body=${mailBody}`;

  res.status(201).json({
    success: true,
    ticket,
    supportEmail,
    mailtoLink,
    message: `Issue ticket ${ticket.id} registered successfully. You can also forward this ticket directly to ${supportEmail}.`,
  });
});

// List all support tickets
router.get('/tickets', (_req: Request, res: Response) => {
  const tickets = storage.getSupportTickets();
  res.json({
    tickets,
    totalCount: tickets.length,
    supportEmail: 'support@marketinglu.com',
    escalationEmail: 'escalations@marketinglu.com',
  });
});

// Get single ticket by ID
router.get('/tickets/:id', (req: Request, res: Response) => {
  const ticket = storage.getSupportTicket(req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  res.json({ ticket });
});

export default router;
