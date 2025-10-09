import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      userType: "STUDENT" | "TEACHER" | "ADMIN"
      student?: {
        id: string
        name: string
        lastname: string
        grade: number
        school: string
        phone: string
        code: string
      }
      teacher?: {
        id: string
        name: string
        lastname: string
        subject: string
        school: string
        phone: string
        isVerified: boolean
        canCreateQuestions: boolean
      }
      admin?: {
        id: string
        name: string
        lastname: string
        role: "SUPER_ADMIN" | "ADMIN" | "MODERATOR"
        permissions: string[]
      }
    }
  }

  interface User {
    id: string
    email: string
    userType: "STUDENT" | "TEACHER" | "ADMIN"
    student?: {
      id: string
      name: string
      lastname: string
      grade: number
      school: string
      phone: string
      code: string
    }
    teacher?: {
      id: string
      name: string
      lastname: string
      subject: string
      school: string
      phone: string
      isVerified: boolean
      canCreateQuestions: boolean
    }
    admin?: {
      id: string
      name: string
      lastname: string
      role: "SUPER_ADMIN" | "ADMIN" | "MODERATOR"
      permissions: string[]
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userType: "STUDENT" | "TEACHER" | "ADMIN"
    student?: {
      id: string
      name: string
      lastname: string
      grade: number
      school: string
      phone: string
      code: string
    }
    teacher?: {
      id: string
      name: string
      lastname: string
      subject: string
      school: string
      phone: string
      isVerified: boolean
      canCreateQuestions: boolean
    }
    admin?: {
      id: string
      name: string
      lastname: string
      role: "SUPER_ADMIN" | "ADMIN" | "MODERATOR"
      permissions: string[]
    }
  }
}
