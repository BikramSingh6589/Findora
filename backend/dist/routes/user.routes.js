"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const router = (0, express_1.Router)();
const updateMeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name cannot be empty').optional(),
    phone: zod_1.z.string().optional(),
    profilePic: zod_1.z.string().optional(),
});
router.get('/me', auth_middleware_1.protect, user_controller_1.getMe);
router.put('/me', auth_middleware_1.protect, (0, validate_middleware_1.validateRequest)(updateMeSchema), user_controller_1.updateMe);
router.get('/leaderboard', auth_middleware_1.protect, user_controller_1.getLeaderboard);
router.get('/:id', auth_middleware_1.protect, admin_middleware_1.adminOnly, user_controller_1.getUserById);
router.get('/:id/reports', auth_middleware_1.protect, user_controller_1.getUserReports);
exports.default = router;
