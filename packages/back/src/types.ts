import { RequestHandler } from 'express-serve-static-core'

export interface User {
  _id: string
  email: string
  password: string
  name: string
  joinDate: Date
}

// `express.Request` with user data
export type RequestAuthed = Parameters<RequestHandler>[0] & {
  session: Pick<User, '_id' | 'email' | 'name'>
  userDoc: Omit<User, 'password'>
}
// `express.RequestHandler` with user data
export type RequestHandlerAuthed = (
  req: RequestAuthed,
  res: Parameters<RequestHandler>[1],
  next: Parameters<RequestHandler>[2]
) => ReturnType<RequestHandler>
