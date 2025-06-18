import { Document, model, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  UserId: string;
  email: string;
  phoneNumber: string;
  password: string; // hashed
  accountNumber: string | null;
  balance: number;
}

// Schema defines the requirements before any new record is created. It supports data validation.
const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { 
    type: String, 
    required: true, 
    validate: {
      validator: function(v: string) {
        return /^\d{11}$/.test(v); // Validates exactly 11 digits
      },
      message: `This number is not a valid 11-digit phone number`
    }
  },
  password: { type: String, required: true },
  accountNumber: { type: String,  unique: true },
  balance: { type: Number, required: true, default: 0 }
}, { timestamps: true });

// Export the User model
export const User = model<IUser>('User', UserSchema);
