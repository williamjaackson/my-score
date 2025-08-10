import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
export async function POST(request: NextRequest) {

     const token = request.cookies.get("session-token")?.value;
    if (!token) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    try {
        const jwtSecret = process.env.JWT_SECRET as string;
        if (!jwtSecret) {
            return NextResponse.json({ user: null }, { status: 500 });
        }
        const decoded = jwt.verify(token, jwtSecret);
        const userId = typeof decoded === "object" && decoded !== null && "id" in decoded ? (decoded as jwt.JwtPayload).id : undefined;
        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }
        const { descriptor } = await request.json();

        if (!descriptor) {
            return NextResponse.json({ error: "Descriptor is required" }, { status: 400 });
        }

        try {
            const faceDescriptor = await prisma.user.update({
                where: { id: userId },
                data: {
                    faceDescriptor: {
                        upsert: {
                            create: { descriptor },
                            update: { descriptor }
                        }
                    },
                },
            });
            return NextResponse.json(faceDescriptor, { status: 201 });
        } catch (error) {
            console.error("Error saving face descriptor:", error);
            return NextResponse.json({ error: "Failed to register face" }, { status: 500 });
        }
    }

    catch (error) {
        console.error("JWT or request processing error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

}