import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import Product from '@/db/models/product'
import { defaultProducts } from '@/lib/default-products'

export async function GET() {
  try {
    await dbConnect()

    let products = await Product.find().populate('createdBy', 'name')

    if (products.length === 0) {
      await Product.insertMany(defaultProducts)
      products = await Product.find().populate('createdBy', 'name')
    }

    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(defaultProducts, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const { name, description, price, image, category, stock, createdBy } = await request.json()

    if (!name || !description || !price || !category) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const product = new Product({
      name,
      description,
      price,
      image,
      category,
      stock: stock || 0,
      createdBy,
    })

    await product.save()

    return NextResponse.json({ message: 'Product created successfully', product }, { status: 201 })
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json({ message: 'Failed to create product' }, { status: 500 })
  }
}
