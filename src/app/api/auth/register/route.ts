import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { registrationSchema } from '@/lib/validations/auth'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = registrationSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // Create user and related records based on user type
    let user, student, teacher, admin
    
    if (validatedData.userType === 'STUDENT') {
      // Generate unique 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      
      user = await prisma.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          userType: 'STUDENT',
          isActive: true,
          student: {
            create: {
              name: validatedData.studentName!,
              lastname: validatedData.studentLastname!,
              grade: validatedData.grade!,
              school: validatedData.school!,
              phone: validatedData.studentPhone!,
              code: code,
            }
          }
        },
        include: {
          student: true
        }
      })
    } else if (validatedData.userType === 'TEACHER') {
      user = await prisma.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          userType: 'TEACHER',
          isActive: true,
          teacher: {
            create: {
              name: validatedData.teacherName!,
              lastname: validatedData.teacherLastname!,
              subject: validatedData.subject!,
              school: validatedData.teacherSchool!,
              phone: validatedData.teacherPhone!,
              isVerified: false, // Teachers need to be verified by admin
            }
          }
        },
        include: {
          teacher: true
        }
      })
    } else if (validatedData.userType === 'ADMIN') {
      user = await prisma.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          userType: 'ADMIN',
          isActive: true,
          admin: {
            create: {
              name: validatedData.adminName!,
              lastname: validatedData.adminLastname!,
              role: "ADMIN", // Default role for all admin users
              permissions: [], // Default empty permissions
            }
          }
        },
        include: {
          admin: true
        }
      })
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }
    
    // Return success response
    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        isActive: user.isActive,
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
