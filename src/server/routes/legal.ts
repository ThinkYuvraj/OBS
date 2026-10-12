import { Router, Request, Response } from 'express';
import { storage } from '../storage';

const router = Router();

// Official Legal Disclosures under Rule 5 of Consumer Protection (E-Commerce) Rules, 2020
// and Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021
const COMPANY_LEGAL_ENTITY = {
  legalName: 'MarketinGlu Technologies Private Limited',
  brandName: 'MarketinGlu Broadcast OS & Real-Time Scorebug Engine',
  incorporationCountry: 'India',
  cin: 'U72900DL2024PTC123456',
  gstin: '07AAECM4920M1Z8',
  pan: 'AAECM4920M',
  sacCode: '998434',
  sacDescription: 'Cloud-hosted Real-time Sports Broadcast Graphics Transmission & SaaS Software Services',
  registeredOffice: {
    line1: 'Level 4, Statesman House, Barakhamba Road',
    line2: 'Connaught Place',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    country: 'India',
  },
  customerCare: {
    email: 'support@marketinglu.com',
    phone: '+91 (011) 4892-0199',
    hours: '24x7 Broadcast NOC & Match Operations Desk',
  },
  // Statutory Grievance Redressal Officer under Rule 3(2) of IT Rules 2021
  grievanceOfficer: {
    name: 'Mr. Advait Sharma',
    designation: 'Head of Legal & Statutory Grievance Redressal Officer',
    email: 'grievance@marketinglu.com',
    phone: '+91 98110-02941',
    officeAddress: 'Legal Compliance Cell, MarketinGlu Technologies Pvt Ltd, Level 4, Statesman House, Connaught Place, New Delhi - 110001, India',
    workingHours: 'Monday to Friday, 09:30 AM – 06:30 PM IST',
    statutoryTimelines: {
      acknowledgment: 'Within 24 hours of ticket receipt',
      disposal: 'Within 15 days of grievance registration',
    },
  },
  // Nodal Contact Person under Rule 3(b) of IT Rules 2021 for 24x7 coordination with Law Enforcement Agencies
  nodalContactPerson: {
    name: 'Mr. Rajeshwar Mehra',
    designation: 'Nodal Officer (Law Enforcement Coordination)',
    email: 'nodal.officer@marketinglu.com',
    phone: '+91 98110-02942',
    responseTarget: '24x7 immediate regulatory and law enforcement coordination',
  },
  governingLaw: 'Laws of India (Republic of India)',
  exclusiveJurisdiction: 'Courts of competent jurisdiction in New Delhi, India',
};

// 1. Get Company Legal Entity Disclosures
router.get('/company-info', (_req: Request, res: Response) => {
  res.json({ success: true, company: COMPANY_LEGAL_ENTITY });
});

// 2. Submit Statutory Grievance under IT Rules 2021 Rule 3(2)
router.post('/grievance', (req: Request, res: Response) => {
  const {
    category,
    complainantName,
    complainantEmail,
    complainantPhone,
    complainantState,
    subject,
    statementOfFacts,
    reliefSought,
    referenceUrl,
  } = req.body;

  if (!complainantName || !complainantEmail || !subject || !statementOfFacts) {
    return res.status(400).json({ error: 'Complainant name, email, subject, and statement of facts are required by statutory norms' });
  }

  const ticket = storage.createGrievanceTicket({
    category: category || 'intermediary_compliance',
    complainantName,
    complainantEmail,
    complainantPhone: complainantPhone || 'Not provided',
    complainantState: complainantState || 'Delhi',
    subject,
    statementOfFacts,
    reliefSought: reliefSought || 'Investigation and corrective action',
    referenceUrl,
  });

  res.json({
    success: true,
    ticket,
    message: 'Grievance registered successfully. Under Rule 3(2) of IT Rules 2021, acknowledgment has been generated and resolution shall be issued within 15 days.',
  });
});

// 3. Get Grievance Tickets
router.get('/grievances', (_req: Request, res: Response) => {
  const tickets = storage.getGrievanceTickets();
  res.json({ success: true, grievances: tickets });
});

// 4. Submit DPDP Act 2023 Data Principal Rights Request
router.post('/dpdp-request', (req: Request, res: Response) => {
  const {
    requestType,
    applicantName,
    applicantEmail,
    applicantPhone,
    identityProofType,
    requestDetails,
  } = req.body;

  if (!applicantName || !applicantEmail || !requestType || !requestDetails) {
    return res.status(400).json({ error: 'Applicant name, email, request type, and details are required' });
  }

  const request = storage.createDpdpRequest({
    requestType,
    applicantName,
    applicantEmail,
    applicantPhone: applicantPhone || 'Not provided',
    identityProofType: identityProofType || 'aadhaar_masked',
    requestDetails,
  });

  res.json({
    success: true,
    request,
    message: 'DPDP Data Principal Request received. Our Data Protection Officer will process and respond within the statutory time frame.',
  });
});

// 5. Get DPDP Requests
router.get('/dpdp-requests', (_req: Request, res: Response) => {
  const requests = storage.getDpdpRequests();
  res.json({ success: true, requests });
});

// 6. Submit Copyright / Broadcast Infringement Takedown Notice
router.post('/takedown-notice', (req: Request, res: Response) => {
  const {
    copyrightOwner,
    authorizedAgent,
    contactEmail,
    workDescription,
    infringingUrl,
    goodFaithDeclaration,
  } = req.body;

  if (!copyrightOwner || !contactEmail || !workDescription || !infringingUrl || !goodFaithDeclaration) {
    return res.status(400).json({ error: 'All fields including good faith declaration are required under Section 37 / Rule 3(1)(d)' });
  }

  const notice = storage.createTakedownNotice({
    copyrightOwner,
    authorizedAgent: authorizedAgent || copyrightOwner,
    contactEmail,
    workDescription,
    infringingUrl,
    goodFaithDeclaration: !!goodFaithDeclaration,
  });

  res.json({
    success: true,
    notice,
    message: 'Takedown notice logged. Legal counsel will inspect the broadcast feed and respond within 24-36 hours.',
  });
});

// 7. Get Takedown Notices
router.get('/takedown-notices', (_req: Request, res: Response) => {
  const notices = storage.getTakedownNotices();
  res.json({ success: true, notices });
});

export default router;
