// src/controller/userController.ts
import { Request, Response } from 'express'
import { User } from '../model/userModel'
import { BankDetails } from '../model/bankModel'
import crypto from 'crypto';
import { ETransactionType, Transaction } from '../model/transactionModel';

 

import bcrypt from "bcrypt"
const jwt = require("jwt")

export default class Auth {
    public withdrawVault = (req: Request, res: Response): any => {
    const { amount } = req.body
    return res.status(200).json({ message: `Withdraw ${amount} successful` })
  }

  public convertCurrency = (req: Request, res: Response): any => {
    const { fromCurrency, toCurrency, amount } = req.body
    return res.status(200).json({ message: `Converted ${amount} from ${fromCurrency} to ${toCurrency}` })
  }

  public transferVault = (req: Request, res: Response): any => {
    const { toUserId, amount } = req.body
    return res.status(200).json({ message: `Transferred ${amount} to user ${toUserId}` })
  }


 public updateProfile = async (req: Request, res: Response): Promise<any> => {
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
        const { username, email, password } = req.body
        // Validate input
        if (!username || !email || !password) {
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
        const user = new User({ username, email, password: hashedPassword })
        await user.save()
        // Generate a JWT token here
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET , { expiresIn: process.env.JWT_EXPIRATION})
        res.status(201).json({ message: "User created successfully", user, token })
    } catch (error) {
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
    public changePassword = async (req: Request, res: Response): Promise<any> => {
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
