import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Called once when the subtree crashes (e.g. to close the panel). */
  onError?(): void
  /** Changing this value re-mounts the subtree after a crash. */
  resetKey?: unknown
  /** Rendered instead of the crashed subtree (default: nothing). */
  fallback?: ReactNode
}

/**
 * Wraps Wyllet's own UI only (never your app's children): a bug inside Wyllet hides that piece
 * of UI and logs the error instead of unmounting the host dApp.
 */
export class SafeBoundary extends Component<Props, { failed: boolean }> {
  override state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  override componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('[wyllet] A Wyllet UI component crashed and was hidden to protect your app.', error, info.componentStack)
    this.props.onError?.()
  }

  override componentDidUpdate(prev: Props) {
    if (this.state.failed && prev.resetKey !== this.props.resetKey) this.setState({ failed: false })
  }

  override render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children
  }
}
