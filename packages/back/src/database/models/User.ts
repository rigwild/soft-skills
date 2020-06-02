import mongoose, { Schema } from 'mongoose'
import boom from '@hapi/boom'

import type { User } from '../../types'

export type UserDocument = User & mongoose.Document

export const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, select: false, required: true },
  name: { type: String, required: true },

  joinDate: {
    type: Date,
    default: () => new Date()
  },
  uploads: [
    {
      mimeType: { type: String, required: true },
      name: { type: String, required: true },
      state: { type: String, enum: ['pending', 'finished', 'error'], default: 'pending', required: true },
      size: { type: Number, required: true },
      analyzisId: { type: String, required: true, default: null }
    }
  ]
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
