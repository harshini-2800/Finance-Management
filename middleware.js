import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("aurum_token")?.value;
  const { pathname } = request.nextUrl;

  // Protected application routes
  const protectedPaths = [
    "/dashboard",
    "/transactions",
    "/budgets",
    "/goals",
    "/insights",
    "/coach",
    "/settings",
  ];

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // If already logged in and visiting auth pages, send to dashboard
  if ((pathname === "/login" || pathname === "/signup") && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/budgets/:path*",
    "/goals/:path*",
    "/insights/:path*",
    "/coach/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
  ],
};

