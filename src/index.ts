import express, { Request, Response, Express } from "express"
import routes from "./route/index";
import dotenv from 'dotenv'
import connectDB from './config/db';

dotenv.config()                                          
const app: Express = express()
connectDB()

app.use(express.json());      
app.get('/', (req: Request, res: Response) => {
    res.send("Hello, Backend world!") })
app.use(routes)

app.listen(process.env.PORT, () => {
    console.log(`server running on http://localhost:${process.env.PORT}`)
})