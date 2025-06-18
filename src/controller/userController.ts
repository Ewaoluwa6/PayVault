// src/controller/userController.ts
import { Request, Response } from 'express'
import dotenv from 'dotenv';
import bcrypt from "bcrypt"
import { User } from '../model/userModel';
dotenv.config();


 export default class Users { 

   withdrawVault = (req: Request, res: Response): any => {
    const {amount} = req.body
     if (isNaN(amount))
      res.json({
        status : 400,
        message : "You have to enter a valid number"
      })

    else if (amount < 1000 || amount <= 0){
            res.json({
                status : 400,
                message : " The minimum withdrawal is 1000 Naira"
            })
        }
          return res.json({
            status: 200,
            message : `Withdraw ${amount} successful`
        })
      }
  
  convertCurrency = (req: Request, res: Response): any => {
    const validCurrencies = ["NGN", "USD", "GBP"]
    const { fromCurrency, toCurrency, amount } = req.body 
    const rate = toCurrency / fromCurrency
    const converted = amount * rate

    if (!validCurrencies.includes(fromCurrency) || !validCurrencies.includes(toCurrency)) {
       return res.json({
      status: 400,
      message: "You have to enter a valid currency",
    })
  }
    if (isNaN(amount))
            res.json({
                status : 400,
                message : "You have to enter a valid number"
      })
    else if (amount < 1000 || amount <= 0){
            res.json({
                status : 400,
                message : " The minimum withdrawal is 1000 Naira" })

  
 const rates: { [key: string]: number } = {
  NGN: parseFloat(process.env.CURR_NGN!), //! here is telling ts, i promise you my env file won't go missing, trust me
  USD: parseFloat(process.env.CURR_USD!),
  GBP: parseFloat(process.env.CURR_GBP!),
}
  return res.json({
    status: 200,
    message: `Conversion successful: ${amount} ${fromCurrency} = ${converted.toFixed(2)} ${toCurrency}`,
    data: {
      from: fromCurrency,
      to: toCurrency,
      originalAmount: amount,
      convertedAmount: parseFloat(converted.toFixed(2)),
      exchangeRate: rate.toFixed(6),
    }
  })
}}


//Endpoint 2222

   transferVault = async (req: Request, res: Response): Promise<any> => {
    try {
      const { toaccountNumber, amount, fromAccountNo } = req.body;

      if (!toaccountNumber || !amount || !fromAccountNo) {
        return res.status(400).json({
          status: 400,
          message: "All fields are required"
        });
      }


      if (typeof toaccountNumber !== 'string' || toaccountNumber.trim().length === 0 || null ) {
        return res.status(400).json({
          status: 400,
          message: "Invalid recipient account ID format"
        });
      }

      
      if (typeof amount !== 'number' || isNaN(amount)) {
        return res.status(400).json({
          status: 400,
          message: "Amount must be a valid number"
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          status: 400,
          message: "Amount must be greater than zero"
        });
      }
    
      // 4. Set minimum and maximum transfer limits
      const MIN_TRANSFER = 100 
      const MAX_TRANSFER = 1000000 
      const accountBalance = 50  //to delete it and avoid interference with Ewa
      if (amount < MIN_TRANSFER || amount >= accountBalance) {
        return res.status(400).json({
          status: 400,
          message: `Enter a valid amount`
        });
      }

      if (amount > MAX_TRANSFER ) {
        return res.status(400).json({
          status: 400,
          message: `Maximum transfer amount is ${MAX_TRANSFER.toLocaleString()} Naira`
        });
      }

      // 7. Find recipient by account number or user ID
      const recipient = await User.findOne({
        $or: [
          { accountNumber: toaccountNumber }
        ]
      })
      if (!recipient) {
        return res.status(404).json({
          status: 404,
          message: "Recipient account not found"
        });
      }
      if (toaccountNumber == fromAccountNo) {
        return res.status(400).json({
          status: 400,
          message: "Cannot transfer to your own account"
        });
     

      const session = await User.startSession()
      session.startTransaction()
    }
  }
   catch (error) {
      console.error('Error creating account:', error);
      return res.status(500).json({
        status: 500,
        message: "Internal server error. Please try again later."
      })
}
   }}