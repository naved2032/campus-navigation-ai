import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  Search, 
  ArrowUpDown, 
  Footprints, 
  Clock, 
  Layers, 
  Volume2, 
  VolumeX, 
  X, 
  ChevronRight, 
  Building2, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Compass,
  CornerDownRight,
  CheckCircle2,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { CATEGORIES, getCategoryMeta } from '../utils/categories';
import { speakInstructions, stopSpeech } from '../utils/speech';

export default function Sidebar({
  locations = [],
  startLocation,
  setStartLocation,
  endLocation,
  setEndLocation,
  routeResult,
  isLoadingRoute,
  onCalculateRoute,
  onClearRoute,
  selectedCategory,
  setSelectedCategory,
  selectedFloor,
  setSelectedFloor,
  searchQuery,
  setSearchQuery,
  onSelectLocation,
  onOpenDetail,
  onOpenAddModal,
  voiceEnabled,
  isOpen,
  setIsOpen
}) {
  const [activeTab, setActiveTab] = useState('navigate'); // 'navigate' | 'directory'
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(null);

  // Handle voice readout of turn-by-turn directions
  const handleToggleVoicePlayback = () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
    } else if (routeResult && routeResult.steps) {
      const fullText = routeResult.steps
        .map(s => `${s.stepNumber}. ${s.instruction} ${s.additionalNote || ''}`)
        .join('. Next, ');
      
      speakInstructions(`Starting navigation to ${endLocation?.name}. ${fullText}`);
      setIsPlayingAudio(true);
    }
  };

  // Swap start and destination
  const handleSwapLocations = () => {
    const temp = startLocation;
    setStartLocation(endLocation);
    setEndLocation(temp);
    if (temp && endLocation) {
      onCalculateRoute(endLocation.id, temp.id);
    }
  };

  // Filtered directory list
  const filteredLocations = locations.filter((loc) => {
    const matchesCategory = selectedCategory === 'All' || loc.category === selectedCategory;
    const matchesFloor = selectedFloor === 'All' || String(loc.floor) === String(selectedFloor);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      loc.name.toLowerCase().includes(q) || 
      loc.building.toLowerCase().includes(q) || 
      (loc.description && loc.description.toLowerCase().includes(q));

    return matchesCategory && matchesFloor && matchesSearch;
  });

  return (
    <aside 
      className={`fixed lg:static top-16 bottom-0 left-0 z-20 w-full sm:w-[420px] lg:w-[440px] bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Tab Switcher */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/40 shrink-0">
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('navigate')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition ${
              activeTab === 'navigate'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            Route Planner
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition ${
              activeTab === 'directory'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Directory ({locations.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {activeTab === 'navigate' ? (
          /* ========================================================================= */
          /* ROUTE PLANNER TAB                                                         */
          /* ========================================================================= */
          <div className="space-y-4">
            {/* Input Selection Box */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70 shadow-lg space-y-3 relative">
              {/* Swap Button in Middle */}
              <button
                onClick={handleSwapLocations}
                disabled={!startLocation && !endLocation}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-700 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-600 hover:border-indigo-400 flex items-center justify-center transition shadow-md disabled:opacity-40 disabled:pointer-events-none z-10"
                title="Swap Start & Destination"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>

              {/* Start Location Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Start Location (Origin)
                </label>
                <div className="relative pr-10">
                  <select
                    value={startLocation ? startLocation.id : ''}
                    onChange={(e) => {
                      const found = locations.find(l => String(l.id) === e.target.value);
                      setStartLocation(found || null);
                      if (found && endLocation) {
                        onCalculateRoute(found.id, endLocation.id);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition cursor-pointer appearance-none"
                  >
                    <option value="">Select departure point or click pin...</option>
                    {locations.map((loc) => (
                      <option key={`start-opt-${loc.id}`} value={loc.id}>
                        {loc.name} ({loc.building} &bull; F{loc.floor})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Destination Location Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                  Destination (Target)
                </label>
                <div className="relative pr-10">
                  <select
                    value={endLocation ? endLocation.id : ''}
                    onChange={(e) => {
                      const found = locations.find(l => String(l.id) === e.target.value);
                      setEndLocation(found || null);
                      if (startLocation && found) {
                        onCalculateRoute(startLocation.id, found.id);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition cursor-pointer appearance-none"
                  >
                    <option value="">Select destination point or click pin...</option>
                    {locations.map((loc) => (
                      <option key={`end-opt-${loc.id}`} value={loc.id}>
                        {loc.name} ({loc.building} &bull; F{loc.floor})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Trigger Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    if (startLocation && endLocation) {
                      onCalculateRoute(startLocation.id, endLocation.id);
                    }
                  }}
                  disabled={!startLocation || !endLocation || isLoadingRoute}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]"
                >
                  {isLoadingRoute ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Find Shortest Route
                    </>
                  )}
                </button>

                {(startLocation || endLocation || routeResult) && (
                  <button
                    onClick={onClearRoute}
                    className="p-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 transition"
                    title="Clear Route & Selections"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Demo Routes Preset Chips */}
            {!routeResult && (
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-indigo-400" />
                  Popular Campus Routes
                </div>
                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  <button
                    onClick={() => {
                      const mainGate = locations.find(l => l.name.includes('Main Gate'));
                      const cs1 = locations.find(l => l.name.includes('CS 1'));
                      if (mainGate && cs1) {
                        setStartLocation(mainGate);
                        setEndLocation(cs1);
                        onCalculateRoute(mainGate.id, cs1.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-left text-slate-200 border border-slate-700/60 flex items-center justify-between group transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span className="truncate font-medium">Main Gate &rarr; CS 1 Classroom</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition" />
                  </button>

                  <button
                    onClick={() => {
                      const cs1 = locations.find(l => l.name.includes('CS 1'));
                      const canteen = locations.find(l => l.name.includes('Canteen'));
                      if (cs1 && canteen) {
                        setStartLocation(cs1);
                        setEndLocation(canteen);
                        onCalculateRoute(cs1.id, canteen.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-left text-slate-200 border border-slate-700/60 flex items-center justify-between group transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span className="truncate font-medium">CS 1 Classroom &rarr; College Canteen</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 transition" />
                  </button>

                  <button
                    onClick={() => {
                      const cs2 = locations.find(l => l.name.includes('CS 2'));
                      const aiLab = locations.find(l => l.name.includes('AI & Data Science'));
                      if (cs2 && aiLab) {
                        setStartLocation(cs2);
                        setEndLocation(aiLab);
                        onCalculateRoute(cs2.id, aiLab.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-left text-slate-200 border border-slate-700/60 flex items-center justify-between group transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      <span className="truncate font-medium">CS 2 Classroom &rarr; AI & Data Science Lab</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
                  </button>

                  <button
                    onClick={() => {
                      const lib = locations.find(l => l.name.includes('Library'));
                      const cs3 = locations.find(l => l.name.includes('CS 3'));
                      if (lib && cs3) {
                        setStartLocation(lib);
                        setEndLocation(cs3);
                        onCalculateRoute(lib.id, cs3.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-left text-slate-200 border border-slate-700/60 flex items-center justify-between group transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                      <span className="truncate font-medium">Central Library &rarr; CS 3 Classroom</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition" />
                  </button>

                  <button
                    onClick={() => {
                      const admin = locations.find(l => l.name.includes('Admin Block'));
                      const audi = locations.find(l => l.name.includes('Auditorium'));
                      if (admin && audi) {
                        setStartLocation(admin);
                        setEndLocation(audi);
                        onCalculateRoute(admin.id, audi.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-left text-slate-200 border border-slate-700/60 flex items-center justify-between group transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span className="truncate font-medium">Admin Block &rarr; Auditorium</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
                  </button>
                </div>
              </div>
            )}

            {/* Calculated Route Results & Turn-by-Turn Card List */}
            {routeResult && routeResult.found && (
              <div className="space-y-3 animate-fadeIn">
                {/* Metric Summary Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/40 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                        <Footprints className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                          Dijkstra Shortest Path
                        </span>
                        <div className="text-base font-extrabold text-white">
                          {routeResult.totalDistanceMeters} meters
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block font-medium">Est. Walk</span>
                        <span className="text-sm font-bold text-emerald-400">
                          ~{routeResult.estimatedWalkingMinutes} min
                        </span>
                      </div>
                      <button
                        onClick={handleToggleVoicePlayback}
                        className={`p-2 rounded-xl border transition ${
                          isPlayingAudio
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                            : 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/30'
                        }`}
                        title={isPlayingAudio ? 'Stop audio' : 'Read turn-by-turn guidance aloud'}
                      >
                        {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Summary badges */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">
                      {routeResult.steps.length} Steps
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">
                      {routeResult.path.length} Waypoints
                    </span>
                    {routeResult.steps.some(s => s.floorChange) && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Floor Change Required
                      </span>
                    )}
                  </div>
                </div>

                {/* Step-by-Step Guidance List */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1 flex items-center justify-between">
                    <span>Navigation Instructions</span>
                    <span className="text-[10px] text-slate-400 lowercase">click step to inspect</span>
                  </div>

                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {routeResult.steps.map((step, idx) => {
                      const isActive = activeStepIndex === idx;
                      const isDepart = step.type === 'depart';
                      const isArrive = step.type === 'arrive';
                      const isStairs = step.type.includes('stairs');

                      return (
                        <div
                          key={`step-${idx}`}
                          onClick={() => {
                            setActiveStepIndex(idx);
                            onSelectLocation(step.toLocation);
                          }}
                          className={`p-3 rounded-xl border transition cursor-pointer ${
                            isActive
                              ? 'bg-indigo-900/40 border-indigo-400/80 ring-1 ring-indigo-400'
                              : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Step number / icon pill */}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                              isDepart 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : isArrive
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                : isStairs
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-slate-700 text-slate-300 border border-slate-600'
                            }`}>
                              {idx + 1}
                            </div>

                            {/* Instruction details */}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-200 font-medium leading-snug">
                                {step.instruction}
                              </p>

                              {/* Floor change alert note */}
                              {step.additionalNote && (
                                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                                  <Layers className="w-3 h-3" />
                                  <span>{step.additionalNote}</span>
                                </div>
                              )}

                              {/* Distance footer */}
                              {step.distanceMeters > 0 && (
                                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                                  <span>{step.distanceMeters}m segment</span>
                                  &bull;
                                  <span>Floor {step.toLocation.floor}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* CAMPUS DIRECTORY TAB                                                      */
          /* ========================================================================= */
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search labs, offices, classrooms..."
                className="w-full pl-9 pr-8 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Quick Filter Chips */}
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={`cat-btn-${cat.id}`}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700/80'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Floor Filter Chips */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
              <span className="font-semibold text-[11px] text-slate-400">Floor:</span>
              {['All', '1', '2', '3'].map((fl) => (
                <button
                  key={`floor-btn-${fl}`}
                  onClick={() => setSelectedFloor(fl)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium border transition ${
                    selectedFloor === fl
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {fl === 'All' ? 'All' : `F${fl}`}
                </button>
              ))}
            </div>

            {/* Locations Directory List */}
            <div className="space-y-2 pt-1 max-h-[500px] overflow-y-auto pr-1">
              {filteredLocations.length === 0 ? (
                <div className="p-8 text-center bg-slate-800/30 rounded-2xl border border-slate-800 text-slate-400">
                  <Search className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p className="text-xs font-semibold">No campus points matched your filter.</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedFloor('All');
                      setSearchQuery('');
                    }}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600/30 text-indigo-300 text-xs font-semibold hover:bg-indigo-600/50"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredLocations.map((loc) => {
                  const meta = getCategoryMeta(loc.category);
                  const isSelected = startLocation?.id === loc.id || endLocation?.id === loc.id;

                  return (
                    <div
                      key={`dir-item-${loc.id}`}
                      className={`p-3.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border transition group ${
                        isSelected ? 'border-indigo-500/80 bg-indigo-950/20' : 'border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.color}`}>
                          {loc.category}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {loc.building} &bull; Floor {loc.floor}
                        </span>
                      </div>

                      <h4 
                        onClick={() => onSelectLocation(loc)}
                        className="font-bold text-sm text-white group-hover:text-indigo-300 transition cursor-pointer mb-1"
                      >
                        {loc.name}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {loc.description || 'Standard university campus facility.'}
                      </p>

                      {/* Card Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/50">
                        <button
                          onClick={() => {
                            setStartLocation(loc);
                            setActiveTab('navigate');
                            if (endLocation) {
                              onCalculateRoute(loc.id, endLocation.id);
                            }
                          }}
                          className="py-1.5 px-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                        >
                          <Navigation className="w-3 h-3" />
                          Set Origin
                        </button>
                        <button
                          onClick={() => {
                            setEndLocation(loc);
                            setActiveTab('navigate');
                            if (startLocation) {
                              onCalculateRoute(startLocation.id, loc.id);
                            }
                          }}
                          className="py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1 shadow-sm transition"
                        >
                          <ArrowRight className="w-3 h-3" />
                          Set Target
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          Dijkstra Shortest Path Engine
        </span>
        <button
          onClick={onOpenAddModal}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Node
        </button>
      </div>
    </aside>
  );
}
