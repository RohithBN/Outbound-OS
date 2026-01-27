import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

const COOKIE_NAME = "auth_token";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/goals", "/campaigns", "/prospects", "/settings"];

// Routes that are only for unauthenticated users
const authRoutes = ["/login", "/signup", "/forgot-password"];

// Public routes that don't need any checks
const publicRoutes = [
  "/", 
  "/api/auth/login", 
  "/api/auth/signup", 
  "/api/auth/logout",
  "/talent/register",
  "/api/talent/register"
];

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Skip middleware for API routes except auth-protected ones
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/goals") && !pathname.startsWith("/api/campaigns") && !pathname.startsWith("/api/prospects")) {
    return NextResponse.next();
  }
  // if path is just / redirect to login
  if(pathname==='/'){
    return NextResponse.redirect(new URL('/login',request.url))
  }
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if route is auth-only (login, signup)
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if route is public
  const isPublicRoute = publicRoutes.includes(pathname);

  // Verify token if present
  const isValidToken = token ? await verifyToken(token) : false;

  // Redirect to login if accessing protected route without valid token
  if (isProtectedRoute && !isValidToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth routes with valid token
  if (isAuthRoute && isValidToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // For protected API routes, return 401 instead of redirect
  if (pathname.startsWith("/api/") && !isValidToken) {
    const isProtectedApi = ["/api/goals", "/api/campaigns", "/api/prospects"].some(
      (route) => pathname.startsWith(route)
    );
    if (isProtectedApi) {
      return NextResponse.json(
        { message: "Not authenticated", success: false },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
