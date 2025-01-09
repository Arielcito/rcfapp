import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/auth/signin', '/auth/signup', '/auth/forgot-password']
const protectedRoutes = ['/dashboard', '/profile', '/settings']

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl
    console.log('🛣️ Middleware: Ruta actual:', pathname);

    const token = request.cookies.get('token')?.value;
    
    // Si el usuario está en el dashboard y tiene token, permitir acceso
    if (pathname.startsWith('/dashboard') && token) {
      console.log('✅ Usuario autenticado en dashboard');
      return NextResponse.next();
    }

    // Verificar si es una ruta pública
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      console.log('🔓 Middleware: Ruta pública detectada');
      
      if (token) {
        // Solo redirigir si no está ya en el dashboard
        if (!pathname.startsWith('/dashboard')) {
          console.log('👤 Token detectado, redirigiendo al dashboard');
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
      
      return NextResponse.next();
    }

    // Verificar rutas protegidas
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      if (!token) {
        console.log('❌ No hay token, redirigiendo a login');
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }
      
      console.log('✅ Token encontrado, acceso permitido a ruta protegida');
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch (error) {
    console.error('💥 Error en middleware:', error);
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password'
  ]
} 