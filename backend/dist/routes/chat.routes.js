"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/:itemId/messages', auth_middleware_1.protect, chat_controller_1.getChatMessages);
router.post('/:itemId/messages', auth_middleware_1.protect, chat_controller_1.sendChatMessage);
exports.default = router;
