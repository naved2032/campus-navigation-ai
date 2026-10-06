import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CampusMap from './components/CampusMap';
import AddLocationModal from './components/AddLocationModal';
import LocationDetailModal from './components/LocationDetailModal';
import { 
  fetchLocations, 
  calculateRoute, 
  fetchAllEdges, 
  createLocation, 
  resetDatabaseSeed, 
  checkBackendHealth 
} from './api';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export default function App() {
  // Application State
  const [locations, setLocations] = useState([]);
  const [allEdges, setAllEdges] = useState([]);
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [routeResult, setRouteResult] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  
  // Selection and Modal State
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [detailLocation, setDetailLocation] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pickedCoords, setPickedCoords] = useState(null);
  
  // Filters & Map Settings
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFloor, setSelectedFloor] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapStyle, setMapStyle] = useState('dark');
  const [showNetworkGraph, setShowNetworkGraph] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // System State
  const [backendOnline, setBackendOnline] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [toast, setToast] = useState(null);

  // Helper Toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load campus locations and edges
  const loadData = useCallback(async () => {
    try {
      const isOnline = await checkBackendHealth();
      setBackendOnline(isOnline);

      const [locRes, edgeRes] = await Promise.all([
        fetchLocations(),
        fetchAllEdges()
      ]);

      if (locRes.success) {
        setLocations(locRes.data);
      }
      if (edgeRes.success) {
        setAllEdges(edgeRes.data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setBackendOnline(false);
      showToast('Backend offline. Please ensure server is running on port 5000.', 'error');
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // Polling health check
    return () => clearInterval(interval);
  }, [loadData]);

  // Compute Dijkstra Shortest Route
  const handleCalculateRoute = async (sId, eId) => {
    const startId = sId || startLocation?.id;
    const endId = eId || endLocation?.id;

    if (!startId || !endId) {
      showToast('Please select both Origin and Destination locations.', 'warning');
      return;
    }

    try {
      setIsLoadingRoute(true);
      const res = await calculateRoute(startId, endId);
      if (res.success) {
        setRouteResult(res.data);
        showToast(`Route found: ${res.data.totalDistanceMeters}m (~${res.data.estimatedWalkingMinutes} min walk)`, 'success');
      }
    } catch (err) {
      console.error('Route calculation error:', err);
      showToast(err.message || 'No direct pathway route found.', 'error');
      setRouteResult(null);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Clear current route
  const handleClearRoute = () => {
    setRouteResult(null);
    setStartLocation(null);
    setEndLocation(null);
    setSelectedLocation(null);
    showToast('Route cleared.');
  };

  // Location selection on map / list
  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
  };

  // Fast Set as Start
  const handleSetAsStart = (loc) => {
    setStartLocation(loc);
    setSelectedLocation(loc);
    if (endLocation) {
      handleCalculateRoute(loc.id, endLocation.id);
    }
  };

  // Fast Set as End
  const handleSetAsEnd = (loc) => {
    setEndLocation(loc);
    setSelectedLocation(loc);
    if (startLocation) {
      handleCalculateRoute(startLocation.id, loc.id);
    }
  };

  // Reset demo dataset
  const handleResetSeed = async () => {
    try {
      setIsResetting(true);
      await resetDatabaseSeed();
      await loadData();
      handleClearRoute();
      showToast('Campus dataset reset to default successfully!', 'success');
    } catch (err) {
      showToast('Failed to reset dataset.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // Handle Add New Location
  const handleCreateLocation = async (formData) => {
    const res = await createLocation(formData);
    if (res.success) {
      await loadData();
      setIsPickingLocation(false);
      setPickedCoords(null);
      showToast(`Added '${formData.name}' and connected to graph!`, 'success');
    }
  };

  // Start picking coordinates on map
  const handleStartPickingCoords = () => {
    setIsPickingLocation(true);
    showToast('Click anywhere on the map to set coordinate pin.', 'info');
  };

  // When user clicks map to pick coordinates
  const handleCoordinatePicked = (lat, lng) => {
    setPickedCoords({ lat, lng });
    setIsPickingLocation(false);
    setIsAddModalOpen(true);
    showToast(`Coordinates selected: ${lat.toFixed(5)}, ${lng.toFixed(5)}`, 'success');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* Top Navbar */}
      <Navbar
        backendOnline={backendOnline}
        mapStyle={mapStyle}
        setMapStyle={setMapStyle}
        showNetworkGraph={showNetworkGraph}
        setShowNetworkGraph={setShowNetworkGraph}
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onResetSeed={handleResetSeed}
        isResetting={isResetting}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        locationsCount={locations.length}
      />

      {/* Main Workspace (Sidebar + Map Pane) */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Interactive Sidebar */}
        <Sidebar
          locations={locations}
          startLocation={startLocation}
          setStartLocation={setStartLocation}
          endLocation={endLocation}
          setEndLocation={setEndLocation}
          routeResult={routeResult}
          isLoadingRoute={isLoadingRoute}
          onCalculateRoute={handleCalculateRoute}
          onClearRoute={handleClearRoute}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedFloor={selectedFloor}
          setSelectedFloor={setSelectedFloor}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectLocation={handleSelectLocation}
          onOpenDetail={(loc) => setDetailLocation(loc)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          voiceEnabled={voiceEnabled}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        {/* Center & Right Map Pane */}
        <main className="flex-1 h-full relative">
          <CampusMap
            locations={locations}
            startLocation={startLocation}
            endLocation={endLocation}
            routeResult={routeResult}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            onSetAsStart={handleSetAsStart}
            onSetAsEnd={handleSetAsEnd}
            onOpenDetail={(loc) => setDetailLocation(loc)}
            mapStyle={mapStyle}
            showNetworkGraph={showNetworkGraph}
            allEdges={allEdges}
            isPickingLocation={isPickingLocation}
            pickedCoords={pickedCoords}
            onCoordinatePicked={handleCoordinatePicked}
          />
        </main>
      </div>

      {/* Toast Alert Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] animate-bounce">
          <div className={`px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md border text-xs font-semibold flex items-center gap-2 ${
            toast.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/50'
              : toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
              : 'bg-indigo-950/90 text-indigo-200 border-indigo-500/50'
          }`}>
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-400" />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-1 opacity-70 hover:opacity-100">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateLocation}
        existingLocations={locations}
        pickedCoords={pickedCoords}
        onStartPickingCoords={handleStartPickingCoords}
      />

      {/* Single Location Detail Drawer/Modal */}
      <LocationDetailModal
        location={detailLocation}
        onClose={() => setDetailLocation(null)}
        onSetAsStart={handleSetAsStart}
        onSetAsEnd={handleSetAsEnd}
      />
    </div>
  );
}
