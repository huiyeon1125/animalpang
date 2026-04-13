import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import dbConnect from '@/db/dbConnect';
import User from '@/db/models/user';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { username, password, name, role } = await request.json();

    // Validate required fields
    if (!username || !password || !name) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword,
      name,
      role: role || 'analyst',
    });

    await newUser.save();

    return NextResponse.json({ message: 'User created successfully', user: { _id: newUser._id, username: newUser.username } }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}