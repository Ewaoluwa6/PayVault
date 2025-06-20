import { Document, model, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phoneNumber?: string; // Made optional
  password: string; // hashed
  accountNumber?: string | undefined;
  balance: number;
  createdAt: Date;
  updatedAt: Date; 
}

// Schema defines the requirements before any new record is created
const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { 
    type: String, 
    required: false, // Made optional
    validate: {
      validator: function(v: string) {
        return !v || /^\d{11}$/.test(v); // Only validate if provided
      },
      message: `This number is not a valid 11-digit phone number`
    }
  },
  password: { type: String, required: true },
  accountNumber: { type: String, unique: true}, 
  balance: { type: Number, default: 0 }
}, { timestamps: true });

// Export the User model
export const User = model<IUser>('User', UserSchema);