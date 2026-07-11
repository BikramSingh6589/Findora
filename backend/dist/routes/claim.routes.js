"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const claim_controller_1 = require("../controllers/claim.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const submitClaimSchema = zod_1.z.object({
    foundItemId: zod_1.z.string().regex(objectIdRegex, 'Invalid found item ID'),
    lostItemId: zod_1.z.string().regex(objectIdRegex, 'Invalid lost item ID').optional().nullable(),
    answers: zod_1.z.object({
        location: zod_1.z.string().optional().default(''),
        dateDetails: zod_1.z.string().optional().default(''),
        colorMatch: zod_1.z.string().optional().default(''),
        specialMarks: zod_1.z.string().optional().default(''),
    }).optional(),
    proofUrls: zod_1.z.array(zod_1.z.string()).optional(),
});
const adminDecisionSchema = zod_1.z.object({
    remarks: zod_1.z.string().optional(),
    reason: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
});
// All routes are protected by JWT authentication
router.use(auth_middleware_1.protect);
router.post('/', upload_middleware_1.upload.array('proof', 5), (req, res, next) => {
    // Parse multipart fields if stringified by frontend
    if (typeof req.body.answers === 'string') {
        try {
            req.body.answers = JSON.parse(req.body.answers);
        }
        catch (e) {
            // Continue, fallback to empty object if validation fails
        }
    }
    if (typeof req.body.proofUrls === 'string') {
        try {
            req.body.proofUrls = JSON.parse(req.body.proofUrls);
        }
        catch (e) {
            req.body.proofUrls = [req.body.proofUrls];
        }
    }
    next();
}, (0, validate_middleware_1.validateRequest)(submitClaimSchema), claim_controller_1.submitClaim);
router.get('/', claim_controller_1.getClaims);
router.get('/:id', claim_controller_1.getClaimById);
router.delete('/:id', claim_controller_1.cancelClaim);
// Admin claim decisions
router.post('/:id/approve', admin_middleware_1.adminOnly, (0, validate_middleware_1.validateRequest)(adminDecisionSchema), claim_controller_1.approveClaim);
router.post('/:id/reject', admin_middleware_1.adminOnly, (0, validate_middleware_1.validateRequest)(adminDecisionSchema), claim_controller_1.rejectClaim);
// Resolve, mediation, and handover claim actions
router.post('/:id/resolve', claim_controller_1.resolveClaim);
router.post('/:id/mediate', claim_controller_1.mediateClaim);
router.post('/:id/mediation-resolve', admin_middleware_1.adminOnly, claim_controller_1.mediationResolve);
// Conflict resolution routes
router.post('/:foundItemId/conflict', upload_middleware_1.upload.array('proof', 5), (req, res, next) => {
    if (typeof req.body.answers === 'string') {
        try {
            req.body.answers = JSON.parse(req.body.answers);
        }
        catch (e) { }
    }
    if (typeof req.body.proofUrls === 'string') {
        try {
            req.body.proofUrls = JSON.parse(req.body.proofUrls);
        }
        catch (e) {
            req.body.proofUrls = [req.body.proofUrls];
        }
    }
    next();
}, claim_controller_1.submitConflict);
router.get('/conflict/:foundItemId', admin_middleware_1.adminOnly, claim_controller_1.getConflictsByItem);
router.post('/conflict/:foundItemId/initiate-handover', admin_middleware_1.adminOnly, claim_controller_1.initiateConflictHandover);
router.post('/conflict/:foundItemId/resolve', admin_middleware_1.adminOnly, claim_controller_1.resolveConflict);
// Admin Handover Routes
const claim_controller_2 = require("../controllers/claim.controller");
router.post('/:id/finder-handover', claim_controller_2.finderHandoverChoice);
router.post('/:id/admin-verify-code', admin_middleware_1.adminOnly, claim_controller_2.adminVerifyDropoffCode);
router.post('/:id/admin-verify-location', admin_middleware_1.adminOnly, claim_controller_2.adminVerifyLocation);
router.post('/:id/admin-notify-location', admin_middleware_1.adminOnly, claim_controller_2.adminNotifyClaimantLocation);
router.post('/:id/claimant-verify-location', claim_controller_2.claimantVerifyLocation);
// Support generic PUT /api/claims/:id for flexibility with frontend integration
router.put('/:id', admin_middleware_1.adminOnly, (0, validate_middleware_1.validateRequest)(adminDecisionSchema), async (req, res, next) => {
    const { status, remarks, reason } = req.body;
    if (status === 'approved' || status === 'Approved') {
        req.body.remarks = remarks || reason;
        return (0, claim_controller_1.approveClaim)(req, res, next);
    }
    else if (status === 'rejected' || status === 'Rejected') {
        req.body.reason = reason || remarks;
        return (0, claim_controller_1.rejectClaim)(req, res, next);
    }
    else {
        res.status(400).json({ success: false, error: 'Invalid claim status update request' });
    }
});
exports.default = router;
