import {Document, model, Schema} from 'mongoose'
export interface IAccount extends Document {
  userId: string;
  accountName: string;
  accountNumber: string;
  accountBalance: number;
}

//data validation
const BankDetailsSchema: Schema = new Schema({     //instance of the class schema
userId: { type: String, required: true }, 
accountName : { type: String, required: true },
accountNumber : { type: String, required: true },
accountBalance: { type: Number, required: true, unique: true },
});


export const BankDetails = model<IAccount> ('BankDetails',BankDetailsSchema)