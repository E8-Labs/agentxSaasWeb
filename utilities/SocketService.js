import { io } from 'socket.io-client'

/**
 * SocketService - Real-time communication service
 *
 * Server Implementation Guide:
 *
 * 1. Authentication: Use the auth.token, auth.userId, auth.userEmail sent during connection
 * 2. User Rooms: Listen for 'join-user-room' and 'leave-user-room' events
 * 3. Profile Updates: Send events to specific user rooms only
 *
 * Example Server Code:
 *
 * // When user connects
 * socket.on('join-user-room', (userId) => {
 *   socket.join(`user_${userId}`);
 * });
 *
 * // When sending profile update
 * io.to(`user_${userId}`).emit('profile-updated', profileData);
 *
 * // When user disconnects
 * socket.on('leave-user-room', (userId) => {
 *   socket.leave(`user_${userId}`);
 * });
 */
class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.isConnecting = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 0
    this.reconnectDelay = 1000 // 1 second initial delay
  }

  // Get server URL based on environment
  // getServerUrl() {
  //   if (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production") {
  //     return process.env.NEXT_PUBLIC_SOCKET_URL || `wss://app.assignx.ai`;
  //   }
  //   return process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:8002';
  // }
  getServerUrl() {
    if (process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production') {
      return `wss://apimyagentx.com/agentx`
    }
    return `wss://apimyagentx.com/agentxtest`
  }

  // Get user data from localStorage
  getUserData() {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('User')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          return {
            token: user.token,
            userId: user.user?.id,
            userEmail: user.user?.email,
          }
        } catch (err) {
          console.error('Error parsing user data for socket auth:', err)
        }
      }
    }
    return null
  }

  // Get auth token from localStorage
  getAuthToken() {
    const userData = this.getUserData()
    return userData?.token || null
  }

  // Connect to socket server (DISABLED)
  connect() {
    console.log('🔌 Socket connection disabled')
    return
  }

  // Setup socket event listeners
  setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully')
      this.isConnected = true
      this.isConnecting = false
      this.reconnectAttempts = 0

      // Join user-specific room for targeted updates
      const userData = this.getUserData()
      if (userData?.userId) {
        this.socket.emit('join-user-room', userData.userId)
        console.log(`🏠 Joined user room: user_${userData.userId}`)
      }
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
      this.isConnected = false
      this.isConnecting = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error)
      this.isConnecting = false
      this.reconnectAttempts++

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('🔌 Max reconnection attempts reached. Giving up.')
      }
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`)
      this.isConnected = true
      this.isConnecting = false
      this.reconnectAttempts = 0
    })

    this.socket.on('reconnect_error', (error) => {
      console.error('🔄 Socket reconnection error:', error)
    })

    // Listen for user-specific profile updates
    this.socket.on('profile-updated', (profileData) => {
      console.log('📝 Profile update received:', profileData)

      // Verify this update is for the current user
      const userData = this.getUserData()
      console.log('Profile data:', profileData.data)
      console.log('User data:', userData)
      if (
        profileData?.data?.id &&
        userData?.userId &&
        profileData.data.id === userData.userId
      ) {
        console.log('✅ Profile update verified for current user')
        this.handleProfileUpdate(profileData.data)
      } else {
        console.warn('⚠️ Profile update received for different user, ignoring')
        console.warn(
          'Profile user ID:',
          profileData?.data?.id,
          'Current user ID:',
          userData?.userId,
        )
      }
    })
  }

  // Handle profile update from server
  handleProfileUpdate(profileData) {
    try {
      if (typeof window !== 'undefined') {
        // Get current user data from localStorage
        const userData = localStorage.getItem('User')
        if (userData) {
          const localStorageUser = JSON.parse(userData)

          // Update the user object with new profile data
          localStorageUser.user = profileData

          // Save back to localStorage
          localStorage.setItem('User', JSON.stringify(localStorageUser))

          console.log('📝 Profile updated in localStorage')

          // Dispatch custom event to notify components
          window.dispatchEvent(
            new CustomEvent('UpdateProfile', { detail: { update: true } }),
          )

          console.log('📝 UpdateProfile event dispatched')
        }
      }
    } catch (error) {
      console.error('📝 Error handling profile update:', error)
    }
  }

  // Subscribe to profile updates (can be used by components)
  subscribeToProfileUpdates(callback) {
    if (this.socket) {
      this.socket.on('profile-updated', callback)
    }
  }

  // Unsubscribe from profile updates
  unsubscribeFromProfileUpdates(callback) {
    if (this.socket) {
      this.socket.off('profile-updated', callback)
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...')

      // Leave user room before disconnecting
      const userData = this.getUserData()
      if (userData?.userId) {
        this.socket.emit('leave-user-room', userData.userId)
        console.log(`🏠 Left user room: user_${userData.userId}`)
      }

      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.isConnecting = false
    }
  }

  // Check if socket is connected
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected
  }

  // Get connection status
  getConnectionStatus() {
    if (this.isConnecting) return 'connecting'
    if (this.isConnected) return 'connected'
    return 'disconnected'
  }
}

// Create singleton instance
const socketService = new SocketService()

export default socketService
