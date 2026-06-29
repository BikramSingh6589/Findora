# Backend Implementation Plan — Campus Lost & Found AI System

> **Goal:** Step-by-step guide to build the Node.js/Express backend from scratch.
> Each phase builds on the previous one. Follow phases in order.
> Reference `Frontend_Variables.md` for exact field names and API contracts.

---

## Phase 1: Project Setup & Foundation

### 1.1 Initialize Project

```bash
mkdir backend && cd backend
npm init -y
npm install express mongoose dotenv cors helmet morgan bcryptjs jsonwebtoken multer cloudinary qrcode nodemailer socket.io zod uuid
npm install --save-dev nodemon typescript ts-node @types/node @types/express @types/bcryptjs @types/jsonwebtoken @types/multer @types/cors
```

### 1.2 Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts                  # MongoDB connection
│   │   └── cloudinary.ts          # Cloudinary setup
│   ├── models/
│   │   ├── User.ts
│   │   ├── LostItem.ts
│   │   ├── FoundItem.ts
│   │   ├── Claim.ts
│   │   ├── Notification.ts
│   │   ├── AIMatch.ts
│   │   ├── CommunityPost.ts
│   │   ├── ChatMessage.ts
│   │   └── Category.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── lostItem.routes.ts
│   │   ├── foundItem.routes.ts
│   │   ├── claim.routes.ts
│   │   ├── notification.routes.ts
│   │   ├── community.routes.ts
│   │   ├── ai.routes.ts
│   │   ├── handover.routes.ts
│   │   ├── chat.routes.ts
│   │   ├── admin.routes.ts
│   │   └── category.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── lostItem.controller.ts
│   │   ├── foundItem.controller.ts
│   │   ├── claim.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── community.controller.ts
│   │   ├── ai.controller.ts
│   │   ├── handover.controller.ts
│   │   ├── chat.controller.ts
│   │   └── admin.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts       # JWT verification
│   │   ├── admin.middleware.ts      # Role check (admin only)
│   │   ├── validate.middleware.ts   # Zod schema validation
│   │   ├── upload.middleware.ts     # Multer image upload
│   │   └── errorHandler.ts         # Global error handler
│   ├── services/
│   │   ├── email.service.ts         # Nodemailer emails
│   │   ├── cloudinary.service.ts    # Image upload to Cloudinary
│   │   ├── qr.service.ts            # QR code generation
│   │   ├── ai.service.ts            # AI matching trigger
│   │   ├── notification.service.ts  # Create & push notifications
│   │   └── reputation.service.ts    # XP and badge logic
│   ├── socket/
│   │   └── socket.ts                # Socket.IO initialization
│   ├── utils/
│   │   ├── jwt.ts                   # Token sign/verify helpers
│   │   ├── response.ts              # Standard JSON response helpers
│   │   └── pagination.ts            # Pagination query builder
│   └── app.ts                       # Express app setup + middleware
├── server.ts                        # Entry point
├── .env
├── tsconfig.json
└── package.json
```

### 1.3 Environment Variables (.env)

```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/lostandfound
JWT_SECRET=your_very_long_jwt_secret_here
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 1.4 Database Connection

```typescript
// src/config/db.ts
import mongoose from 'mongoose';

export const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('MongoDB connected');
};
```

### 1.5 App Setup

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lost-items', lostItemRoutes);
app.use('/api/found-items', foundItemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/handover', handoverRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);

app.use(errorHandler);

export default app;
```

---

## Phase 2: Authentication Module

### 2.1 User Model (MongoDB Schema)

```typescript
// src/models/User.ts
import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  name:            { type: String, required: true, trim: true },
  email:           { type: String, required: true, unique: true, lowercase: true },
  password:        { type: String, required: true, minlength: 8 },
  studentId:       { type: String, unique: true, sparse: true },
  phone:           { type: String, default: '' },
  profilePic:      { type: String, default: '' },
  role:            { type: String, enum: ['user', 'admin'], default: 'user' },
  status:          { type: String, enum: ['active', 'banned'], default: 'active' },
  xp:              { type: Number, default: 0 },
  level:           { type: Number, default: 1 },
  badges:          { type: [String], default: ['Newcomer'] },
  reputation:      { type: Number, default: 0 },
  itemsReturned:   { type: Number, default: 0 },
  itemsReported:   { type: Number, default: 0 },
  resetToken:      String,
  resetTokenExpiry: Date,
}, { timestamps: true });

