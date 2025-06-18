import { Document, model, Schema } from 'mongoose';

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
 amount: {type: Number, require: true},
 transactionType: {type: String, enum: ETransactionType, require: true},
 userId: {type: Schema.Types.ObjectId, require: true}
 
}, { timestamps: true });

// Export the User model
export const Transaction = model<ITransaction>('Transaction', TransactionSchema);
