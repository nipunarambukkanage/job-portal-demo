import { Component, ReactNode } from 'react';
import ErrorFallback from './ErrorFallback';

export class ErrorBoundary extends Component<{children:ReactNode}, {hasError:boolean}> {
  constructor(props:any){ super(props); this.state={hasError:false}; }
  static getDerivedStateFromError(){ return { hasError:true }; }
  componentDidCatch(e:any){ console.error(e); }
  render(){ return this.state.hasError ? <ErrorFallback /> : this.props.children; }
}
export default ErrorBoundary;
