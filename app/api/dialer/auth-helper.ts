import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import JWT from 'jsonwebtoken'

export interface AuthUser {
  id: number
  userRole?: string
  agencyId?: number
}

/**
 * Extract and verify JWT token from request
 * Returns user info or null if not authenticated
 */
export async function getAuthUser(
  req: NextRequest,
): Promise<AuthUser | null> {
  try {
    // Try to get token from Authorization header
    const authHeader = req.headers.get('Authorization')
    let token: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    } else {
      // Try to get from cookies
      const cookieStore = await cookies()
      const authCookie = cookieStore.get('auth_token')
      if (authCookie) {
        token = authCookie.value
      } else {
        // Try User cookie (legacy)
        const userCookie = cookieStore.get('User')
        if (userCookie) {
          try {
            const userData = JSON.parse(decodeURIComponent(userCookie.value))
            token = userData.token
          } catch (error) {
            console.error('Error parsing user cookie:', error)
          }
        }
      }
    }

    if (!token) {
      return null
    }

    // Verify JWT token
    const secret = process.env.SecretJwtKey || process.env.NEXT_PUBLIC_JWT_SECRET
    if (!secret) {
      console.error('JWT secret not configured')
      return null
    }

    const decoded = JWT.verify(token, secret) as any

    if (!decoded || !decoded.user) {
      return null
    }

    return {
      id: decoded.user.id,
      userRole: decoded.user.userRole,
      agencyId: decoded.user.agencyId,
    }
  } catch (error) {
    console.error('Error verifying JWT:', error)
    return null
  }
}
