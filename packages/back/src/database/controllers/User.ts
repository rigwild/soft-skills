import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import boom from '@hapi/boom'

import { UserModel, UserDocument } from '../models/User'
import { JWT_SECRET } from '../../config'
import type { User, Upload, UploadDB } from '../../types'

export const UserController = {
  get Model() {
    return UserModel
  },

  log(data: string | object) {
    if (process.env.NODE_ENV !== 'test') console.log(data)
  },

  /**
   * Register a new user.
   *
   * @param email The email of the new user (unique)
   * @param password The password of the new user (will be hashed), defaults to random
   * @param name The name of the new user
   * @returns The newly registered user data (without password)
   * @throws The email is already taken
   */
  async register(email: string, password: string, name: string) {
    try {
      const hash = await bcrypt.hash(password, 10)
      const doc = await UserModel.create({
        email,
        password: hash,
        name
      })

      this.log(`New user was created. email=${email}, name=${name}, id=${doc._id}`)
      return { email, name }
    } catch (err) {
      const msg = `Could not create the user. ${err.message}`
      err.message = msg
      this.log(msg)
      throw boom.isBoom(err) ? err : boom.internal(msg)
    }
  },

  /**
   * Generate a JWT
   * @param user Logged in user
   */
  generateToken(user: UserDocument) {
    return jwt.sign(
      {
        _id: user._id,
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    )
  },

  /**
   * Check a user login
   * @param email The email of the user
   * @param password The password of the user
   * @returns A login object response
   */
  async login(email: string, password: string) {
    // Check email exists
    const user = await UserModel.findOne({ email }).select('+password')
    if (!user) throw boom.unauthorized('Invalid email or password.')

    // Check password is valid
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) throw boom.unauthorized('Invalid email or password.')

    // Sign a JWT and return it
    const token = this.generateToken(user)

    this.log(`User logged in. email=${user.email}, id=${user._id}`)
    return {
      token,
      email: user.email,
      name: user.name
    }
  },

  /**
   * Deleted a registered user
   * @param userId The user id of the user to delete
   * @returns Id of the deleted user
   * @throws Could not find the user to delete
   */
  async delete(userId: string) {
    const user = await UserModel.findByIdAndDelete(userId)
    if (!user) throw boom.notFound('User not found.')

    this.log(`A user was deleted. id=${user._id}`)
    return { _id: user._id }
  },

  /**
   * Edit a registered user's profile
   * @param userId The user id of the user to edit
   * @param newProfileData New user profile data
   * @returns New user profile
   * @throws Could not find the user to delete
   */
  async edit(userId: string, _newProfileData: Partial<Pick<User, 'name'>>) {
    const newProfileData = {} as Pick<User, 'name'>
    if (_newProfileData.name) newProfileData.name = _newProfileData.name

    if (Object.keys(newProfileData).length === 0) throw boom.badRequest('No profile data to edit.')

    const userDoc = await UserModel.findByIdAndUpdate(userId, newProfileData, { new: true })
    if (!userDoc) throw boom.notFound('User not found.')

    this.log(`A user profile was edited. id=${userDoc._id}`)

    const userData = userDoc.toObject({ versionKey: false }) as User
    delete userData.uploads
    return userData
  },

  /**
   * Link a file to a user
   * @param userId The user id of the user
   * @param file Uploaded file to link to a user
   */
  async addUpload(userId: string, file: Upload) {
    // Add the upload to the user uploads list
    const userDoc = await UserModel.findOneAndUpdate(
      { _id: userId },
      {
        $push: { uploads: file as UploadDB }
      },
      { new: true }
    )

    if (!userDoc) throw boom.internal('Unexpected error when adding file.')

    this.log(`Added a file. user=${userDoc.email}, id=${userDoc._id}, fileName=${file.name}`)
    return (userDoc.toObject({ versionKey: false }) as User).uploads.find(x => x.name === file.name) as Upload
  },

  /**
   * Edit a file upload state
   * @param userId The user id of the user to delete
   * @param uploadId The state of an upload
   * @param fileName Uploaded file to edit state from
   * @param newState New state of the upload
   * @param analysisId ID of analysis if state = finished
   */
  async setUploadState(
    userId: string,
    uploadId: string,
    fileName: Upload['name'],
    newState: Upload['state'],
    analysisId?: string
  ) {
    // Add the upload to the user uploads list
    const userDoc = await UserModel.findOneAndUpdate(
      { _id: userId, 'uploads._id': uploadId },
      { 'uploads.$.state': newState, 'uploads.$.analysisId': analysisId },
      { new: true }
    )

    if (!userDoc) throw boom.internal('Unexpected error when setting analysis state.')

    this.log(
      `Edited an upload state. user=${userDoc.email}, id=${userDoc._id}, fileName=${fileName}, newState=${newState}`
    )
  },

  /**
   * Find data of a registered user
   * @param userId The user id of the user
   * @returns The user's data
   * @throws Could not find the user
   */
  async find(userId: string) {
    const user = await UserModel.findById(userId)
    if (!user) throw boom.notFound('User not found.')
    return user
  },

  /**
   * Find data of a registered user
   * @param email The email of the user
   * @returns The user's data
   * @throws Could not find the user
   */
  async findEmail(email: string) {
    const user = await UserModel.findOne({ email })
    if (!user) throw boom.notFound('User not found.')
    return user
  }
}
