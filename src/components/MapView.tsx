import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { pinIcon } from './LocationPicker';
import type { Donation, Ngo } from '@/lib/types';
import { STATUS_STYLES } from '@/lib/types';

interface Props {
  donations: Donation[];
  ngos: Ngo[];
  height?: string;
}

export default function MapView({ donations, ngos, height = 'h-[420px]' }: Props) {
  const withCoords = donations.filter(
    (d) => Number.isFinite(d.lat) && Number.isFinite(d.lng)
  );
  const center =
    withCoords.length > 0
      ? ({ lat: withCoords[0].lat, lng: withCoords[0].lng } as { lat: number; lng: number })
      : { lat: 12.9716, lng: 77.5946 };

  return (
    <MapContainer
      center={center as never}
      zoom={11}
      scrollWheelZoom={false}
      className={`w-full rounded-2xl z-0 ${height}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {withCoords.map((d) => (
        <Marker
          key={`donation-${d.id}`}
          position={{ lat: d.lat, lng: d.lng } as never}
          icon={pinIcon('#059669')}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{d.food_name}</p>
              <p>
                {d.quantity} {d.unit} · {STATUS_STYLES[d.status].label}
              </p>
              <p className="text-gray-500">{d.pickup_address}</p>
              <a
                className="mt-1 inline-block font-semibold text-emerald-700"
                href={`https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lng}`}
                target="_blank"
                rel="noreferrer"
              >
                Get route guidance →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
      {ngos
        .filter((n) => n.lat != null && n.lng != null)
        .map((n) => (
          <Marker
            key={`ngo-${n.id}`}
            position={{ lat: n.lat as number, lng: n.lng as number } as never}
            icon={divIcon({
              className: 'map-pin-marker',
              html: `<div style="width:30px;height:30px;border-radius:50%;background:#f97316;border:3px solid white;display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.3)"><svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-7-4.5-7-10a7 7 0 1 1 14 0c0 5.5-7 10-7 10z" fill="none" stroke="white" stroke-width="2"/></svg></div>`,
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            })}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{n.org_name}</p>
                <p className="text-gray-500">{n.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
