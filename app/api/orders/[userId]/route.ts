import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import Order from '@/db/models/order'
import Cart from '@/db/models/cart'

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await dbConnect()
    const { userId } = await params

    const orders = await Order.find({ userId }).populate('items.productId').sort({ createdAt: -1 })

    return NextResponse.json(orders, { status: 200 })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await dbConnect()
    const { userId } = await params
    const { paymentMethod, shippingAddress } = await request.json()

    const cart = await Cart.findOne({ userId }).populate('items.productId')

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 400 })
    }

    const order = new Order({
      userId,
      items: cart.items.map((item: any) => ({
        productId: item.productId._id,
        productName: item.productId.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalPrice: cart.totalPrice,
      paymentMethod,
      shippingAddress,
      status: 'paid',
    })

    await order.save()
    await Cart.deleteOne({ userId })

    return NextResponse.json({ message: 'Order created successfully', order }, { status: 201 })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ message: 'Failed to create order' }, { status: 500 })
  }
}
