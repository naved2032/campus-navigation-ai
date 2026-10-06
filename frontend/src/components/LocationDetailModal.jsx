import React from 'react';
import { X, Navigation, ArrowRight, Building, Layers, MapPin, Compass, Share2 } from 'lucide-react';
import { getCategoryMeta } from '../utils/categories';

export default function LocationDetailModal({
  location,
  onClose,
  onSetAsStart,
  onSetAsEnd
}) {
  if (!location) return null;

  const meta = getCategoryMeta(location.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Banner with Category Accent */}
        <div className="p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border-b border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${meta.color}`}>
              {location.category}
            </span>
            <span className="text-xs text-slate-400">
              ID #{location.id}
            </span>
          </div>

          <h2 className="text-lg font-bold text-white leading-tight">
            {location.name}
          </h2>
        </div>

        {/* Content Details */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Building</span>
              <span className="text-xs font-semibold text-white">{location.building}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Floor Level</span>
              <span className="text-xs font-semibold text-cyan-300">Floor {location.floor}</span>
            </div>
            <div className="space-y-0.5 col-span-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Coordinates</span>
              <span className="text-[11px] font-mono text-slate-400">
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">About this Facility</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {location.description || 'No detailed description recorded.'}
            </p>
          </div>

          {/* Connected Pathways if any */}
          {location.connectedLocations && location.connectedLocations.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Direct Walkways ({location.connectedLocations.length})
              </span>
              <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                {location.connectedLocations.map((conn) => (
                  <div key={`conn-loc-${conn.id}`} className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-between text-[11px]">
                    <span className="text-slate-200 truncate">{conn.name}</span>
                    <span className="text-indigo-400 font-semibold shrink-0">{conn.distance_meters}m</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                onSetAsStart(location);
                onClose();
              }}
              className="py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Navigation className="w-3.5 h-3.5" />
              Route From Here
            </button>
            <button
              onClick={() => {
                onSetAsEnd(location);
                onClose();
              }}
              className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              Route To Here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
