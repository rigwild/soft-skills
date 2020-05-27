import { Response } from 'express'

import { UserController } from '../database'
import type { RequestAuthed, User } from '../types'

export class ProfileController {
  public async getProfile(req: RequestAuthed, res: Response) {
    const data = req.userDoc
    // FIXME: Remove ts-ignore when #8 is merged
    // @ts-ignore
    delete data.uploads
    res.json({ data })
  }

  public async editProfile(req: RequestAuthed<{}, any, Pick<User, 'name'>>, res: Response) {
    const newProfile = await UserController.edit(req.session._id, req.body)
    res.json({ data: newProfile })
  }

  public async deleteAccount(req: RequestAuthed, res: Response) {
    const { _id } = await UserController.delete(req.session._id)
    res.json({ data: { _id } })
  }
}

export default new ProfileController()
