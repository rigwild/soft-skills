import * as express from 'express'
import { PingController } from './controller/ping.controller'

export class Router {
  public pingController: PingController = new PingController()

  public routes(app: express.Application): void {
    app.route('/').get(this.pingController.ping)
  }
}
