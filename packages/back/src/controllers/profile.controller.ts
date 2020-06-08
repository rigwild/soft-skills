import { Response } from 'express'

import { editUser, deleteUser } from '../db'
import type { RequestAuthed, User } from '../types'

export const getProfileRequestHandler = async (req: RequestAuthed, res: Response) => {
  const data = req.userDoc
  delete data.uploads
  res.json({ data })
}

export const editProfileRequestHandler = async (req: RequestAuthed<{}, any, Pick<User, 'name'>>, res: Response) => {
  const newProfile = await editUser(req.session._id, req.body)
  res.json({ data: newProfile })
}

export const deleteAccountRequestHandler = async (req: RequestAuthed, res: Response) => {
  const { _id } = await deleteUser(req.session._id)
  res.json({ data: { _id } })
}
