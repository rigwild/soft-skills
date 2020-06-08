import { Request, Response } from 'express'

import { checkUserLogin, registerUser } from '../db'
import { runRequestValidator } from '../utils'
import type { User } from '../types'

export const loginRequestHandler = async (req: Request<{}, any, Pick<User, 'email' | 'password'>>, res: Response) => {
  runRequestValidator(req)

  const { email, password } = req.body
  res.json({ data: await checkUserLogin(email, password) })
}

export const registerRequestHandler = async (
  req: Request<{}, any, Pick<User, 'email' | 'name' | 'password'>>,
  res: Response
) => {
  runRequestValidator(req)

  const { email, password, name } = req.body
  res.json({ data: await registerUser(email, password, name) })
}
