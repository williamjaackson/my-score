import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// Helper function to calculate Euclidean distance between two arrays
function euclideanDistance(a: number[], b: number[]): number {
    if (a.length !== b.length) return Infinity;
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
}

export async function POST(req: NextRequest) {
    const { descriptor } = await req.json();
    if (!descriptor || !Array.isArray(descriptor)) {
        return NextResponse.json({ error: "Descriptor is required and must be an array" }, { status: 400 });
    }

    // Fetch all users with a faceDescriptor
    const users = await prisma.user.findMany({
        where: {
            faceDescriptor: { isNot: null }
        },
        select: {
            id: true,
            faceDescriptor: {
                select: { descriptor: true }
            },
            name: true,
            otherScore: true,
            criminalScore: true,
            relationScore: true,
            ratingScore: true,

        }
    });

    let bestMatch: { user: any, distance: number } | null = null;
    const threshold = 0.6; // Adjust this threshold as needed

    for (const user of users) {
        const storedDescriptor = user.faceDescriptor?.descriptor;
        if (Array.isArray(storedDescriptor)) {
            const distance = euclideanDistance(
                descriptor.filter((v: any) => typeof v === "number"),
                storedDescriptor.filter((v: any) => typeof v === "number")
            );
            if (distance < threshold && (!bestMatch || distance < bestMatch.distance)) {
                bestMatch = { user, distance };
            }
        }
    }

    if (bestMatch) {
        return NextResponse.json({
            user: {
                ...bestMatch.user,
                faceDescriptor: undefined,
                totalScore: bestMatch.user.otherScore + bestMatch.user.criminalScore + bestMatch.user.relationScore + bestMatch.user.ratingScore
            },
            distance: bestMatch.distance
        }, { status: 200 });
    } else {
        return NextResponse.json({ error: "No similar face found" }, { status: 404 });
    }
}