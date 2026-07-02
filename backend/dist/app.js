"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const errorHandler_1 = require("./middleware/errorHandler");
const response_1 = require("./utils/response");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const lostItem_routes_1 = __importDefault(require("./routes/lostItem.routes"));
const foundItem_routes_1 = __importDefault(require("./routes/foundItem.routes"));
const claim_routes_1 = __importDefault(require("./routes/claim.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const community_routes_1 = __importDefault(require("./routes/community.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const handover_routes_1 = __importDefault(require("./routes/handover.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use((0, morgan_1.default)('dev'));
// Base route / health check
app.get('/health', (req, res) => {
    (0, response_1.sendSuccess)(res, { status: 'OK' }, 'Server is healthy');
});
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/categories', category_routes_1.default);
app.use('/api/lost-items', lostItem_routes_1.default);
app.use('/api/found-items', foundItem_routes_1.default);
app.use('/api/claims', claim_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/community', community_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/handover', handover_routes_1.default);
app.use('/api/chat', chat_routes_1.default);
// Global Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
