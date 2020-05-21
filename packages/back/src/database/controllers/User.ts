import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import boom from '@hapi/boom'

import { UserModel, UserDocument } from '../models/User'
import { JWT_SECRET } from '../../config'

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

    this.log(`User logged in. email=${user.email}, id=${user.id}`)
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

    this.log(`A user was deleted. id=${user.id}`)
    return { id: user.id }
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
