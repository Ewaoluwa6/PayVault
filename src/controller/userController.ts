// src/controller/userController.ts
import { Request, Response } from 'express'
import { User } from '../model/userModel'
 
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







}
