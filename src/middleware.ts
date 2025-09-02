import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    console.log(
      "Middleware - Path:",
      path,
      "Token:",
      token ? { userType: token.userType, email: token.email } : "No token"
    )

    // Root page ყველასთვის ღიაა
    if (path === "/") {
      return NextResponse.next()
    }

    // თუ საერთოდ არ არის token → გადავამისამართოთ signin-ზე
    if (!token) {
      console.log("Middleware - No token, redirecting to signin")
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // თუ ჯერ არ არის userType ჩაწერილი token-ში → დავუშვათ გვერდზე გადასვლა
    if (!token.userType) {
      console.log("Middleware - Token has no userType yet, allowing request")
      return NextResponse.next()
    }

    // Student routes protection
    if (path.startsWith("/student") && token.userType !== "STUDENT") {
      console.log("Middleware - Student route access denied for:", token.userType)
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    // Teacher routes protection
    if (path.startsWith("/teacher") && token.userType !== "TEACHER") {
      console.log("Middleware - Teacher route access denied for:", token.userType)
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    // Admin routes protection
    if (path.startsWith("/admin") && token.userType !== "ADMIN") {
      console.log("Middleware - Admin route access denied for:", token.userType)
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    // Dashboard redirect by role
    if (path === "/dashboard") {
      switch (token.userType) {
        case "STUDENT":
          return NextResponse.redirect(new URL("/student/dashboard", req.url))
        case "TEACHER":
          return NextResponse.redirect(new URL("/teacher/dashboard", req.url))
        case "ADMIN":
          return NextResponse.redirect(new URL("/admin/dashboard", req.url))
        default:
          return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // token თუ არსებობს, ვუშვებთ
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    "/student/:path*",
    "/teacher/:path*",
    "/admin/:path*",
    "/dashboard"
  ]
}
