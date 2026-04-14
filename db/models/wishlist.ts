import mongoose from 'mongoose'

const WishlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    collection: 'wishlist',
  }
)

const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema)

export default Wishlist
