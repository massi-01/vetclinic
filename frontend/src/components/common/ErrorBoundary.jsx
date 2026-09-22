import React from 'react';
import { ErrorPage } from '../../pages/ErrorPage';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('💥 [ErrorBoundary caught an error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          code="500"
          title="Errore Imprevisto dell'Applicazione"
          description="Si è verificata un'anomalia di rendering nel client. I dati clinici sul server non sono stati alterati. Puoi ripristinare l'applicazione cliccando il pulsante sottostante."
          technicalDetails={this.state.error?.stack || this.state.error?.message || 'Nessun dettaglio aggiuntivo'}
          onRetry={this.handleReset}
          onNavigateTab={() => {
            this.setState({ hasError: false, error: null, errorInfo: null });
            window.location.href = '/';
          }}
        />
      );
    }

    return this.props.children;
  }
}
