import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import Cart from '@/db/models/cart'
import Product from '@/db/models/product'

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await dbConnect()
    const { userId } = await params

    let cart = await Cart.findOne({ userId }).populate('items.productId')

    if (!cart) {
      cart = new Cart({ userId, items: [], totalPrice: 0 })
      await cart.save()
    }

    return NextResponse.json(cart, { status: 200 })
  } catch (error) {
    console.error('Cart fetch error:', error)
    return NextResponse.json({ message: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await dbConnect()
    const { userId } = await params
    const { productId, quantity } = await request.json()

    if (!productId || !quantity) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    }

    let cart = await Cart.findOne({ userId })
    if (!cart) {
      cart = new Cart({ userId, items: [], totalPrice: 0 })
    }

    const existingItem = cart.items.find((item: any) => item.productId.toString() === productId)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.items.push({
        productId,
        quantity,
        price: product.price,
      })
    }

    cart.totalPrice = cart.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    await cart.save()
    await cart.populate('items.productId')

    return NextResponse.json({ message: 'Item added to cart', cart }, { status: 200 })
  } catch (error) {
    console.error('Cart add item error:', error)
    return NextResponse.json({ message: 'Failed to add item to cart' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await dbConnect()
    const { userId } = await params
    const { productId, quantity } = await request.json()

    let cart = await Cart.findOne({ userId })
    if (!cart) {
      return NextResponse.json({ message: 'Cart not found' }, { status: 404 })
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter((item: any) => item.productId.toString() !== productId)
    } else {
      const item = cart.items.find((item: any) => item.productId.toString() === productId)
      if (item) {
        item.quantity = quantity
      }
    }

    cart.totalPrice = cart.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    await cart.save()
    await cart.populate('items.productId')

    return NextResponse.json({ message: 'Cart updated', cart }, { status: 200 })
  } catch (error) {
    console.error('Cart update error:', error)
    return NextResponse.json({ message: 'Failed to update cart' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await dbConnect()
    const { userId } = await params

    await Cart.deleteOne({ userId })

    return NextResponse.json({ message: 'Cart cleared' }, { status: 200 })
  } catch (error) {
    console.error('Cart delete error:', error)
    return NextResponse.json({ message: 'Failed to clear cart' }, { status: 500 })
  }
}
