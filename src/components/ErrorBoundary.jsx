import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

// Keeps one broken section from taking down the rest of the app — each
// route in App.jsx gets its own boundary, so a crash on, say, Expenses
// can't white-screen Home, Itinerary, etc.
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Section crashed:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center gap-2 px-4 pt-10 text-center">
          <AlertTriangle className="h-8 w-8 text-sunrise-400" />
          <p className="font-display text-base font-semibold text-white">This section hit a snag</p>
          <p className="text-sm text-slate-400">
            Other pages aren't affected — pick another tab, or come back to this one from the nav.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
