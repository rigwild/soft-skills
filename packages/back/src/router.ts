import { Router } from 'express'

import pingController from './controllers/ping.controller'
import authController from './controllers/auth.controller'

const router = Router()

router.get('/', pingController.ping)
router.post('/login', authController.login)
router.post('/register', authController.register)

export default router
