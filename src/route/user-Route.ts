// src/routes/userRoute.ts
import express, { Router } from 'express'
import Users from '../controller/userController'

const router: Router = express.Router()
const userController = new Users()

const {transferVault, convertCurrency, withdrawVault} = new Users()

router.post("/wallet/withdraw", withdrawVault)
router.post("/wallet/convert", convertCurrency)
router.post("/wallet/transfer", transferVault)

export default router
