import { Request, Response } from 'express'

import { UserController } from '../database'
import { User } from '../types'
import { runRequestValidator } from '../utils'

export class AuthController {
  public async login(req: Request<{}, any, Pick<User, 'username' | 'password'>>, res: Response) {
    runRequestValidator(req)

    const { username, password } = req.body
    res.json({ data: await UserController.login(username, password) })
  }

  public async register(req: Request<{}, any, Pick<User, 'username' | 'name' | 'password'>>, res: Response) {
    runRequestValidator(req)

    const { username, password, name } = req.body
    res.json({ data: await UserController.register(username, password, name) })
  }
}

export default new AuthController()
