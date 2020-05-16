import { Router } from 'express'
import { body } from 'express-validator'

import { asyncMiddleware, authenticatedMiddleware, injectUserDocMiddleware } from './middlewares'
import pingController from './controllers/ping.controller'
import authController from './controllers/auth.controller'

const router = Router()

router.get('/', asyncMiddleware(pingController.ping))

router.post(
  '/login',
  body(['username', 'password'], 'is missing.').exists({ checkFalsy: true }),
  asyncMiddleware(authController.login)
)
router.post(
  '/register',
  body(['username', 'name'], 'is missing.').exists({ checkFalsy: true }),
  body('password', 'must be of 4 characters length minimum.').exists({ checkFalsy: true }).isLength({ min: 4 }),
  asyncMiddleware(authController.register)
)

// Just some examples
router.get(
  '/authed',
  authenticatedMiddleware(),
  asyncMiddleware((req, res) => res.json({ session: req.session }))
)
router.get(
  '/authed/user',
  authenticatedMiddleware(),
  injectUserDocMiddleware(),
  asyncMiddleware((req, res) => res.json({ session: req.session, userDoc: req.userDoc }))
)

export default router
