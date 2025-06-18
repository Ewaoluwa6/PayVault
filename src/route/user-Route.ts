// src/routes/userRoute.ts
import express, { Router } from 'express'
import Users from '../controller/userController'

const router: Router = express.Router()
const userController = new Users()

const {transferVault, convertCurrency, withdrawVault, getDetails, updateProfile,createDetails,fundAccount} = new Users()
router.post("/wallet/withdraw", withdrawVault)
router.post("/wallet/convert", convertCurrency)
router.post("/wallet/transfer", transferVault)
router.patch("/auth", updateProfile)
router.post("/wallet", createDetails)
router.get("/wallet", getDetails)
router.post("/wallet", fundAccount)
router.patch("/auth", updateProfile)
router.post("/wallet", createDetails)
router.post("/wallet", fundAccount)

export default router
