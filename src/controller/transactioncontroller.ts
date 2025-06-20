//  import { Request, Response } from 'express'
// import { Transaction } from '../model/transactionModel'

// export const getUserTransactions = async (req: Request, res: Response): Promise<void> => {
//   const { userId } = req.params

//   try {
//     const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 })

//     res.status(200).json({
//       message: 'User transactions fetched successfully',
//       data: transactions
//     })
//   } catch (error) {
//     res.status(500).json({
//       message: 'Failed to fetch transactions',
//       error: error instanceof Error ? error.message : 'Unknown error'
//     })
//     }}