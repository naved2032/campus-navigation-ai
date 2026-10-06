import React, { useState, useEffect } from 'react';
import { X, PlusCircle, MapPin, Building, Layers, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { CATEGORIES } from '../utils/categories';

export default function AddLocationModal({
  isOpen,
  onClose,
  onSubmit,
  existingLocations = [],
  pickedCoords,
  onStartPickingCoords
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Labs');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState(1);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [description, setDescription] = useState('');
  const [connectToId, setConnectToId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // When pickedCoords updates from map click
  useEffect(() => {
    if (pickedCoords) {
      setLatitude(pickedCoords.lat.toFixed(6));
      setLongitude(pickedCoords.lng.toFixed(6));
    }
  }, [pickedCoords]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !building.trim() || !latitude || !longitude) {
      setErrorMsg('Please complete all required fields (Name, Building, Coordinates).');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        category,
        building: building.trim(),
        floor: Number(floor) || 1,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        description: description.trim(),
        connectToId: connectToId ? Number(connectToId) : null
      });

      // Reset and close
      setName('');
      setBuilding('');
      setFloor(1);
      setLatitude('');
      setLongitude('');
      setDescription('');
      setConnectToId('');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create campus location');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Add Campus Location Node</h3>
              <p className="text-[11px] text-slate-400">Admin entry for new building, lab, or point of interest</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Location Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Quantum Computing Center"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category & Floor */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.filter(c => c.id !== 'All').map(c => (
                  <option key={`opt-cat-${c.id}`} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Floor Level *</label>
              <input
                type="number"
                min="0"
                max="20"
                required
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Building */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Building / Block Name *</label>
            <input
              type="text"
              required
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              placeholder="e.g. North Tech Quad Wing C"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Coordinates (Lat, Long) with Pick on Map button */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">GPS Coordinates *</label>
              <button
                type="button"
                onClick={onStartPickingCoords}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" />
                Pick on Map
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Latitude (e.g. 37.4278)"
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Longitude (e.g. -122.1712)"
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Connect to Pathway Node */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Connect to Pathway Node</label>
            <select
              value={connectToId}
              onChange={(e) => setConnectToId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Auto-connect to nearest campus node</option>
              {existingLocations.map((loc) => (
                <option key={`conn-opt-${loc.id}`} value={loc.id}>
                  {loc.name} ({loc.building})
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Description</label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of rooms, facilities, or equipment available here..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