// Hash password before save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

export default mongoose.model('User', UserSchema);
```

### 2.2 Auth Controller

Implement these functions in `src/controllers/auth.controller.ts`:

| Function              | Endpoint                    | Logic                                                             |
|-----------------------|-----------------------------|-------------------------------------------------------------------|
| `register`            | POST /api/auth/register     | Validate fields, check duplicate email, hash pw, save, return JWT|
| `login`               | POST /api/auth/login        | Find user, compare pw with bcrypt, sign JWT, return token + user |
| `adminLogin`          | POST /api/auth/admin/login  | Same as login but verify role === 'admin'                        |
| `getMe`               | GET /api/auth/me            | Return req.user (set by auth middleware)                          |
| `forgotPassword`      | POST /api/auth/forgot-pw    | Generate UUID token, set resetToken + expiry, send email          |
| `resetPassword`       | POST /api/auth/reset-pw     | Verify resetToken + expiry, hash new pw, clear token             |
| `logout`              | POST /api/auth/logout       | Client-side only (JWT is stateless); return success               |

### 2.3 JWT Middleware

```typescript
// src/middleware/auth.middleware.ts
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const protect = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }
  const token = authHeader.split(' ')[1];
  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
  req.user = await User.findById(decoded.userId).select('-password');
  if (!req.user) return res.status(401).json({ success: false, error: 'User not found' });
  next();
};
```

### 2.4 Admin Middleware

```typescript
export const adminOnly = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};
```

---

## Phase 3: Lost & Found Item CRUD

### 3.1 LostItem Schema

```typescript
const LostItemSchema = new Schema({
  owner:            { type: Schema.Types.ObjectId, ref: 'User', required: true },
  itemName:         { type: String, required: true },
  category:         { type: String, required: true },
  brand:            { type: String, default: '' },
  color:            { type: String, required: true },
  description:      { type: String, required: true },
  locationLost:     { type: String, required: true },
  dateLost:         { type: Date, required: true },
  specialAppearance:{ type: String, default: '' },
  images:           { type: [String], default: [] },
  status:           { type: String, enum: ['active', 'resolved', 'archived'], default: 'active' },
  aiMatchScore:     { type: Number, default: 0 },
}, { timestamps: true });

LostItemSchema.index({ itemName: 'text', description: 'text' });
LostItemSchema.index({ category: 1, status: 1 });
```

### 3.2 FoundItem Schema

```typescript
const FoundItemSchema = new Schema({
  finder:            { type: Schema.Types.ObjectId, ref: 'User', required: true },
  itemName:          { type: String, required: true },
  category:          { type: String, required: true },
  brand:             { type: String, default: '' },
  color:             { type: String, required: true },
  description:       { type: String, required: true },
  locationFound:     { type: String, required: true },
  dateFound:         { type: Date, required: true },
  specialAppearance: { type: String, default: '' },
  additionalNotes:   { type: String, default: '' },
  images:            { type: [String], default: [] },
  status:            { type: String, enum: ['active', 'claimed', 'archived'], default: 'active' },
}, { timestamps: true });
```

### 3.3 Image Upload Middleware

```typescript
// src/middleware/upload.middleware.ts
import multer from 'multer';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});
```

### 3.4 Cloudinary Upload Service

```typescript
// src/services/cloudinary.service.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = (buffer: Buffer, folder = 'lost-found'): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (err, result) => {
      if (err) reject(err);
      else resolve(result!.secure_url);
    }).end(buffer);
  });
};

