import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/signin', '/signup', '/forgot-password']
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
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
      console.log('🔒 Middleware: Verificando ruta protegida...');
      console.log('🍪 Cookies presentes:', request.headers.get('cookie'));
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        headers: {
          Cookie: request.headers.get('cookie') || '',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        console.log('❌ No hay sesión válida, redirigiendo a login');
        return NextResponse.redirect(new URL('/signin', request.url))
      }

      const user = await response.json()
      console.log('👤 Usuario autenticado:', user);

      // Verificar si el usuario necesita completar el onboarding
      if (!user.onboardingCompleted && pathname !== '/onboarding') {
        console.log('🔄 Usuario necesita completar onboarding');
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }

      console.log('✅ Acceso permitido a ruta protegida');
    }

    return NextResponse.next()
  } catch (error) {
    console.error('💥 Error en middleware:', error)
    return NextResponse.redirect(new URL('/signin', request.url))
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/signin',
    '/signup',
    '/forgot-password',
    '/onboarding'
  ]
} 