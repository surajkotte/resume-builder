import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const hasToken = request.cookies.has("token");
  const authRoutes = ["/", "/login", "/signup"];
  const { pathname } = request.nextUrl;
  // List every folder you want locked down
  console.log("in proxy");
  const isProtectedRoute = pathname.startsWith("/chat");
  if (isProtectedRoute && !hasToken) {
    console.log("in no token");
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (authRoutes.includes(pathname) && hasToken) {
    console.log("in token");
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
