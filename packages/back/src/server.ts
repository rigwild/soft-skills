import express from "express";
import {Router} from './router'
import bodyParser from "body-parser";

class Server {

    public app: express.Application
    public router: Router = new Router()

    constructor () {
        this.app = express();
        this.config();
        this.router.routes(this.app)
    }

    private config (): void {
        this.app.use(bodyParser.urlencoded({extended: false}))
        this.app.use(bodyParser.json())
    }
    
}

export default new Server().app;
