"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
const userStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['active', 'warned', 'suspended', 'banned']),
});
const userRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(['user', 'admin']),
});
router.use(auth_middleware_1.protect);
router.use(admin_middleware_1.adminOnly);
router.get('/dashboard', admin_controller_1.getDashboardStats);
router.get('/users', admin_controller_1.getUsers);
router.put('/users/:id/status', (0, validate_middleware_1.validateRequest)(userStatusSchema), admin_controller_1.updateUserStatus);
router.put('/users/:id/role', (0, validate_middleware_1.validateRequest)(userRoleSchema), admin_controller_1.updateUserRole);
router.get('/items', admin_controller_1.getItems);
router.put('/items/:id/approve', admin_controller_1.approveItem);
router.put('/items/:id/reject', admin_controller_1.rejectItem);
router.delete('/items/:id', admin_controller_1.deleteItem);
router.get('/community', admin_controller_1.getCommunityPosts);
router.put('/community/:id/approve', admin_controller_1.approveCommunityPost);
router.delete('/community/:id', admin_controller_1.deleteCommunityPost);
exports.default = router;
