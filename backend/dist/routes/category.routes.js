"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const category_controller_1 = require("../controllers/category.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const router = (0, express_1.Router)();
const categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Category name is required'),
    description: zod_1.z.string().optional(),
});
// Category endpoints
router.get('/', category_controller_1.getCategories);
router.post('/', auth_middleware_1.protect, admin_middleware_1.adminOnly, (0, validate_middleware_1.validateRequest)(categorySchema), category_controller_1.createCategory);
router.put('/:id', auth_middleware_1.protect, admin_middleware_1.adminOnly, (0, validate_middleware_1.validateRequest)(categorySchema), category_controller_1.updateCategory);
router.delete('/:id', auth_middleware_1.protect, admin_middleware_1.adminOnly, category_controller_1.deleteCategory);
exports.default = router;
