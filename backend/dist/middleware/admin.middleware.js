"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = void 0;
const response_1 = require("../utils/response");
const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        (0, response_1.sendError)(res, 'Admin access required', 403);
        return;
    }
    next();
};
exports.adminOnly = adminOnly;
