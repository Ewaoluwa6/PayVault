/* src/controller/userController.ts
import { Request, Response } from 'express'
import dotenv from 'dotenv';
import bcrypt from "bcrypt"
import { User } from '../model/userModel';
import {BankDetails } from '../model/bankModel';
import { ETransactionType, Transaction } from '../model/transactionModel';
const crypto = require('crypto')
const jwt = require("jsonwebtoken")
//dotenv.config();



 export default class Users { 

updateProfile = async (req: Request, res: Response): Promise<any> => {
  const { phoneNumber, userId } = req.body;

  // Validate phone number (must be 11 digits)
  const phoneRegex = /^\d{11}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return res.status(400).json({ message: 'Phone number must be exactly 11 digits' });
  }

  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's phone number
    user.phoneNumber = phoneNumber;
    await user.save();

    return res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


public createDetails = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);

    // confirm the user exists in our database
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const accountExists = await BankDetails.findById(userId);

    if (accountExists) {
      return res.status(400).json({ message: `An account already exists for user with id ${userId}` });
    }

    // Generate unique 10-digit account number using userId
    const hash = crypto.createHash('sha256').update(userId).digest('hex');
    const numericHash = hash.replace(/\D/g, ''); // remove non-digit characters

    let accountNumber = numericHash.slice(0, 10);

    // Save new bank details
    const bankDetail = new BankDetails({
      userId,
      accountNumber,
      accountName: user.name,
      accountBalance: 0.0
    });

    await bankDetail.save();
    user.accountNumber = accountNumber
    await user.save();

    return res.status(200).json({
      message: "Bank details saved successfully.",
      bankDetails: bankDetail,
    });

  } catch (error) {
    console.error("Error creating bank details:", error);
    return res.status(500).json({ message: "Server error." });
  }
};


public getDetails = async (req: Request, res: Response): Promise<any> => {
  try {
    // Extract userId from request body
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);

    // confirm the user exists in our database
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch bank details by userId
    const bankDetails = await BankDetails.findOne({ userId });

    if (!bankDetails) {
      return res.status(404).json({ message: "No bank details found for this user." });
    }

    return res.status(200).json({
      message: "Bank details fetched successfully.",
      bankDetails,
    });

  } catch (error) {
    console.error("Error fetching bank details:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

public fundAccount = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId, amount } = req.body;

    // Validate user Id and amount
    if (!userId || !amount) {
      return res.status(400).json({ message: "userId and amount are required." });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number." });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if bank details exist
    const bankDetail = await BankDetails.findOne({ userId });
    if (!bankDetail) {
      return res.status(404).json({ message: "Bank account not found for user." });
    }

    // Update balance
    bankDetail.accountBalance = (bankDetail.accountBalance || 0) + Number(amount);
    await bankDetail.save();
    await Transaction.create({userId, amount, transactionType: ETransactionType.funding})

    return res.status(200).json({
      message: "Account funded successfully.",
      newBalance: bankDetail.accountBalance,
    });

  } catch (error) {
    console.error("Error funding account:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

    public create = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, email, password, phoneNumber } = req.body
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }
        // Check if user already exists
        const existingUser = await User.find({ email })
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists" })
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }   
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new User({ name, email, password: hashedPassword, phoneNumber })
        await user.save()
        // Generate a JWT token here
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET , { expiresIn: process.env.JWT_EXPIRATION})
        console.log(token)
        res.status(201).json({ message: "User created successfully", user, token })
    } catch (error) {
      console.log(error)
        res.status(500).json({ message: "Error creating user", error })
    }
}
    public login = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" })
        }
        // Check if user exists
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        // Check password
        if ((await bcrypt.compare(password, user.password)) === false) {
            return res.status(401).json({ message: "Invalid password" })
        }
        res.status(200).json({ message: "Login successful", user })
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error })
    }
}
     changePassword = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, oldPassword, newPassword } = req.body
        // Validate input
        if (!email || !oldPassword || !newPassword) {
            return res.status(400).json({ message: "All fields are required" })
        }
        // Check if user exists
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        // Check old password
        if ((await bcrypt.compare(oldPassword, user.password)) === false) {
            return res.status(401).json({ message: "Invalid old password" })
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ message: "New Password must be at least 8 characters" });
        }   
        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedNewPassword
        await user.save()
        res.status(200).json({ message: "Password changed successfully" })
    } catch (error) {
        res.status(500).json({ message: "Error changing password", error })
    }
}
}








  public createDetails = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);

    // confirm the user exists in our database
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const accountExists = await BankDetails.findById(userId);

    if (accountExists) {
      return res.status(400).json({ message: `An account already exists for user with id ${userId}` });
    }

    // Generate unique 10-digit account number using userId
    const hash = crypto.createHash('sha256').update(userId).digest('hex');
    const numericHash = hash.replace(/\D/g, ''); // remove non-digit characters

    let accountNumber = numericHash.slice(0, 10);

    // Save new bank details
    const bankDetail = new BankDetails({
      userId,
      accountNumber,
      accountName: user.name,
      accountBalance: 0.0
    });

    await bankDetail.save();
    user.accountNumber = accountNumber
    await user.save();

    return res.status(200).json({
      message: "Bank details saved successfully.",
      bankDetails: bankDetail,
    });

  } catch (error) {
    console.error("Error creating bank details:", error);
    return res.status(500).json({ message: "Server error." });
  }
};


public getDetails = async (req: Request, res: Response): Promise<any> => {
  try {
    // Extract userId from request body
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);

    // confirm the user exists in our database
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch bank details by userId
    const bankDetails = await BankDetails.findOne({ userId });

    if (!bankDetails) {
      return res.status(404).json({ message: "No bank details found for this user." });
    }

    return res.status(200).json({
      message: "Bank details fetched successfully.",
      bankDetails,
    });

  } catch (error) {
    console.error("Error fetching bank details:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

public fundAccount = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId, amount } = req.body;

    // Validate user Id and amount
    if (!userId || !amount) {
      return res.status(400).json({ message: "userId and amount are required." });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number." });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if bank details exist
    const bankDetail = await BankDetails.findOne({ userId });
    if (!bankDetail) {
      return res.status(404).json({ message: "Bank account not found for user." });
    }

    // Update balance
    bankDetail.accountBalance = (bankDetail.accountBalance || 0) + Number(amount);
    await bankDetail.save();
    await Transaction.create({userId, amount, transactionType: ETransactionType.funding})

    return res.status(200).json({
      message: "Account funded successfully.",
      newBalance: bankDetail.accountBalance,
    });

  } catch (error) {
    console.error("Error funding account:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

   withdrawVault = (req: Request, res: Response): any => {
    try{
        const {amount} = req.body
        if (isNaN(amount))
        res.status(400).json({ 
          error: 'Bad request',
          message: "You have to enter a valid number" 
        })

      else if (amount < 1000 || amount <= 0){
            res.status(400).json({ 
              error: 'Bad request',
              message: "Withdrawal unsuccessful" 

            })
            }

    accountBalance -= amount;
      return res.json({
      status: 200,  
      message: `Withdraw ${amount} successful`,
      accountBalance: accountBalance
    })

    }
    catch(error){
    res.status(500).json({ 
        error: 'Internal server error',
        message: error 
      })}}
    
  convertCurrency = (req: Request, res: Response): any => { 
    try{
{  const validCurrencies = ["NGN", "USD", "GBP"]
  const { fromCurrency, toCurrency, amount } = req.body

  const rates: { [key: string]: number } = {
    NGN: Number(process.env.CURR_NGN!),
    USD: Number(process.env.CURR_USD!),
    GBP: Number(process.env.CURR_GBP!)
  }

  if (!fromCurrency || !toCurrency || !amount){
    return res.status(400).json({
          status: 400,
          message: "All fields are expected"})
  }



  if (!validCurrencies.includes(fromCurrency) || !validCurrencies.includes(toCurrency)) {
    return res.json({
      status: 400,
      message: "You have to enter a valid currency",
    })
  }

  if (isNaN(amount)) {
    return res.json({
      status: 400,
      message: "You have to enter a valid number"
    })
  }

  if (amount < 1000 || amount <= 0) {
    return res.json({
      status: 400,
      message: "The minimum withdrawal is 1000 Naira"
    })
  }

  //Calculate conversion rate using the rates object
  const fromRate = rates[fromCurrency]
  const toRate = rates[toCurrency]
  const rate = toRate / fromRate  
  const converted = amount * rate

  return res.json({
    status: 200,
    message: `Conversion successful: ${amount} ${fromCurrency} = ${converted.toFixed(2)} ${toCurrency}`,
    data: {
      from: fromCurrency,
      to: toCurrency,
      originalAmount: amount,
      convertedAmount: Number(converted.toFixed(2)),
      exchangeRate: Number(rate.toFixed(6)),
    }
     })
    }}

    catch (error) {
      console.error('Error creating account:', error);
      return res.status(500).json({
        status: 500,
        message: "Internal server error. Please try again later."
      })
    
 
  }}


   transferVault = async (req: Request, res: Response): Promise<any> => {
    try {
      const { toaccountNumber, amount } = req.body

      if (!toaccountNumber || !amount ) {
        return res.status(400).json({
          status: 400,
          message: "All fields are required"
        })
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
    
      // minimum and maximum transfer limits
      const MIN_TRANSFER = 100 
      const MAX_TRANSFER = 1000000 
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

      // Find recipient by account number 
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
      if (toaccountNumber == AccountNo) {
        return res.status(400).json({
          status: 400,
          message: "Cannot transfer to your own account"
        })}
      
    accountBalance -= amount
      return res.json({
      status: 200,  
      message: `Transfer of ${amount} successful to ${toaccountNumber}`,
      accountBalance: accountBalance
      })
    
  }
   catch (error) {
      console.error('Error creating account:', error);
      return res.status(500).json({
        status: 500,
        message: "Internal server error. Please try again later."
      })
}
   }
   
  }
*/