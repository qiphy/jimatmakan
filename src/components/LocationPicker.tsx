import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { X, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DEFAULT_CENTER: [number, number] = [3.1390, 101.6869]; // Kuala Lumpur

interface LocationPickerProps {
  open: boolean;
  onClose: () => void;
  location: { lat: number; lng: number; name: string };
  onLocationChange: (loc: { lat: number; lng: number; name: string }) => void;
}

const DraggableMarker = ({
  position,
  onMove,
}: {
  position: [number, number];
  onMove: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });
  return <Marker position={position} icon={icon} />;
};

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14`
    );
    const data = await res.json();
    return (
      data.address?.suburb ||
      data.address?.city_district ||
      data.address?.city ||
      data.address?.town ||
      data.display_name?.split(",").slice(0, 2).join(",") ||
      "Selected location"
    );
  } catch {
    return "Selected location";
  }
};

const LocationPicker = ({ open, onClose, location, onLocationChange }: LocationPickerProps) => {
  const { t } = useLanguage();
  const [tempPos, setTempPos] = useState<[number, number]>([location.lat, location.lng]);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (open) setTempPos([location.lat, location.lng]);
  }, [open, location.lat, location.lng]);

  if (!open) return null;

  const handleConfirm = async () => {
    setResolving(true);
    const name = await reverseGeocode(tempPos[0], tempPos[1]);
    onLocationChange({ lat: tempPos[0], lng: tempPos[1], name });
    setResolving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="w-full max-w-lg bg-card border border-border rounded-t-2xl sm:rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" />
            {t("chooseLocation")}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="h-[350px] w-full">
          <MapContainer
            center={tempPos}
            zoom={13}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <DraggableMarker
              position={tempPos}
              onMove={(lat, lng) => setTempPos([lat, lng])}
            />
          </MapContainer>
        </div>
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-3 text-center">{t("tapToSelect")}</p>
          <button
            onClick={handleConfirm}
            disabled={resolving}
            className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {resolving ? "..." : t("confirmLocation")}
          </button>
        </div>
      </div>
    </div>
  );
};

export { DEFAULT_CENTER };
export default LocationPicker;
