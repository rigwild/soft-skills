import { Response } from 'express'

// import { UserController } from '../database'
import type { RequestAuthed } from '../types'

export class ProfileController {
  public async profile(req: RequestAuthed, res: Response) {
    const data = req.userDoc
    // FIXME: Remove ts-ignore when #8 is merged
    // @ts-ignore
    delete data.uploads
    res.json({ data })
  }
}

export default new ProfileController()
