"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPagination = void 0;
const getPagination = (query, defaultLimit = 10) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit) || defaultLimit));
    const skip = (page - 1) * limit;
    return { skip, limit, page };
};
exports.getPagination = getPagination;
