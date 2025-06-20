// src/routes/userRoute.ts
import express, { Router } from 'express'
import Users from '../controller/userController'
import { authenticate } from '../middleware/auth'

const router: Router = express.Router()
const {create, login, changePassword, 
    transferVault, convertCurrency, withdrawVault, 
    updateProfile, createDetails, getDetails, 
    fundAccount} = new Users()


// User Authentication Routes
router.post("/auth/register", create) //name, email, password, phoneNumber
router.post("/auth/login", login) //email, password
router.patch("/auth/change-password", authenticate, changePassword) //email, oldPassword, newPassword
router.patch("/auth/profile", authenticate, updateProfile) // phoneNumber || email || name 

// Bank Account Management Routes
router.post("/wallet/create", authenticate, createDetails)// none just the auth 
router.get("/wallet/details", authenticate, getDetails)//userId

// Transaction Routes
router.post("/wallet/fund", authenticate, fundAccount) //userId, amount
router.post("/wallet/withdraw", authenticate, withdrawVault) //userId, amount
router.post("/wallet/transfer",authenticate, transferVault) //toAccountNumber, amount
router.post("/wallet/convert", convertCurrency) //fromCurrency, toCurrency, amount    USD, NGN, amount

export default router