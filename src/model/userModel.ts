import mongoose, {Schema, Document, model } from "mongoose"
//document is imported from mongoose
export interface IUser extends Document{
    name: string;
    userName: string;
    userid: string; // Unique identifier for the user
    email: string;
    phone: string;
    password: string; // Hashed password 
    accountNumber: string; 
    balance: number;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  userName: { type: String, required: true },
  userid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  accountNumber: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
}, {
  timestamps: true, 
  createdAt: Date, 
  updatedAt: Date
});

export const User = model<IUser>('User', UserSchema);
