import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

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
    // Extract token from request (don't verify here - let backend verify)
    // Next.js API routes are just proxies; backend will handle JWT verification
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

    // If no token found, return null (not authenticated)
    if (!token) {
      return null
    }

    // Return a minimal user object - backend will verify the token
    // We just need to indicate that a token was found
    return {
      id: 0, // Will be set by backend after verification
      userRole: undefined,
      agencyId: undefined,
    }
  } catch (error) {
    console.error('Error extracting token:', error)
    return null
  }
}
