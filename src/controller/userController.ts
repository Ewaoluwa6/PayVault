// src/controller/userController.ts
import { Request, Response } from 'express'

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
}
