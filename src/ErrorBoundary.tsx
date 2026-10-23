import React from 'react';
import { SAVE_KEY } from './engine/saveManager';

// If anything in the UI ever throws, show a friendly recovery screen instead of a blank page. "Try again" re-renders the
// game from the autosave; "Reset saved game" clears only the match save (stars, envelopes and perks are never touched).
interface State { failed: boolean }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Game error caught by ErrorBoundary', error);
  }

  private retry = () => this.setState({ failed: false });

  private reset = () => {
    try { localStorage.removeItem(SAVE_KEY); } catch { /* storage unavailable */ }
    window.location.reload();
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#F4F1EA] text-[#1A1A1A] p-6 font-serif">
        <div className="w-full max-w-[320px] border-4 border-[#1A1A1A] bg-white shadow-[8px_8px_0px_#1A1A1A] rounded-xl p-5 text-center">
          <div className="inline-block -rotate-2 border-4 border-[#8B0000] text-[#8B0000] font-black tracking-widest px-3 py-1 mb-3">OOPS</div>
          <h1 className="font-black text-xl uppercase leading-tight mb-2">The gist slipped</h1>
          <p className="text-xs font-sans text-slate-700 leading-relaxed mb-4">
            Something unexpected happened. Your stars, envelopes and perks are safe. Try again, or reset just the current case.
          </p>
          <div className="flex flex-col gap-2">
            <button onClick={this.retry} className="py-3 font-black text-xs uppercase tracking-widest bg-[#1A1A1A] text-white border-2 border-[#1A1A1A] rounded-lg cursor-pointer">Try again</button>
            <button onClick={this.reset} className="py-3 font-black text-xs uppercase tracking-widest bg-white border-2 border-[#1A1A1A] rounded-lg cursor-pointer">Reset saved game</button>
          </div>
        </div>
      </div>
    );
  }
}
