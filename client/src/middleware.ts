import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard')
    
    if (isProtectedRoute) {
      console.log('🔒 Middleware: Verificando ruta protegida...');
      console.log('🍪 Cookies presentes:', request.headers.get('cookie'));
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        headers: {
          Cookie: request.headers.get('cookie') || '',
        },
        credentials: 'include',
      })

      console.log('📡 Respuesta de /api/users/me:', {
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        console.log('❌ No hay sesión válida, redirigiendo a login');
        return NextResponse.redirect(new URL('/signin', request.url))
      }

      const user = await response.json()
      console.log('👤 Usuario encontrado:', user);
      console.log('✅ Acceso permitido al dashboard');
    }

    return NextResponse.next()
  } catch (error) {
    console.error('💥 Error en middleware:', error)
    return NextResponse.redirect(new URL('/signin', request.url))
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',  // Protege todas las rutas que empiecen con /dashboard
  ]
} 