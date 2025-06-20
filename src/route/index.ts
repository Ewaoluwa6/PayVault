import express from 'express'
import user from './user-Route'

const routes = express.Router()

routes.use('/users', user)

export default routes