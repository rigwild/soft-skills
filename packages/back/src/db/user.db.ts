import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import boom from '@hapi/boom'

import { JWT_SECRET } from '../config'
import { log } from '../utils'
import { incrementStatistic } from './statistics.db'
import type { User, Upload, UploadDB, UserDB } from '../types'

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
      videoFile: { type: String, required: true },

      state: { type: String, enum: ['pending', 'finished', 'error'], default: 'pending', required: true },
      errorMessage: { type: String, required: true, default: null },

      uploadTimestamp: { type: Date, default: () => new Date() },
      lastStateEditTimestamp: { type: Date, default: () => new Date() },

      analysisId: { type: String, required: true, default: null }
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

/**
 * Find data of a registered user
 * @param userId The user id of the user
 * @returns The user's data
 * @throws Could not find the user
 */
export const findUser = async (userId: string) => {
  const user = await UserModel.findById(userId)
  if (!user) throw boom.notFound('User not found.')
  return user
}

/**
 * Find data of a registered user
 * @param email The email of the user
 * @returns The user's data
 * @throws Could not find the user
 */
export const findUserByEmail = async (email: string) => {
  const user = await UserModel.findOne({ email })
  if (!user) throw boom.notFound('User not found.')
  return user
}

/**
 * Register a new user.
 *
 * @param email The email of the new user (unique)
 * @param password The password of the new user (will be hashed), defaults to random
 * @param name The name of the new user
 * @returns The newly registered user data (without password)
 * @throws The email is already taken
 */
export const registerUser = async (email: string, password: string, name: string) => {
  try {
    const hash = await bcrypt.hash(password, 10)
    const doc = await UserModel.create({
      email,
      password: hash,
      name
    })
    await incrementStatistic('usersCount')

    log(`New user was created. email=${email}, name=${name}, id=${doc._id}`)
    return { email, name }
  } catch (err) {
    const msg = `Could not create the user. ${err.message}`
    err.message = msg
    log(msg)
    throw boom.isBoom(err) ? err : boom.internal(msg)
  }
}

/**
 * Generate a JWT
 * @param user Logged in user
 */
const generateToken = (user: UserDB) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  )
}

/**
 * Check a user login
 * @param email The email of the user
 * @param password The password of the user
 * @returns A login object response
 */
export const checkUserLogin = async (email: string, password: string) => {
  // Check email exists
  const user = await UserModel.findOne({ email }).select('+password')
  if (!user) throw boom.unauthorized('Invalid email or password.')

  // Check password is valid
  const isValidPassword = await bcrypt.compare(password, user.password)
  if (!isValidPassword) throw boom.unauthorized('Invalid email or password.')

  // Sign a JWT and return it
  const token = generateToken(user)

  log(`User logged in. email=${user.email}, id=${user._id}`)
  return {
    token,
    email: user.email,
    name: user.name
  }
}

/**
 * Delete a registered user
 * @param userId The user id of the user to delete
 * @returns Id of the deleted user
 * @throws Could not find the user to delete
 */
export const deleteUser = async (userId: string) => {
  const user = await UserModel.findByIdAndDelete(userId)
  if (!user) throw boom.notFound('User not found.')

  await incrementStatistic('usersCount', -1)

  log(`A user was deleted. id=${user._id}`)
  return { _id: user._id }
}

/**
 * Edit a registered user profile
 * @param userId The user id of the user to edit
 * @param newProfileData New user profile data
 * @returns New user profile
 * @throws Could not find the user to delete
 */
export const editUser = async (userId: string, _newProfileData: Partial<Pick<User, 'name'>>) => {
  const newProfileData = {} as Pick<User, 'name'>
  if (_newProfileData.name) newProfileData.name = _newProfileData.name

  if (Object.keys(newProfileData).length === 0) throw boom.badRequest('No profile data to edit.')

  const userDoc = await UserModel.findByIdAndUpdate(userId, newProfileData, { projection: { uploads: 0 }, new: true })
  if (!userDoc) throw boom.notFound('User not found.')

  log(`A user profile was edited. id=${userDoc._id}`)

  const userData = userDoc.toObject({ versionKey: false }) as UserDB
  return userData
}

/**
 * Load all the user uploads sorted by most recently uploaded is first
 * @param userId The user id of the user
 */
export const getUserUploads = async (userId: string) => {
  const profile = await findUser(userId)
  return profile.uploads.sort((a, b) => (a.uploadTimestamp < b.uploadTimestamp ? 1 : -1))
}

/**
 * Link a file to a user
 * @param userId The user id of the user
 * @param videoFile Uploaded file to link to a user
 */
export const addUploadToUser = async (userId: string, videoFile: string) => {
  // Add the upload to the user uploads list
  const userDoc = await UserModel.findOneAndUpdate(
    { _id: userId },
    {
      $push: {
        uploads: {
          videoFile
        } as UploadDB
      }
    },
    { new: true }
  )

  if (!userDoc) throw boom.internal('Unexpected error when adding file.')

  log(`Added a file. user=${userDoc.email}, id=${userDoc._id}, fileName=${videoFile}`)
  return (userDoc.toObject({ versionKey: false }) as UserDB).uploads.find(x => x.videoFile === videoFile) as UploadDB
}

/**
 * Edit a file upload state
 * @param userId The user id of the user to delete
 * @param uploadId The state of an upload
 * @param fileName Uploaded file to edit state from
 * @param newState New state of the upload
 * @param analysisId ID of analysis if state = finished
 * @param errorMessage Error message if state = error
 */
export const setOneUploadStateFromUser = async (
  userId: string,
  uploadId: string,
  fileName: Upload['videoFile'],
  newState: Upload['state'],
  analysisId?: string,
  errorMessage: string | null = null
) => {
  // Add the upload to the user uploads list
  const userDoc = await UserModel.findOneAndUpdate(
    { _id: userId, 'uploads._id': uploadId },
    {
      'uploads.$.state': newState,
      'uploads.$.analysisId': analysisId,
      'uploads.$.errorMessage': errorMessage,
      $currentDate: { 'uploads.$.lastStateEditTimestamp': true }
    },
    { new: true }
  )

  if (!userDoc) throw boom.internal('Unexpected error when setting analysis state.')

  log(`Edited an upload state. user=${userDoc.email}, id=${userDoc._id}, fileName=${fileName}, newState=${newState}`)
}
