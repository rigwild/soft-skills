import { Response } from 'express'

import { getStatistics } from '../db'
import type { RequestAuthed } from '../types'

export const getStatisticsRequestHandler = async (req: RequestAuthed, res: Response) => {
  res.json({ data: await getStatistics() })
}
