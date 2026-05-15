import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex justify-center items-center w-screen h-screen bg-dark-bg text-white p-5">
          <div className="max-w-[500px] w-full p-10 text-center glass-dark">
            <h2 className="text-red-400 mt-0 text-xl font-bold">Something went wrong</h2>
            <p className="text-gray-400 mt-2">The application encountered an unexpected error.</p>
            <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto text-left text-[0.8rem] my-5 text-red-300/80">
              {this.state.error?.message}
            </pre>
            <button 
              className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg cursor-pointer font-semibold transition-all shadow-lg shadow-primary/20"
              onClick={() => window.location.reload()}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
