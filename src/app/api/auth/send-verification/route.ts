import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import { z } from 'zod';

const sendVerificationSchema = z.object({
  email: z.string().email('გთხოვთ შეიყვანოთ სწორი ელ-ფოსტა'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = sendVerificationSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'ამ ელ-ფოსტით მომხმარებელი უკვე არსებობს' },
        { status: 400 }
      );
    }
    
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Delete any existing verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { email: validatedData.email }
    });
    
    // Create new verification token
    await prisma.verificationToken.create({
      data: {
        email: validatedData.email,
        token: verificationCode,
        expires: expiresAt,
      }
    });
    
    // Send verification email
    const emailResult = await sendVerificationEmail(validatedData.email, verificationCode);
    
    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'ვერიფიკაციის ელ-ფოსტის გაგზავნა ვერ მოხერხდა' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'ვერიფიკაციის კოდი წარმატებით გაიგზავნა',
      email: validatedData.email
    });
    
  } catch (error) {
    console.error('Send verification error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'დაფიქსირდა შეცდომა' },
      { status: 500 }
    );
  }
}
