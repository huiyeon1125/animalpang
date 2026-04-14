import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import Wishlist from '@/db/models/wishlist'
import Product from '@/db/models/product'

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await dbConnect()
    const { userId } = await params

    let wishlist = await Wishlist.findOne({ userId }).populate('items.productId')

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] })
      await wishlist.save()
      await wishlist.populate('items.productId')
    }

    return NextResponse.json(wishlist, { status: 200 })
  } catch (error) {
    console.error('Wishlist fetch error:', error)
    return NextResponse.json({ message: 'Failed to fetch wishlist' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await dbConnect()
    const { userId } = await params
    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ message: 'Missing productId' }, { status: 400 })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    }

    let wishlist = await Wishlist.findOne({ userId })
    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] })
    }

    const exists = wishlist.items.some((item: any) => item.productId.toString() === productId)

    if (!exists) {
      wishlist.items.push({ productId })
      await wishlist.save()
    }

    await wishlist.populate('items.productId')

    return NextResponse.json({ message: 'Wishlist updated', wishlist }, { status: 200 })
  } catch (error) {
    console.error('Wishlist add error:', error)
    return NextResponse.json({ message: 'Failed to update wishlist' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await dbConnect()
    const { userId } = await params
    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ message: 'Missing productId' }, { status: 400 })
    }

    const wishlist = await Wishlist.findOne({ userId })
    if (!wishlist) {
      return NextResponse.json({ message: 'Wishlist not found' }, { status: 404 })
    }

    wishlist.items = wishlist.items.filter((item: any) => item.productId.toString() !== productId)
    await wishlist.save()
    await wishlist.populate('items.productId')

    return NextResponse.json({ message: 'Wishlist updated', wishlist }, { status: 200 })
  } catch (error) {
    console.error('Wishlist delete error:', error)
    return NextResponse.json({ message: 'Failed to update wishlist' }, { status: 500 })
  }
}
