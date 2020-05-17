import mongoose, { Schema } from 'mongoose'

import { User } from '../../types'

export type UserDocument = User & mongoose.Document

export const UserModel = mongoose.model<UserDocument>(
  'User',
  new Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, select: false, required: true },
    name: { type: String, required: true },

    joinDate: {
      type: Date,
      default: () => new Date()
    }
  }).post('save', (error: any, doc: mongoose.Document, next: Function) => {
    if (error.name === 'MongoError' && error.code === 11000) {
      next(new Error('User already exists.'))
    } else {
      next(error)
    }
  })
)
