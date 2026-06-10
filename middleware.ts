import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ['/profile', '/profile/edit'];
const protectedApiRoutes = ['/api/auth/me'];

export function middleware(request :NextRequest){
	const sessionToken = request.cookies.get('auth-token')?.value;
	const {pathname} = request.nextUrl;
	
	const isProtectedRoute = protectedRoutes.some(route=>pathname.startsWith(route));
	if (isProtectedRoute && !sessionToken)
		return NextResponse.redirect(new URL('/?auth=required', request.url));
	const isProtectedApiRoute = protectedApiRoutes.some(route=>pathname.startsWith(route));
	if (isProtectedApiRoute && !sessionToken){
		return NextResponse.json(
			{error : 'Non autorise. Veuillez vous connecter.'},
			{status : 401}
		);
	}
	return NextResponse.next();
}

export const config = {
	matcher :['/profile/:path*', '/api/auth/me']
};