import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Allow access to root page without authentication
    if (path === "/") {
      return NextResponse.next()
    }

    // If no token, redirect to signin
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Student routes protection
    if (path.startsWith("/student") && token.userType !== "STUDENT") {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    // Teacher routes protection
    if (path.startsWith("/teacher") && token.userType !== "TEACHER") {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    // Admin routes protection
    if (path.startsWith("/admin") && token.userType !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }



    // Dashboard access based on user type
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
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - root page (/)
     * - auth pages (/auth/*)
     */
    "/student/:path*",
    "/teacher/:path*", 
    "/admin/:path*",
    "/dashboard"
  ]
}
