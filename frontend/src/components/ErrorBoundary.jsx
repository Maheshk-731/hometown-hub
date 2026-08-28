import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log for debugging; in production this could report to a monitoring service.
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5 text-center" style={{ maxWidth: 480 }}>
          <p className="eyebrow mb-2">Something went wrong</p>
          <h1 className="font-display mb-3" style={{ fontSize: '1.8rem' }}>
            This page hit a snag
          </h1>
          <p className="text-soft mb-4">
            Sorry about that. Try heading back home — if it keeps happening, let us know what you were
            doing when it broke.
          </p>
          <button className="btn btn-primary" onClick={this.handleReload}>
            Back to home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}