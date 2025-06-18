import {Document, model, Schema} from 'mongoose'
export interface IAccount extends Document {
  accountName: string;
  accountNumber: string;
  accountBalance: number;

 
}

//data validation
const UserSchema: Schema = new Schema({     //instance of the class schema
accountName : { type: String, required: true },
accountNumber : { type: String, required: true },
accountBalance: { type: Number, required: true, unique: true },
});


export const User = model<IAccount> ('User',UserSchema)