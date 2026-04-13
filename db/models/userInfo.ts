import mongoose from 'mongoose'

const UserInfoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    bio: { type: String, default: '' },
  },
  {
    timestamps: true,
    collection: 'userInfo',
  }
)

const UserInfo = mongoose.models.UserInfo || mongoose.model('UserInfo', UserInfoSchema)

export default UserInfo
