import { Request, Response } from "express";


export class PingController {

    public ping (req: Request, res: Response) {
        res.json({
            message: 'Hello'
        })
    }

}