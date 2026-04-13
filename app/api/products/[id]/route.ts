import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import Product from '@/db/models/product'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    
    const product = await Product.findById(id).populate('createdBy', 'name')
    
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product, { status: 200 })
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json({ message: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params
    const { name, description, price, image, category, stock } = await request.json()

    const product = await Product.findByIdAndUpdate(
      id,
      { name, description, price, image, category, stock },
      { new: true }
    )

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Product updated successfully', product }, { status: 200 })
  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json({ message: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()
    const { id } = await params

    const product = await Product.findByIdAndDelete(id)

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Product delete error:', error)
    return NextResponse.json({ message: 'Failed to delete product' }, { status: 500 })
  }
}
