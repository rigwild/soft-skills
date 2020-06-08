import { Router } from 'express'

import analysis from './analysis.routes'
import auth from './auth.routes'
import profile from './profile.routes'

const router = Router()

router.use(analysis)
router.use(auth)
router.use(profile)

export default router
