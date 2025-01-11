import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request});
    const url = request.nextUrl;
    if (token) {
        if (
            url.pathname.startsWith('/sign-in') || 
            url.pathname.startsWith('/sign-up') ||
            url.pathname.startsWith('/verify') 
        ) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    if (!token && url.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/sign-in',
        '/sign-up',
        '/',
        '/dashboard/:path*',
        '/verify/:path*',
    ],
};
