// src/controller/userController.ts
import { Request, Response } from 'express'
import { User } from '../model/userModel'
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