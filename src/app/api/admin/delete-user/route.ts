import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    console.log('Delete user API called')
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('No session found')
      return NextResponse.json(
        { error: 'ავტორიზაცია საჭიროა' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.userType !== 'ADMIN') {
      console.log('User is not admin:', session.user.userType)
      return NextResponse.json(
        { error: 'მხოლოდ ადმინისტრატორებს შეუძლიათ მომხმარებლების წაშლა' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      console.log('Missing userId')
      return NextResponse.json(
        { error: 'მომხმარებლის ID საჭიროა' },
        { status: 400 }
      );
    }

    console.log('Attempting to delete user:', userId)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        teacher: true,
        admin: true
      }
    });

    if (!user) {
      console.log('User not found:', userId)
      return NextResponse.json(
        { error: 'მომხმარებელი ვერ მოიძებნა' },
        { status: 404 }
      );
    }

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      console.log('Admin trying to delete themselves')
      return NextResponse.json(
        { error: 'თქვენ ვერ წაშლით საკუთარ თავს' },
        { status: 400 }
      );
    }

    // Prevent admin from deleting other admins (optional security feature)
    if (user.userType === 'ADMIN') {
      console.log('Admin trying to delete another admin')
      return NextResponse.json(
        { error: 'ადმინისტრატორების წაშლა არ არის დაშვებული' },
        { status: 400 }
      );
    }

    console.log('User found, deleting:', user.email)

    // Delete related records first (due to foreign key constraints)
    if (user.student) {
      await prisma.student.delete({
        where: { id: user.student.id }
      });
      console.log('Student record deleted')
    }

    if (user.teacher) {
      await prisma.teacher.delete({
        where: { id: user.teacher.id }
      });
      console.log('Teacher record deleted')
    }

    if (user.admin) {
      await prisma.admin.delete({
        where: { id: user.admin.id }
      });
      console.log('Admin record deleted')
    }

    // Delete verification tokens if any
    await prisma.verificationToken.deleteMany({
      where: { email: user.email }
    });
    console.log('Verification tokens deleted')

    // Delete password reset tokens if any
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email }
    });
    console.log('Password reset tokens deleted')

    // Finally delete the user
    await prisma.user.delete({
      where: { id: userId }
    });
    console.log('User deleted successfully')

    return NextResponse.json({
      message: 'მომხმარებელი წარმატებით წაიშალა',
      deletedUser: {
        id: user.id,
        email: user.email,
        userType: user.userType
      }
    });

  } catch (error) {
    console.error('Delete user error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'სისტემური შეცდომა მოხდა' },
      { status: 500 }
    );
  }
}
