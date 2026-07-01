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
app.use('/api/users', (req, res, next) => { res.status(404).json({ error: 'Endpoint not implemented yet' }); });
app.use('/api/claims', (req, res, next) => { res.status(404).json({ error: 'Endpoint not implemented yet' }); });
app.use('/api/notifications', (req, res, next) => { res.status(404).json({ error: 'Endpoint not implemented yet' }); });
app.use('/api/community', (req, res, next) => { res.status(404).json({ error: 'Endpoint not implemented yet' }); });
app.use('/api/ai', (req, res, next) => { res.status(404).json({ error: 'Endpoint not implemented yet' }); });
app.use('/api/handover', (req, res, next) => { res.status(404).json({ error: 'Endpoint not implemented yet' }); });
app.use('/api/chat', (req, res, next) => { res.status(404).json({ error: 'Endpoint not implemented yet' }); });
app.use('/api/admin', (req, res, next) => { res.status(404).json({ error: 'Endpoint not implemented yet' }); });
app.use('/api/categories', (req, res, next) => { res.status(404).json({ error: 'Endpoint not implemented yet' }); });

// Global Error Handler
app.use(errorHandler);

export default app;
