"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const foundItem_controller_1 = require("../controllers/foundItem.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
const foundItemSchema = zod_1.z.object({
    itemName: zod_1.z.string().min(1, 'Item name is required'),
    category: zod_1.z.string().min(1, 'Category is required'),
    brand: zod_1.z.string().optional(),
    color: zod_1.z.string().min(1, 'Color is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    locationFound: zod_1.z.string().min(1, 'Location found is required'),
    lastSeen: zod_1.z.string().optional(),
    dateFound: zod_1.z.string().transform((str) => new Date(str)),
    specialAppearance: zod_1.z.string().optional(),
    additionalNotes: zod_1.z.string().optional(),
});
router.post('/', auth_middleware_1.protect, upload_middleware_1.upload.array('images', 5), (0, validate_middleware_1.validateRequest)(foundItemSchema), foundItem_controller_1.createFoundItem);
router.get('/', auth_middleware_1.protect, foundItem_controller_1.getFoundItems);
router.get('/:id', auth_middleware_1.protect, foundItem_controller_1.getFoundItemById);
router.put('/:id', auth_middleware_1.protect, upload_middleware_1.upload.array('images', 5), (0, validate_middleware_1.validateRequest)(foundItemSchema), foundItem_controller_1.updateFoundItem);
router.delete('/:id', auth_middleware_1.protect, foundItem_controller_1.deleteFoundItem);
exports.default = router;
