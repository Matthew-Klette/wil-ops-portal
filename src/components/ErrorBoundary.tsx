import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled error in app:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
          <h1 className="font-display text-2xl font-medium text-ink">Something went wrong</h1>
          <p className="max-w-sm text-sm text-slate-soft">
            The page hit an unexpected error and got stuck. Reloading will fix it — nothing you did was lost, it's
            all saved.
          </p>
          <pre className="max-w-full overflow-x-auto rounded-lg bg-fog-soft px-3 py-2 text-left font-mono text-xs text-slate">
            {this.state.error.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-signal/90"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
