import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
const bcrypt = require('bcrypt');

export async function POST(request) {


    const body = await request.json();

    const {name, email, password} = body;


    if (!email || !password || !name) {
        return NextResponse.json({ error: 'Email, password and name are required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

   const user = await prisma.user.create({
        data: {
            name: name,
            email,
            password: hashedPassword,
        }
    })

    return NextResponse.json({ message: 'User created successfully', user }, { status: 201 });



}