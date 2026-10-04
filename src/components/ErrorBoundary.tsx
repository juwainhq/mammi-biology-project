import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Keeps an unexpected editor rendering error from leaving the Pages document blank. */
export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Application render failed:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main role="alert" style={{ minHeight: '100vh', background: '#000000', color: '#FAFAFA', display: 'grid', placeContent: 'center', padding: 24, fontFamily: 'sans-serif' }}>
          <section style={{ maxWidth: 520 }}>
            <p style={{ color: '#F04444', letterSpacing: '0.12em', fontSize: 12 }}>HSC BIOLOGY QUESTION BUILDER</p>
            <h1 style={{ fontSize: 24 }}>Something went wrong while loading the editor.</h1>
            <p style={{ color: '#8C8C8C' }}>Your saved work has not been removed. Reload the application to try again.</p>
            <button onClick={() => window.location.reload()} style={{ background: '#F04444', color: '#000000', border: 0, padding: '12px 18px', cursor: 'pointer' }}>Reload application</button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}
