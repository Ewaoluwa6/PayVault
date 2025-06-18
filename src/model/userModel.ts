import { Document, model, Schema } from "mongoose";

export interface IUser extends Document {
      name: string;
      id: string;
      email: string;
      phoneNumber: string;
      password: string;
      accountNumber: string
      balance: number

}

//Schema defines the requirements before any new record is created. It supports data validation.
const userSchema = new Schema<IUser>({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true },
    phoneNumber: {
       type: String,
       required: true,
       validate: {
         validator: function(v: string) {
            return /^\d{11}$/.test(v); // validate exactly 11 digits
         },
        message: `This number is not a valid 11-digit phone number`
       }

    },
    password: {types: String, required: true},
    accountNumber: {types: String, required: true, unique: true},
    balance: {types: Number, reuired: true, default: 0 }

}, { timestamps: true});

//Export the user model 
export const User = model<IUser>('User', userSchema);