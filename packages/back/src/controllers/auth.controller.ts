import { Request, Response } from 'express'

import { UserController } from '../database'
import { runRequestValidator } from '../utils'
import type { User } from '../types'

export class AuthController {
  public async login(req: Request<{}, any, Pick<User, 'email' | 'password'>>, res: Response) {
    runRequestValidator(req)

    const { email, password } = req.body
    res.json({ data: await UserController.login(email, password) })
  }

  public async register(req: Request<{}, any, Pick<User, 'email' | 'name' | 'password'>>, res: Response) {
    runRequestValidator(req)

    const { email, password, name } = req.body
    res.json({ data: await UserController.register(email, password, name) })
  }
}

export default new AuthController()
