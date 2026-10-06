import React, { useEffect, useMemo } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  useMap, 
  useMapEvents 
} from 'react-leaflet';
import L from 'leaflet';
import { getCategoryMeta } from '../utils/categories';
import { 
  Navigation, 
  MapPin, 
  Compass, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

// Free standard OpenStreetMap tiles (No CARTO, No API Key Required)
const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Generate custom SVG icon for location marker
function createLocationIcon(location, isStart, isEnd, isSelected) {
  const meta = getCategoryMeta(location.category);
  const color = meta.pinColor || '#6366f1';

  if (isStart) {
    return L.divIcon({
      className: 'custom-start-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-2 bg-emerald-500 rounded-full opacity-60 animate-ping"></div>
          <div class="w-10 h-10 rounded-full bg-emerald-500 border-2 border-white shadow-xl flex items-center justify-center text-white font-extrabold text-sm shadow-emerald-500/50 transform hover:scale-110 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <span class="absolute -bottom-5 px-1.5 py-0.5 bg-slate-900/90 text-emerald-300 text-[10px] font-bold rounded border border-emerald-500/40 shadow whitespace-nowrap">
            START
          </span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -22]
    });
  }

  if (isEnd) {
    return L.divIcon({
      className: 'custom-end-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-2 bg-rose-500 rounded-full opacity-60 animate-ping"></div>
          <div class="w-10 h-10 rounded-full bg-rose-500 border-2 border-white shadow-xl flex items-center justify-center text-white font-extrabold text-sm shadow-rose-500/50 transform hover:scale-110 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <span class="absolute -bottom-5 px-1.5 py-0.5 bg-slate-900/90 text-rose-300 text-[10px] font-bold rounded border border-rose-500/40 shadow whitespace-nowrap">
            DESTINATION
          </span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -22]
    });
  }

  // Normal category marker pin with prominent badge initials
  const isHighlighted = isSelected;
  const isCSE = location.name.startsWith('CSE') || location.name.includes('AI & Robotics');
  const size = isHighlighted || isCSE ? 36 : 30;

  return L.divIcon({
    className: 'custom-category-marker',
    html: `
      <div class="relative group cursor-pointer">
        <div class="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold shadow-lg transition-all duration-200 transform group-hover:scale-110 group-hover:-translate-y-1 ${
          isHighlighted ? 'ring-2 ring-white scale-110 -translate-y-1' : ''
        } ${isCSE ? 'ring-1 ring-cyan-300 shadow-cyan-500/50' : ''}" style="background-color: ${color}; box-shadow: 0 4px 14px ${color}66;">
          <span class="text-xs font-black tracking-tight">${isCSE ? (location.name.includes('1') ? 'C1' : location.name.includes('2') ? 'C2' : location.name.includes('3') ? 'C3' : location.name.includes('AI') ? 'AI' : 'CS') : location.name.charAt(0)}</span>
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45" style="background-color: ${color};"></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
}

// Helper component to auto-pan and fit bounds when route or selection changes
function MapViewController({ center, zoom, bounds, selectedLocation }) {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 18,
        animate: true,
        duration: 0.8
      });
    } else if (selectedLocation) {
      map.flyTo([selectedLocation.latitude, selectedLocation.longitude], 18, {
        animate: true,
        duration: 0.7
      });
    } else if (center) {
      map.flyTo(center, zoom || 17, { animate: true });
    }
  }, [bounds, selectedLocation, center, zoom, map]);

  return null;
}

// Helper component to listen for click events when picking coordinates
function MapClickHandler({ isPickingLocation, onCoordinatePicked }) {
  useMapEvents({
    click(e) {
      if (isPickingLocation && onCoordinatePicked) {
        onCoordinatePicked(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

export default function CampusMap({
  locations = [],
  startLocation,
  endLocation,
  routeResult,
  selectedLocation,
  onSelectLocation,
  onSetAsStart,
  onSetAsEnd,
  onOpenDetail,
  mapStyle = 'dark',
  showNetworkGraph = false,
  allEdges = [],
  isPickingLocation = false,
  pickedCoords = null,
  onCoordinatePicked
}) {
  const campusCenter = [22.7254, 75.8722];

  // Calculate route bounding box if route is computed
  const routeBounds = useMemo(() => {
    if (routeResult && routeResult.coordinates && routeResult.coordinates.length > 1) {
      return L.latLngBounds(routeResult.coordinates);
    }
    return null;
  }, [routeResult]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      {/* Map coordinate picker banner overlay */}
      {isPickingLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-indigo-600/95 text-white px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md border border-indigo-400/50 flex items-center gap-3 animate-bounce">
          <MapPin className="w-4 h-4 text-cyan-300" />
          <span className="text-xs md:text-sm font-semibold">
            Click anywhere on the map to pin coordinates for your new campus location!
          </span>
        </div>
      )}

      <MapContainer
        center={campusCenter}
        zoom={17.5}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={false}
      >
        {/* Free Standard OpenStreetMap TileLayer (Zero API keys, zero watermarks) */}
        <TileLayer
          attribution={OSM_ATTRIBUTION}
          url={OSM_TILE_URL}
          className={mapStyle === 'dark' ? 'dark-tiles' : 'clean-tiles'}
          maxZoom={19}
        />

        <MapViewController
          center={campusCenter}
          zoom={17.5}
          bounds={routeBounds}
          selectedLocation={selectedLocation}
        />

        <MapClickHandler
          isPickingLocation={isPickingLocation}
          onCoordinatePicked={onCoordinatePicked}
        />

        {/* Full Campus Pathway Network Graph (if toggled) */}
        {showNetworkGraph && allEdges.map((edge) => (
          <Polyline
            key={`network-edge-${edge.id}`}
            positions={[
              [edge.from_lat, edge.from_lng],
              [edge.to_lat, edge.to_lng]
            ]}
            pathOptions={{
              color: '#38bdf8',
              weight: 2,
              opacity: 0.45,
              dashArray: '4, 8'
            }}
          />
        ))}

        {/* Shortest Path Calculated Route Line (Glow effect + Main Line) */}
        {routeResult && routeResult.coordinates && routeResult.coordinates.length > 0 && (
          <>
            {/* Outer soft glow line */}
            <Polyline
              positions={routeResult.coordinates}
              pathOptions={{
                color: '#6366f1',
                weight: 9,
                opacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            {/* Inner vibrant route line */}
            <Polyline
              positions={routeResult.coordinates}
              pathOptions={{
                color: '#4f46e5',
                weight: 5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            {/* Animated dashed overlay on route */}
            <Polyline
              positions={routeResult.coordinates}
              pathOptions={{
                color: '#38bdf8',
                weight: 3,
                opacity: 0.9,
                dashArray: '6, 12',
                lineCap: 'round'
              }}
            />
          </>
        )}

        {/* Render Location Markers */}
        {locations.map((loc) => {
          const isStart = startLocation && startLocation.id === loc.id;
          const isEnd = endLocation && endLocation.id === loc.id;
          const isSelected = selectedLocation && selectedLocation.id === loc.id;
          const icon = createLocationIcon(loc, isStart, isEnd, isSelected);
          const meta = getCategoryMeta(loc.category);

          return (
            <Marker
              key={`loc-marker-${loc.id}`}
              position={[loc.latitude, loc.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectLocation && onSelectLocation(loc)
              }}
            >
              <Popup className="custom-leaflet-popup" minWidth={260} maxWidth={320}>
                <div className="p-4 bg-slate-900 text-slate-100 rounded-xl">
                  {/* Category Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.color}`}>
                      {loc.category}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      Floor {loc.floor} &bull; {loc.building}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm text-white leading-tight mb-1.5">
                    {loc.name}
                  </h3>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-2">
                    {loc.description || 'College campus facility.'}
                  </p>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => onSetAsStart && onSetAsStart(loc)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                    >
                      <Navigation className="w-3 h-3" />
                      From Here
                    </button>
                    <button
                      onClick={() => onSetAsEnd && onSetAsEnd(loc)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1 shadow-md shadow-indigo-600/30 transition"
                    >
                      <ArrowRight className="w-3 h-3" />
                      Navigate Here
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Temporary marker when picking coordinates */}
        {pickedCoords && (
          <Marker
            position={[pickedCoords.lat, pickedCoords.lng]}
            icon={L.divIcon({
              className: 'picked-pin',
              html: `
                <div class="relative flex items-center justify-center">
                  <div class="w-8 h-8 rounded-full bg-cyan-500 border-2 border-white shadow-lg animate-bounce flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M2 12h20"/></svg>
                  </div>
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            })}
          />
        )}
      </MapContainer>

      {/* Floating Map Controls overlay */}
      <div className="absolute top-4 right-4 z-[900] flex flex-col gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-xl p-1 border border-slate-800 shadow-xl flex flex-col gap-1">
          <button
            onClick={() => onSelectLocation && onSelectLocation(null)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Reset Campus View"
          >
            <Compass className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-[900] hidden lg:block bg-slate-900/85 backdrop-blur-md p-3 rounded-xl border border-slate-800/80 shadow-2xl text-[11px]">
        <div className="font-bold text-slate-200 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Campus Map Legend
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Labs (AI, ECE, Physics)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span>CSE Department</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Admin & Offices</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Classrooms (CSE 1, 2, 3)</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span>Library, Canteen, Hostels</span>
          </div>
        </div>
      </div>
    </div>
  );
}
