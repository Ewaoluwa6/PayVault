// src/routes/userRoute.ts
import express, { Router } from 'express'
import Users from '../controller/userController'
import { authenticate } from '../middleware/auth'

const router: Router = express.Router()
const {create, login, changePassword, 
    transferVault, convertCurrency, withdrawVault, 
    updateProfile, createDetails, getDetails, 
    fundAccount, getUserTransactions} = new Users()


// User Authentication Routes
router.post("/auth/register", create)
router.post("/auth/login", login)
router.patch("/auth/change-password", authenticate, changePassword)
router.patch("/auth/profile", authenticate, updateProfile)

// Bank Account Management Routes
router.post("/wallet/create", authenticate, createDetails)
router.get("/wallet/details", authenticate, getDetails)

// Transaction Routes
router.post("/wallet/fund", authenticate, fundAccount)
router.post("/wallet/withdraw", authenticate, withdrawVault)
router.post("/wallet/transfer",authenticate, transferVault)
router.post("/wallet/convert", convertCurrency)
router.get("/wallet/transaction", authenticate, getUserTransactions)

export default router