export const deleteImage = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId);
};
```

### 3.5 Lost Item Controller (POST example)

```typescript
export const createLostItem = async (req: any, res: any) => {
  const files = req.files as Express.Multer.File[];
  const imageUrls = await Promise.all(files.map(f => uploadImage(f.buffer)));

  const item = await LostItem.create({
    ...req.body,
    images: imageUrls,
    owner: req.user._id,
  });

  // Trigger AI matching asynchronously (don't await)
  aiService.triggerMatching(item._id.toString(), 'lost').catch(console.error);

  // Award XP for reporting
  await reputationService.addXP(req.user._id, 10);

  return res.status(201).json({ success: true, item });
};
```

### 3.6 GET with Pagination & Search

```typescript
export const getLostItems = async (req: any, res: any) => {
  const { page = 1, limit = 10, category, search, status } = req.query;
  const query: any = {};
  if (category) query.category = category;
  if (status) query.status = status;
  if (search) query['$text'] = { '$search': search };

  const [items, total] = await Promise.all([
    LostItem.find(query)
      .populate('owner', 'name profilePic')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit)),
    LostItem.countDocuments(query),
  ]);

  return res.json({ success: true, items, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
};
```

---

## Phase 4: Claim Workflow

### 4.1 Claim Schema

```typescript
const ClaimSchema = new Schema({
  claimId:       { type: String, unique: true },   // e.g. CLM-001
  foundItemId:   { type: Schema.Types.ObjectId, ref: 'FoundItem', required: true },
  lostItemId:    { type: Schema.Types.ObjectId, ref: 'LostItem' },
  claimant:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status:        { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  answers: {
    location:     String,
    dateDetails:  String,
    colorMatch:   String,
    specialMarks: String,
  },
  proofUrls:     { type: [String], default: [] },
  confidence:    { type: Number, default: 0 },
  qrCodeUrl:     { type: String, default: '' },
  qrToken:       { type: String, default: '' },
  remarks:       { type: String, default: '' },
  reason:        { type: String, default: '' },
}, { timestamps: true });

ClaimSchema.index({ status: 1, claimant: 1 });
```

### 4.2 Auto-generate claimId (pre-save hook)

```typescript
ClaimSchema.pre('save', async function(next) {
  if (!this.claimId) {
    const count = await Claim.countDocuments();
    this.claimId = 'CLM-' + String(count + 1).padStart(3, '0');
  }
  next();
});
```

### 4.3 Approve Claim Flow

```typescript
export const approveClaim = async (req: any, res: any) => {
  const claim = await Claim.findById(req.params.id).populate('claimant');
  if (!claim) return res.status(404).json({ success: false, error: 'Claim not found' });

  // Generate QR token and code
  const qrToken = uuidv4();
  const qrCodeUrl = await qrService.generateQR(qrToken);

  await claim.updateOne({ status: 'approved', qrToken, qrCodeUrl, remarks: req.body.remarks });

  // Notify claimant
  await notificationService.create(claim.claimant._id, 'claim_approved',
    'Claim Approved!',
    'Your claim has been approved. Present the QR code at the Lost & Found office.',
    { relatedClaimId: claim._id }
  );

  return res.json({ success: true, qrCode: qrCodeUrl });
};
```

---

## Phase 5: Notification System

### 5.1 Notification Schema

```typescript
const NotificationSchema = new Schema({
  user:           { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type:           { type: String, enum: ['match', 'claim_approved', 'claim_rejected', 'pickup_reminder', 'system'] },
  title:          { type: String, required: true },
  message:        { type: String, required: true },
  read:           { type: Boolean, default: false },
  relatedItemId:  { type: Schema.Types.ObjectId },
  relatedClaimId: { type: Schema.Types.ObjectId },
}, { timestamps: true });

NotificationSchema.index({ user: 1, read: 1 });
```

### 5.2 Notification Service

```typescript
// src/services/notification.service.ts
import Notification from '../models/Notification';
import { io } from '../socket/socket';

export const create = async (userId: string, type: string, title: string, message: string, relatedIds = {}) => {
  const notif = await Notification.create({ user: userId, type, title, message, ...relatedIds });
  // Real-time push via Socket.IO
  io.to(`user:${userId}`).emit('new_notification', notif);
  return notif;
};
```

---

## Phase 6: AI Matching (MVP Text-Based)

### 6.1 AIMatch Schema

```typescript
const AIMatchSchema = new Schema({
  lostItem:  { type: Schema.Types.ObjectId, ref: 'LostItem' },
  foundItem: { type: Schema.Types.ObjectId, ref: 'FoundItem' },
  score:     { type: Number, required: true },
  status:    { type: String, enum: ['new', 'reviewed', 'dismissed'], default: 'new' },
}, { timestamps: true });
```

### 6.2 Matching Algorithm (Simple Scoring)

```typescript
// src/services/ai.service.ts
export const triggerMatching = async (itemId: string, type: 'lost' | 'found') => {
  const sourceItem = type === 'lost' ? await LostItem.findById(itemId) : await FoundItem.findById(itemId);
  const targets = type === 'lost'
    ? await FoundItem.find({ status: 'active' })
    : await LostItem.find({ status: 'active' });

  for (const target of targets) {
    let score = 0;
    if (sourceItem.category === target.category) score += 20;
    if (sourceItem.brand && target.brand && sourceItem.brand.toLowerCase() === target.brand.toLowerCase()) score += 15;
    if (sourceItem.color && target.color && sourceItem.color.toLowerCase() === target.color.toLowerCase()) score += 10;
    score += textSimilarity(sourceItem.description, target.description) * 10;

    if (score >= 40) {
      const existing = await AIMatch.findOne({ lostItem: type === 'lost' ? itemId : target._id, foundItem: type === 'found' ? itemId : target._id });
      if (!existing) {
        await AIMatch.create({ lostItem: type === 'lost' ? itemId : target._id, foundItem: type === 'found' ? itemId : target._id, score });
        if (score >= 80) {
          // Notify owner
          const ownerId = type === 'lost' ? sourceItem.owner : target.owner;
          await notificationService.create(ownerId, 'match', 'Potential Match Found!', 'We found a potential match for your lost item.', { relatedItemId: itemId });
        }
      }
    }
  }
};

const textSimilarity = (a: string, b: string): number => {
  const wordsA = a.toLowerCase().split(/\s+/);
  const wordsB = new Set(b.toLowerCase().split(/\s+/));
  const common = wordsA.filter(w => wordsB.has(w));
  return common.length / Math.max(wordsA.length, wordsB.size);
};
```

---

## Phase 7: Community Board (24-Hour TTL)

### 7.1 CommunityPost Schema with Auto-Expiry

```typescript
const CommunityPostSchema = new Schema({
  author:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  itemId:     { type: Schema.Types.ObjectId, ref: 'FoundItem' },
  content:    { type: String, required: true },
  type:       { type: String, enum: ['found', 'suggestion'], default: 'found' },
  flagReason: { type: String, default: '' },
  status:     { type: String, enum: ['active', 'flagged', 'removed'], default: 'active' },
  expiresAt:  { type: Date, required: true },
}, { timestamps: true });

// MongoDB TTL index — auto-delete documents after expiresAt
CommunityPostSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### 7.2 Creating a Post

```typescript
export const createPost = async (req: any, res: any) => {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 hours
  const post = await CommunityPost.create({ ...req.body, author: req.user._id, expiresAt });
  await reputationService.addXP(req.user._id, 5);
  return res.status(201).json({ success: true, post });
};
```

---

## Phase 8: Real-Time Chat (Socket.IO)

### 8.1 Socket Setup

```typescript
// src/socket/socket.ts
import { Server } from 'socket.io';

export let io: Server;

export const initSocket = (httpServer: any) => {
  io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL, methods: ['GET', 'POST'] }
  });

  io.on('connection', (socket) => {
    // User joins their personal room (for notifications)
    socket.on('join_user', ({ userId }) => socket.join(`user:${userId}`));

    // Join item chat room
    socket.on('join_room', ({ itemId }) => socket.join(`item:${itemId}`));

    // Send message to room
    socket.on('send_message', async ({ itemId, content, senderId }) => {
      const msg = await ChatMessage.create({ itemId, sender: senderId, content });
      await msg.populate('sender', 'name profilePic');
      io.to(`item:${itemId}`).emit('receive_message', msg);
    });

    // Typing indicator
    socket.on('typing', ({ itemId, userId }) => {
      socket.to(`item:${itemId}`).emit('user_typing', { userId });
    });
  });
};
```

---

## Phase 9: QR Handover

### 9.1 QR Service

```typescript
// src/services/qr.service.ts
import QRCode from 'qrcode';
import { uploadImage } from './cloudinary.service';

export const generateQR = async (data: string): Promise<string> => {
  const buffer = await QRCode.toBuffer(data, { type: 'png', width: 400 });
  const url = await uploadImage(buffer, 'qr-codes');
  return url;
};
```

### 9.2 Handover Scan Controller

```typescript
export const scanQR = async (req: any, res: any) => {
  const { qrToken } = req.body;
  const { itemId } = req.params;

  const claim = await Claim.findOne({ qrToken, status: 'approved' }).populate('claimant finder');
  if (!claim) return res.status(400).json({ success: false, error: 'Invalid or expired QR code' });

  // Mark item as returned
  await FoundItem.findByIdAndUpdate(itemId, { status: 'claimed' });
  await LostItem.findByIdAndUpdate(claim.lostItemId, { status: 'resolved' });

  // Award XP
  await reputationService.addXP(claim.claimant._id, 50);
  // Award finder if different from claimant
  if (claim.finder) await reputationService.addXP(claim.finder._id, 100);

  return res.json({ success: true, message: 'Item successfully returned!', claim });
};
```

---

## Phase 10: Admin Endpoints

### 10.1 Admin Dashboard

```typescript
export const getDashboard = async (req: any, res: any) => {
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const [totalLost, totalFound, pendingClaims, resolvedToday, totalUsers] = await Promise.all([
    LostItem.countDocuments(),
    FoundItem.countDocuments(),
    Claim.countDocuments({ status: 'pending' }),
    Claim.countDocuments({ status: 'approved', updatedAt: { $gte: todayStart } }),
    User.countDocuments(),
  ]);
  res.json({ success: true, totalLost, totalFound, pendingClaims, resolvedToday, totalUsers });
};
```

---

## Phase 11: Reputation & XP System

### 11.1 Reputation Service

```typescript
// src/services/reputation.service.ts
const XP_THRESHOLDS = [0, 100, 300, 500, 800, 1200, 2000, 3000, 5000, 8000, 10000];
const LEVEL_BADGES = ['Newcomer', 'Helper', 'Active Helper', 'Honest Finder', 'Trusted Helper',
  'Trusted Finder', 'Campus Star', 'Campus Hero', 'Gold Contributor', 'Legend'];

const calculateLevel = (xp: number): number => {
  let level = 1;
  for (let i = 0; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]) level = i + 1;
  }
  return level;
};

export const addXP = async (userId: string, xpToAdd: number) => {
  const user = await User.findById(userId);
  if (!user) return;
  const oldLevel = user.level;
  user.xp += xpToAdd;
  user.level = calculateLevel(user.xp);
  const badge = LEVEL_BADGES[user.level - 1];
  if (!user.badges.includes(badge)) user.badges.push(badge);
  await user.save();

  if (user.level > oldLevel) {
    await notificationService.create(userId, 'system', 'Level Up!', `You reached Level ${user.level}: ${badge}!`);
  }
};
```

---

## Phase 12: Email Service

```typescript
// src/services/email.service.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: `"Campus Lost & Found" <${process.env.EMAIL_USER}>`,
    to, subject, html,
  });
};

export const sendClaimApprovedEmail = async (userEmail: string, qrCodeUrl: string) => {
  await sendEmail(userEmail, 'Your Claim Has Been Approved!', `
    <h2>Great news! Your claim has been approved.</h2>
    <p>Please present the QR code below at the Lost & Found office to collect your item.</p>
    <img src="${qrCodeUrl}" alt="QR Code" style="width:200px" />
  `);
};
```

---

## Phase 13: Security & Validation

### 13.1 Zod Validation Middleware

```typescript
// src/middleware/validate.middleware.ts
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => (req: any, res: any, next: any) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.errors[0].message });
  }
  req.body = result.data;
  next();
};
```

### 13.2 Global Error Handler

```typescript
// src/middleware/errorHandler.ts
export const errorHandler = (err: any, req: any, res: any, next: any) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
};
```

---

## Phase 14: Deployment

### 14.1 Platform Summary

| Service       | Platform      | Free Tier                               |
|---------------|---------------|-----------------------------------------|
| Backend API   | Render.com    | 750 hrs/month, sleeps after inactivity  |
| Database      | MongoDB Atlas | M0 (512 MB)                             |
| Image Storage | Cloudinary    | 25 GB storage, 25 GB bandwidth          |
| Email         | Brevo SMTP    | 300 emails/day                          |
| Frontend      | Vercel        | Unlimited static deploys                |

### 14.2 Render Deployment Steps

1. Push backend to GitHub
2. Create new Web Service on Render → connect repo
3. Build command: `npm install && npm run build`
4. Start command: `node dist/server.js`
5. Add all environment variables in Render dashboard
6. Allow all IPs in MongoDB Atlas Network Access (0.0.0.0/0)

---

## Implementation Milestone Summary

| Phase | Feature                       | Est. Days |
|-------|-------------------------------|-----------|
| 1     | Project setup & structure     | 1         |
| 2     | Authentication                | 2         |
| 3     | Lost & Found CRUD + images    | 3         |
| 4     | Claim workflow + QR           | 3         |
| 5     | Notification system           | 2         |
| 6     | AI Matching Engine (MVP)      | 4         |
| 7     | Community Board (24h TTL)     | 2         |
| 8     | Real-time Chat (Socket.IO)    | 2         |
| 9     | QR Handover & Scan            | 1         |
| 10    | Admin Portal endpoints        | 2         |
| 11    | Reputation & XP System        | 1         |
| 12    | Email notifications           | 1         |
| 13    | Security & validation         | 1         |
| 14    | Deployment                    | 2         |
| **Total** |                           | **~27 days** |

---

## Quick Reference: API Route Summary

| Module         | Routes File                | Controller File                |
|----------------|----------------------------|--------------------------------|
| Auth           | auth.routes.ts             | auth.controller.ts             |
| Users          | user.routes.ts             | user.controller.ts             |
| Lost Items     | lostItem.routes.ts         | lostItem.controller.ts         |
| Found Items    | foundItem.routes.ts        | foundItem.controller.ts        |
| Claims         | claim.routes.ts            | claim.controller.ts            |
| Notifications  | notification.routes.ts     | notification.controller.ts     |
| Community      | community.routes.ts        | community.controller.ts        |
| AI Matching    | ai.routes.ts               | ai.controller.ts               |
| Handover       | handover.routes.ts         | handover.controller.ts         |
| Chat           | chat.routes.ts             | chat.controller.ts             |
| Admin          | admin.routes.ts            | admin.controller.ts            |
| Categories     | category.routes.ts         | (inline or category.controller)|
