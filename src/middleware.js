import { NextResponse } from "next/server";

export async function middleware(request) {
  const response = NextResponse.next();
  const searchParams = request.nextUrl.searchParams.toString();
  response.headers.set("searchParams", searchParams);
  return response;
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
