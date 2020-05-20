import mongoose, { Schema } from 'mongoose'
import boom from '@hapi/boom'

import { User } from '../../types'

export type UserDocument = User & mongoose.Document

export const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, select: false, required: true },
  name: { type: String, required: true },

  joinDate: {
    type: Date,
    default: () => new Date()
  },
  uploads: [{
    mimeType: { type: String, required: true },
    fileName: { type: String, required: true },
    size: { type: Number, required: true }
  }]
})

// Register DB hooks
UserSchema.post('save', (error: any, doc: mongoose.Document, next: Function) => {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(boom.conflict('Email already registered.'))
  } else {
    next(error)
  }
})

export const UserModel = mongoose.model<UserDocument>('User', UserSchema)
