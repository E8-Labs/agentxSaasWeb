import React, { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
    // You can send this error to an external logging service (e.g., Sentry, LogRocket)
  }

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development'

      return (
        <div className="flex flex-col justify-center items-center h-[100svh] w-full p-8">
          <div className="max-w-2xl text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              {`We're sorry, but an unexpected error occurred. Please try refreshing the page.`}
            </p>

            {isDevelopment && this.state.error && (
              <div className="text-left bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Error Details:
                </h3>
                <p className="text-red-700 font-mono text-sm mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-red-800 font-medium cursor-pointer">
                      Component Stack
                    </summary>
                    <pre className="text-red-700 text-xs mt-2 overflow-auto max-h-48">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
