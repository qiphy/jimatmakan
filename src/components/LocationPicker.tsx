import { useEffect, useRef, useState } from "react";
import { X, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const icon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DEFAULT_CENTER: [number, number] = [3.139, 101.6869]; // Kuala Lumpur

interface LocationPickerProps {
  open: boolean;
  onClose: () => void;
  location: { lat: number; lng: number; name: string };
  onLocationChange: (loc: { lat: number; lng: number; name: string }) => void;
}

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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) setTempPos([location.lat, location.lng]);
  }, [open, location.lat, location.lng]);

  useEffect(() => {
    if (!open || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, { zoomControl: true }).setView(
      [location.lat, location.lng],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const marker = L.marker([location.lat, location.lng], {
      icon,
      draggable: true,
    }).addTo(map);

    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      setTempPos([e.latlng.lat, e.latlng.lng]);
    });

    marker.on("dragend", () => {
      const p = marker.getLatLng();
      setTempPos([p.lat, p.lng]);
    });

    const timer = window.setTimeout(() => map.invalidateSize(), 100);

    return () => {
      window.clearTimeout(timer);
      map.remove();
    };
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

        <div ref={mapContainerRef} className="h-[350px] w-full" />

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
