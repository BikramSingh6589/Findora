import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
  name:            { type: String, required: true, trim: true },
  email:           { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:        { type: String, required: true, minlength: 8 },
  studentId:       { type: String, unique: true, sparse: true, trim: true },
  phone:           { type: String, default: '' },
  profilePic:      { type: String, default: '' },
  role:            { type: String, enum: ['user', 'admin'], default: 'user' },
  status:          { type: String, enum: ['active', 'warned', 'suspended', 'banned'], default: 'active' },
  xp:              { type: Number, default: 0 },
  level:           { type: Number, default: 1 },
  badges:          { type: [String], default: ['Newcomer'] },
  reputation:      { type: Number, default: 0 },
  itemsReturned:   { type: Number, default: 0 },
  itemsReported:   { type: Number, default: 0 },
  isVerified:      { type: Boolean, default: false },
  otp:             { type: String, default: null },
  otpExpiry:       { type: Date, default: null },
  resetToken:      { type: String, default: null },
  resetTokenExpiry:{ type: Date, default: null },
}, { timestamps: true });

// Hash password before save
(UserSchema as any).pre('save', function(this: any, next: any) {
  if (!this.isModified('password')) return next();
  bcrypt.hash(this.password, 12)
    .then((hash: string) => {
      this.password = hash;
      next();
    })
    .catch((err: Error) => {
      next(err);
    });
});

// Compare password helper method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', UserSchema);
