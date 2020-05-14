import { Request, Response } from 'express'

export class PingController {
  public ping(req: Request, res: Response): void {
    res.json({
      message: 'Hello'
    })
  }
}
