import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import { sendSuccess } from './utils/response';

import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import lostItemRoutes from './routes/lostItem.routes';
import foundItemRoutes from './routes/foundItem.routes';
import claimRoutes from './routes/claim.routes';
import adminRoutes from './routes/admin.routes';
import communityRoutes from './routes/community.routes';
import userRoutes from './routes/user.routes';
import notificationRoutes from './routes/notification.routes';
import aiRoutes from './routes/ai.routes';
import handoverRoutes from './routes/handover.routes';
import chatRoutes from './routes/chat.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Base route / health check
app.get('/health', (req: Request, res: Response) => {
  sendSuccess(res, { status: 'OK' }, 'Server is healthy');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/lost-items', lostItemRoutes);
app.use('/api/found-items', foundItemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/handover', handoverRoutes);
app.use('/api/chat', chatRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
