"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const ai_controller_1 = require("../controllers/ai.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const router = (0, express_1.Router)();
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['new', 'reviewed', 'dismissed'])
});
const triggerSchema = zod_1.z.object({
    itemId: zod_1.z.string().regex(objectIdRegex, 'Invalid item ID'),
    itemType: zod_1.z.enum(['lost', 'found'])
});
// All routes are protected by JWT authentication
router.use(auth_middleware_1.protect);
router.get('/matches', ai_controller_1.getMatches);
router.get('/matches/:itemId', ai_controller_1.getItemMatches);
router.get('/matches/match/:matchId', ai_controller_1.getMatchDetails);
router.put('/matches/:matchId/status', (0, validate_middleware_1.validateRequest)(updateStatusSchema), ai_controller_1.updateMatchStatus);
router.patch('/matches/:matchId/status', (0, validate_middleware_1.validateRequest)(updateStatusSchema), ai_controller_1.updateMatchStatus);
router.post('/trigger', (0, validate_middleware_1.validateRequest)(triggerSchema), ai_controller_1.triggerManualMatching);
exports.default = router;
