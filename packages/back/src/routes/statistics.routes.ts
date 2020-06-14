import { Router } from 'express'

import { asyncMiddleware, authenticatedMiddleware, injectUserDocMiddleware } from '../middlewares'
import { getStatisticsRequestHandler } from '../controllers/statistics.controller'

const router = Router()

/**
 * @api {get} /statistics Get global platform statistics
 * @apiVersion 0.1.0
 * @apiName GetStatistics
 * @apiGroup Statistics
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *     "analysesTotalCount": 124,
 *     "analysesSuccessCount": 112,
 *     "usersCount": 35
 *   }
 * }
 */
router.get(
  '/statistics',
  authenticatedMiddleware(),
  injectUserDocMiddleware(),
  asyncMiddleware(getStatisticsRequestHandler)
)

export default router
