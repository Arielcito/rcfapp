import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/auth/signin', '/auth/signup', '/auth/forgot-password']
const protectedRoutes = ['/dashboard', '/profile', '/settings']

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl
    console.log('🛣️ Middleware: Ruta actual:', pathname);

    // Verificar si es una ruta pública
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      console.log('🔓 Middleware: Ruta pública detectada');
      
      // Si el usuario ya está autenticado, redirigir al dashboard
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`, {
          headers: {
            Cookie: request.headers.get('cookie') || '',
          },
          credentials: 'include',
        })

        if (response.ok) {
          console.log('👤 Usuario ya autenticado, redirigiendo al dashboard');
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
      }
      
      return NextResponse.next()
    }

    // Verificar rutas protegidas
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`, {
        headers: {
          Cookie: request.headers.get('cookie') || '',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        console.log('❌ No hay sesión válida, redirigiendo a login');
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }

      console.log('✅ Acceso permitido a ruta protegida');
    }

    return NextResponse.next()
  } catch (error) {
    console.error('💥 Error en middleware:', error)
    return NextResponse.redirect(new URL('/auth/signin', request.url))
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