import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Validation schema for teacher creation by admin
const adminCreateTeacherSchema = z.object({
  email: z.string().email("გთხოვთ შეიყვანოთ სწორი ელ-ფოსტა"),
  password: z.string().min(6, "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს"),
  name: z.string().min(2, "სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს"),
  lastname: z.string().min(2, "გვარი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს"),
  subject: z.string().min(2, "საგნის სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს").transform(val => val.trim()),
  school: z.string().min(2, "სკოლის სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს"),
  phone: z.string().min(9, "ტელეფონის ნომერი უნდა შეიცავდეს მინიმუმ 9 ციფრს"),
  isVerified: z.boolean().default(true) // Admin can set verification status
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'არასაკმარისი უფლებები' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate the request body
    const validatedData = adminCreateTeacherSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'ამ ელ-ფოსტით მომხმარებელი უკვე არსებობს' },
        { status: 400 }
      )
    }

    // Check if phone number already exists
    const existingPhone = await prisma.teacher.findUnique({
      where: { phone: validatedData.phone }
    })
    
    if (existingPhone) {
      return NextResponse.json(
        { error: 'ამ ტელეფონის ნომერით მასწავლებელი უკვე არსებობს' },
        { status: 400 }
      )
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // Create user and teacher records
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        userType: 'TEACHER',
        isActive: true,
        teacher: {
          create: {
            name: validatedData.name,
            lastname: validatedData.lastname,
            subject: validatedData.subject,
            school: validatedData.school,
            phone: validatedData.phone,
            isVerified: validatedData.isVerified,
          }
        }
      },
      include: {
        teacher: true
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'მასწავლებლის შექმნა ვერ მოხერხდა' },
        { status: 500 }
      )
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'მასწავლებელი წარმატებით შეიქმნა',
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        teacher: user.teacher
      }
    })

  } catch (error) {
    console.error('Error creating teacher:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'სისტემური შეცდომა მოხდა' },
      { status: 500 }
    )
  }
}
