import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { divIcon, type LatLng } from 'leaflet';
import { MapPin } from 'lucide-react';

const BENGALURU: LatLng = { lat: 12.9716, lng: 77.5946 } as LatLng;

function pinIcon(color: string) {
  return divIcon({
    className: 'map-pin-marker',
    html: `<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 26 16 26s16-15 16-26C32 7.2 24.8 0 16 0z" fill="${color}"/><circle cx="16" cy="16" r="6" fill="white"/></svg>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
}

interface LocationPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const center = useMemo<LatLng>(
    () => (lat != null && lng != null ? ({ lat, lng } as LatLng) : BENGALURU),
    [lat, lng]
  );

  return (
    <div className="relative">
      <MapContainer
        center={center}
        zoom={lat != null ? 14 : 11}
        scrollWheelZoom={false}
        className="h-72 w-full rounded-xl z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onChange} />
        {lat != null && lng != null && (
          <Marker position={{ lat, lng } as LatLng} icon={pinIcon('#059669')} />
        )}
      </MapContainer>
      <div className="mt-2 flex items-start gap-2 text-xs text-gray-500">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
        {lat != null && lng != null ? (
          <span>
            Selected pickup point: <strong>{lat.toFixed(5)}, {lng.toFixed(5)}</strong>. Drag/zoom the
            map or click anywhere to re-select.
          </span>
        ) : (
          <span>Click on the map to drop your pickup pin. Approximate addresses are fine.</span>
        )}
      </div>
    </div>
  );
}

export { pinIcon };
