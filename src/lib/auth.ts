import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("ასეთი იუზერი ვერ მოიძებნა")
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            },
            include: {
              student: true,
              teacher: true,
              admin: true
            }
          })

          if (!user) {
            throw new Error("მომხმარებელი ამ ელ-ფოსტით არ არსებობს. გთხოვთ შეამოწმოთ ელ-ფოსტა ან დარეგისტრირდეთ")
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            throw new Error("პაროლი არასწორია. გთხოვთ სცადოთ თავიდან")
          }

          // If user is a teacher, get subject name
          let teacherWithSubject = user.teacher
          if (user.teacher) {
            const subject = await prisma.subject.findUnique({
              where: { id: user.teacher.subject },
              select: { name: true }
            })
            teacherWithSubject = {
              ...user.teacher,
              subject: subject?.name || user.teacher.subject
            }
          }

          return {
            id: user.id,
            email: user.email,
            userType: user.userType,
            student: user.student || undefined,
            teacher: teacherWithSubject || undefined,
            admin: user.admin || undefined
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw new Error("სისტემური შეცდომა მოხდა. გთხოვთ სცადოთ მოგვიანებით")
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('JWT callback - Setting user data:', { userType: user.userType, email: user.email })
        token.userType = user.userType
        token.student = user.student
        token.teacher = user.teacher
        token.admin = user.admin
        // დავრწმუნდეთ, რომ userType უკვე დაყენებულია
        console.log('JWT callback - UserType set to:', token.userType)
      }
      console.log('JWT callback - Final token:', { userType: token.userType, email: token.email })
      return token
    },
    async session({ session, token }) {
      if (token) {
        console.log('Session callback - Token:', { userType: token.userType, email: token.email })
        session.user.id = token.sub!
        session.user.userType = token.userType
        session.user.student = token.student
        session.user.teacher = token.teacher
        session.user.admin = token.admin
      }
      console.log('Session callback - Session:', { userType: session.user.userType, email: session.user.email })
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
  // Add proper error handling
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', user.email)
    },
    async signOut({ session, token }) {
      console.log('User signed out')
    }
  }
}
