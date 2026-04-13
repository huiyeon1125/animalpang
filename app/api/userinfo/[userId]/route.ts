import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import UserInfo from '@/db/models/userInfo'

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await dbConnect()
    const { userId } = await params

    let userInfo = await UserInfo.findOne({ userId })

    if (!userInfo) {
      userInfo = new UserInfo({ userId })
      await userInfo.save()
    }

    return NextResponse.json(userInfo, { status: 200 })
  } catch (error) {
    console.error('User info fetch error:', error)
    return NextResponse.json({ message: 'Failed to fetch user info' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await dbConnect()
    const { userId } = await params
    const { phone, address, city, zipCode, profileImage, bio } = await request.json()

    const userInfo = await UserInfo.findOneAndUpdate(
      { userId },
      { phone, address, city, zipCode, profileImage, bio },
      { new: true, upsert: true }
    )

    return NextResponse.json({ message: 'User info updated', userInfo }, { status: 200 })
  } catch (error) {
    console.error('User info update error:', error)
    return NextResponse.json({ message: 'Failed to update user info' }, { status: 500 })
  }
}
