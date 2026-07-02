"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const community_controller_1 = require("../controllers/community.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const router = (0, express_1.Router)();
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const createPostSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Post content cannot be empty'),
    type: zod_1.z.enum(['found', 'suggestion', 'lost', 'spam', 'warning']).optional(),
    itemId: zod_1.z.string().regex(objectIdRegex, 'Invalid item ID').optional().nullable(),
});
const flagPostSchema = zod_1.z.object({
    reason: zod_1.z.string().min(1, 'Flag reason is required'),
});
const suggestOwnerSchema = zod_1.z.object({
    suggestedUserId: zod_1.z.string().regex(objectIdRegex, 'Invalid user ID'),
    note: zod_1.z.string().optional(),
});
router.use(auth_middleware_1.protect);
router.post('/', (0, validate_middleware_1.validateRequest)(createPostSchema), community_controller_1.createPost);
router.get('/', community_controller_1.getPosts);
router.post('/:id/flag', (0, validate_middleware_1.validateRequest)(flagPostSchema), community_controller_1.flagPost);
router.post('/:id/suggest-owner', (0, validate_middleware_1.validateRequest)(suggestOwnerSchema), community_controller_1.suggestOwner);
exports.default = router;
