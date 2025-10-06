import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Root page ყველასთვის ღიაა
    if (path === "/") {
      return NextResponse.next()
    }

    // თუ საერთოდ არ არის token → გადავამისამართოთ signin-ზე
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // მნიშვნელოვანი: თუ token არსებობს, მაგრამ userType არ არის → დავუშვათ
    // ეს ხდება sign in პროცესის დროს, როცა JWT ჯერ კიდევ იქმნება
    if (!token.userType) {
      return NextResponse.next()
    }

    // Dashboard redirect by role - ეს უნდა მოხდეს პირველად
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

    // Route protection - მხოლოდ მაშინ, როცა userType უკვე არსებობს
    if (path.startsWith("/student") && token.userType !== "STUDENT") {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    if (path.startsWith("/teacher") && token.userType !== "TEACHER") {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    if (path.startsWith("/admin") && token.userType !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // token თუ არსებობს, ვუშვებთ - მაგრამ userType-ის შემოწმება ცალკე ხდება
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
