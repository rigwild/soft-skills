import { Router } from 'express'

import analysis from './analysis.routes'
import auth from './auth.routes'
import profile from './profile.routes'
import statistics from './statistics.routes'

const router = Router()

router.use(analysis)
router.use(auth)
router.use(profile)
router.use(statistics)

export default router
