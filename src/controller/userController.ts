// src/controller/userController.ts
import { Request, Response } from 'express'
import { User } from '../model/userModel'
import { BankDetails } from '../model/bankModel'
import crypto from 'crypto';
import { ETransactionType, Transaction } from '../model/transactionModel';

 
export default class Users {
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

}


