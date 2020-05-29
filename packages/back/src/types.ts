import type { RequestHandler, Params, ParamsDictionary } from 'express-serve-static-core'
import type { ParsedQs } from 'qs'

export interface User {
  _id: string
  email: string
  password: string
  name: string
  joinDate: Date
}

// `express.Request` with user data
export type RequestAuthed<
  P extends Params = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs
> = Parameters<RequestHandler<P, ResBody, ReqBody, ReqQuery>>[0] & {
  session: Pick<User, '_id' | 'email' | 'name'>
  userDoc: Omit<User, 'password'>
}
// `express.RequestHandler` with user data
export type RequestHandlerAuthed = (
  req: RequestAuthed,
  res: Parameters<RequestHandler>[1],
  next: Parameters<RequestHandler>[2]
) => ReturnType<RequestHandler>
