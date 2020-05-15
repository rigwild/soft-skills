import { Request, Response } from 'express'

import { UserController } from '../database'

export class AuthController {
  public async login(req: Request, res: Response) {
    const { username, password } = req.body
    if (!username || !password) {
      res.status(400).json({ error: 'All fields are required.' })
      return
    }

    try {
      const userObj = await UserController.login(username, password)
      res.json({ data: userObj })
    } catch (error) {
      res.status(401).json({ error })
    }
  }

  public async register(req: Request, res: Response) {
    const { username, password, name } = req.body
    if (!username || !password || !name) {
      res.status(400).json({ error: 'All fields are required.' })
      return
    }

    try {
      const userObj = await UserController.register(username, password, name)
      res.json({ data: userObj })
    } catch (error) {
      res.status(401).json({ error })
    }
  }
}

export default new AuthController()
