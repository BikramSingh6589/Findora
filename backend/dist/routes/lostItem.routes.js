"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const lostItem_controller_1 = require("../controllers/lostItem.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
const lostItemSchema = zod_1.z.object({
    itemName: zod_1.z.string().min(1, 'Item name is required'),
    category: zod_1.z.string().min(1, 'Category is required'),
    brand: zod_1.z.string().optional(),
    color: zod_1.z.string().min(1, 'Color is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    locationLost: zod_1.z.string().min(1, 'Location lost is required'),
    dateLost: zod_1.z.string().transform((str) => new Date(str)),
    specialAppearance: zod_1.z.string().optional(),
});
router.post('/', auth_middleware_1.protect, upload_middleware_1.upload.array('images', 5), (0, validate_middleware_1.validateRequest)(lostItemSchema), lostItem_controller_1.createLostItem);
router.get('/', auth_middleware_1.protect, lostItem_controller_1.getLostItems);
router.get('/:id', auth_middleware_1.protect, lostItem_controller_1.getLostItemById);
router.put('/:id', auth_middleware_1.protect, upload_middleware_1.upload.array('images', 5), (0, validate_middleware_1.validateRequest)(lostItemSchema), lostItem_controller_1.updateLostItem);
router.delete('/:id', auth_middleware_1.protect, lostItem_controller_1.deleteLostItem);
exports.default = router;
