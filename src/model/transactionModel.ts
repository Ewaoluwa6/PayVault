import { Document, model, Schema } from 'mongoose';
import { ref } from 'process';
import { User } from './userModel';

export interface ITransaction extends Document {
  amount: number,
  transactionType: string
  userId: any
}

export enum ETransactionType {
    funding = 'funding',
    withdrawal = 'withdrawal'
}
// Schema defines the requirements before any new record is created. It supports data validation.
const TransactionSchema: Schema = new Schema({
 amount: {type: Number},
 transactionType: {type: String, enum: ETransactionType},
 userId: {type: Schema.Types.ObjectId, ref: "User"}
 
}, { timestamps: true });

// Export the User model
export const Transaction = model<ITransaction>('Transaction', TransactionSchema);
