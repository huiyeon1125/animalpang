import mongoose from 'mongoose'

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'shipped', 'delivered'], default: 'pending' },
    paymentMethod: { type: String, default: '' },
    shippingAddress: { type: String, default: '' },
  },
  {
    timestamps: true,
    collection: 'order',
  }
)

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema)

export default Order
