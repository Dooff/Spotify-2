import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
    const token = await getToken({ req, secret: process.env.JWT_SECRET });

    const { pathname } = req.nextUrl;

    //Permitir las requests si lo siguiente == true
    //1) Es una request para la session de next-auth
    //2) El token existe
    if(pathname.includes("/api/auth") || token)
       return NextResponse.next();

    //Redirecciona al login si no tienen un token Y solicitan una url protegida
    if(!token && pathname !== '/login')
        return NextResponse.redirect('/login');


}