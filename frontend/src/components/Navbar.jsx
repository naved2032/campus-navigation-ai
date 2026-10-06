import React from 'react';
import { 
  Navigation, 
  Layers, 
  Share2, 
  RotateCcw, 
  PlusCircle, 
  Compass, 
  Map, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';

export default function Navbar({
  backendOnline,
  mapStyle,
  setMapStyle,
  showNetworkGraph,
  setShowNetworkGraph,
  voiceEnabled,
  setVoiceEnabled,
  onOpenAddModal,
  onResetSeed,
  isResetting,
  sidebarOpen,
  setSidebarOpen,
  locationsCount = 0
}) {
  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Left branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition lg:hidden"
          title="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Compass className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                CampusNav AI
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Indore Engineering College - CampusNav AI
            </p>
          </div>
        </div>
      </div>

      {/* Middle & Right action controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Backend health status indicator */}
        <div 
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            backendOnline 
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' 
              : 'bg-rose-950/40 text-rose-400 border-rose-500/30 animate-pulse'
          }`}
          title={backendOnline ? 'Backend API connected on http://localhost:5000' : 'Backend connection failing. Check server!'}
        >
          {backendOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>API Live ({locationsCount} Nodes)</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Map style selector */}
        <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 text-xs">
          <button
            onClick={() => setMapStyle('dark')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              mapStyle === 'dark'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => setMapStyle('street')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              mapStyle === 'street'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Street
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`hidden sm:inline-block px-2.5 py-1 rounded-md font-medium transition ${
              mapStyle === 'satellite'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Toggle full campus graph overlay */}
        <button
          onClick={() => setShowNetworkGraph(!showNetworkGraph)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
            showNetworkGraph
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20'
              : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Toggle visibility of all walkable pathways across campus"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Path Grid</span>
        </button>

        {/* Voice Speech narration toggle */}
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`p-2 rounded-lg text-xs border transition ${
            voiceEnabled
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
              : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
          }`}
          title={voiceEnabled ? 'Voice Guidance Active' : 'Enable Voice Guidance'}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Add location button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/30 transition transform active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Add Node</span>
        </button>

        {/* Reset Database Seed */}
        <button
          onClick={onResetSeed}
          disabled={isResetting}
          className="p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 transition disabled:opacity-50"
          title="Reset Campus dataset to original state"
        >
          <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>
    </header>
  );
}
