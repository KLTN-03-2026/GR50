import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Navigation } from 'lucide-react';

// Fix Leaflet's default icon path issues with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapBounds({ routeCoords }) {
  const map = useMap();
  useEffect(() => {
    if (routeCoords && routeCoords.length > 0) {
      const bounds = L.latLngBounds(routeCoords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routeCoords, map]);
  return null;
}

export default function MapDirections({ origin, destination, onBack, destinationName }) {
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        setLoading(true);
        // OSRM coordinates format: lon,lat
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        
        if (data.code === 'Ok' && data.routes.length > 0) {
          const route = data.routes[0];
          // OSRM returns coordinates as [lon, lat], Leaflet needs [lat, lon]
          const coords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRouteCoords(coords);
          
          setDistance((route.distance / 1000).toFixed(1)); // Convert to km
          setDuration(Math.round(route.duration / 60)); // Convert to minutes
        }
      } catch (error) {
        console.error("Error fetching directions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (origin && destination && origin.lat && origin.lng && destination.lat && destination.lng) {
      fetchRoute();
    }
  }, [origin, destination]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 absolute inset-0 z-50">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10 shadow-sm">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
            Chỉ đường đến {destinationName || 'Cơ sở y tế'}
          </h2>
          {distance && duration && (
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1"><Navigation className="w-3.5 h-3.5" /> {distance} km</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {duration} phút</span>
            </p>
          )}
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 relative z-0">
        {loading && (
          <div className="absolute inset-0 z-[1000] bg-white/50 dark:bg-gray-900/50 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Đang tìm tuyến đường...</p>
            </div>
          </div>
        )}
        
        {origin && origin.lat && destination && destination.lat && (
          <MapContainer 
            center={[origin.lat, origin.lng]} 
            zoom={13} 
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User Location */}
            <Marker position={[origin.lat, origin.lng]} icon={blueIcon}>
              <Popup>Vị trí của bạn</Popup>
            </Marker>

            {/* Destination */}
            <Marker position={[destination.lat, destination.lng]} icon={redIcon}>
              <Popup>{destinationName || 'Điểm đến'}</Popup>
            </Marker>

            {/* Route Polyline */}
            {routeCoords.length > 0 && (
              <>
                <Polyline positions={routeCoords} color="#0d9488" weight={5} opacity={0.8} />
                <MapBounds routeCoords={routeCoords} />
              </>
            )}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
