import { Router } from 'express';
import { z } from 'zod';
import {
  submitClaim,
  getClaims,
  getClaimById,
  cancelClaim,
  approveClaim,
  rejectClaim,
  resolveClaim,
  mediateClaim,
  mediationResolve,
  submitConflict,
  resolveConflict,
  getConflictsByItem,
  initiateConflictHandover
} from '../controllers/claim.controller';
import { protect } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const submitClaimSchema = z.object({
  foundItemId: z.string().regex(objectIdRegex, 'Invalid found item ID'),
  lostItemId: z.string().regex(objectIdRegex, 'Invalid lost item ID').optional().nullable(),
  answers: z.object({
    location: z.string().optional().default(''),
    dateDetails: z.string().optional().default(''),
    colorMatch: z.string().optional().default(''),
    specialMarks: z.string().optional().default(''),
  }).optional(),
  proofUrls: z.array(z.string()).optional(),
});

const adminDecisionSchema = z.object({
  remarks: z.string().optional(),
  reason: z.string().optional(),
  status: z.string().optional(),
});

// All routes are protected by JWT authentication
router.use(protect);

router.post(
  '/',
  upload.array('proof', 5),
  (req: any, res: any, next: any) => {
    // Parse multipart fields if stringified by frontend
    if (typeof req.body.answers === 'string') {
      try {
        req.body.answers = JSON.parse(req.body.answers);
      } catch (e) {
        // Continue, fallback to empty object if validation fails
      }
    }
    if (typeof req.body.proofUrls === 'string') {
      try {
        req.body.proofUrls = JSON.parse(req.body.proofUrls);
      } catch (e) {
        req.body.proofUrls = [req.body.proofUrls];
      }
    }
    next();
  },
  validateRequest(submitClaimSchema),
  submitClaim
);

router.get('/', getClaims);
router.get('/:id', getClaimById);
router.delete('/:id', cancelClaim);

// Admin claim decisions
router.post('/:id/approve', adminOnly, validateRequest(adminDecisionSchema), approveClaim);
router.post('/:id/reject', adminOnly, validateRequest(adminDecisionSchema), rejectClaim);

// Resolve, mediation, and handover claim actions
router.post('/:id/resolve', resolveClaim);
router.post('/:id/mediate', mediateClaim);
router.post('/:id/mediation-resolve', adminOnly, mediationResolve);

// Conflict resolution routes
router.post(
  '/:foundItemId/conflict',
  upload.array('proof', 5),
  (req: any, res: any, next: any) => {
    if (typeof req.body.answers === 'string') {
      try { req.body.answers = JSON.parse(req.body.answers); } catch (e) {}
    }
    if (typeof req.body.proofUrls === 'string') {
      try { req.body.proofUrls = JSON.parse(req.body.proofUrls); } catch (e) { req.body.proofUrls = [req.body.proofUrls]; }
    }
    next();
  },
  submitConflict
);
router.get('/conflict/:foundItemId', adminOnly, getConflictsByItem);
router.post('/conflict/:foundItemId/initiate-handover', adminOnly, initiateConflictHandover);
router.post('/conflict/:foundItemId/resolve', adminOnly, resolveConflict);

// Admin Handover Routes
import { finderHandoverChoice, adminVerifyDropoffCode, adminVerifyLocation, adminNotifyClaimantLocation, claimantVerifyLocation } from '../controllers/claim.controller';
router.post('/:id/finder-handover', finderHandoverChoice);
router.post('/:id/admin-verify-code', adminOnly, adminVerifyDropoffCode);
router.post('/:id/admin-verify-location', adminOnly, adminVerifyLocation);
router.post('/:id/admin-notify-location', adminOnly, adminNotifyClaimantLocation);
router.post('/:id/claimant-verify-location', claimantVerifyLocation);

// Support generic PUT /api/claims/:id for flexibility with frontend integration
router.put('/:id', adminOnly, validateRequest(adminDecisionSchema), async (req: any, res: any, next: any) => {
  const { status, remarks, reason } = req.body;
  if (status === 'approved' || status === 'Approved') {
    req.body.remarks = remarks || reason;
    return approveClaim(req, res, next);
  } else if (status === 'rejected' || status === 'Rejected') {
    req.body.reason = reason || remarks;
    return rejectClaim(req, res, next);
  } else {
    res.status(400).json({ success: false, error: 'Invalid claim status update request' });
  }
});

export default router;
