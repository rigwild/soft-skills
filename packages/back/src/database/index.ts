import mongoose from 'mongoose'

import { MONGO_URI } from '../config'

/** Connect to the MongoDB database */
export const connectDb = async () => {


  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
  })
  mongoose.connection.on('error', err => {
    throw new Error(err.message)
  })
}

/** Disonnect from the MongoDB database */
export const closeDb = () => mongoose.disconnect()

export * from './controllers/User'
