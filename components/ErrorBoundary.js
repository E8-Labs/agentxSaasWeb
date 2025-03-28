import React, { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Caught an error:", error, errorInfo);
    // You can send this error to an external logging service (e.g., Sentry, LogRocket)
  }

  render() {
    if (this.state.hasError) {
      //console.log;
      return (
        <div className="flex justify-center items-center h-[100svh] w-full ">
          <h1 className="text-2xl font-bold">Something went wrong.</h1>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
