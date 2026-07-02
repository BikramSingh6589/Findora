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
