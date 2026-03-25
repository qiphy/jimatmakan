import { useEffect, useRef, useState, useCallback } from "react";
import { X, MapPin, Search, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
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

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
}

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`
    );
    const data = await res.json();
    // Return detailed name: road + suburb/neighbourhood, or full display_name
    const addr = data.address || {};
    const parts = [
      addr.shop || addr.amenity || addr.building || addr.office || "",
      addr.road || addr.street || "",
      addr.suburb || addr.neighbourhood || addr.city_district || "",
      addr.city || addr.town || addr.village || "",
    ].filter(Boolean);
    return parts.slice(0, 3).join(", ") || data.display_name?.split(",").slice(0, 3).join(",") || "Selected location";
  } catch {
    return "Selected location";
  }
};

const searchPlaces = async (query: string): Promise<SearchResult[]> => {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1&countrycodes=my`
    );
    return await res.json();
  } catch {
    return [];
  }
};

const LocationPicker = ({ open, onClose, location, onLocationChange }: LocationPickerProps) => {
  const { t } = useLanguage();
  const [tempPos, setTempPos] = useState<[number, number]>([location.lat, location.lng]);
  const [resolving, setResolving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const searchTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setTempPos([location.lat, location.lng]);
      setSearchQuery("");
      setSearchResults([]);
      setSelectedName("");
    }
  }, [open, location.lat, location.lng]);

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setSelectedName("");
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (value.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    searchTimerRef.current = window.setTimeout(async () => {
      const results = await searchPlaces(value);
      setSearchResults(results);
      setSearching(false);
    }, 400);
  }, []);

  const selectSearchResult = useCallback((result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setTempPos([lat, lng]);
    setSelectedName(result.display_name.split(",").slice(0, 3).join(",").trim());
    setSearchResults([]);
    setSearchQuery(result.display_name.split(",").slice(0, 2).join(",").trim());

    // Pan map and move marker
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 17, { animate: true });
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
  }, []);

  useEffect(() => {
    if (!open || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, { zoomControl: true }).setView(
      [location.lat, location.lng],
      13
    );
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const marker = L.marker([location.lat, location.lng], {
      icon,
      draggable: true,
    }).addTo(map);
    markerRef.current = marker;

    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      setTempPos([e.latlng.lat, e.latlng.lng]);
      setSelectedName("");
    });

    marker.on("dragend", () => {
      const p = marker.getLatLng();
      setTempPos([p.lat, p.lng]);
      setSelectedName("");
    });

    const timer = window.setTimeout(() => map.invalidateSize(), 100);

    return () => {
      window.clearTimeout(timer);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [open, location.lat, location.lng]);

  if (!open) return null;

  const handleConfirm = async () => {
    setResolving(true);
    const name = selectedName || await reverseGeocode(tempPos[0], tempPos[1]);
    onLocationChange({ lat: tempPos[0], lng: tempPos[1], name });
    setResolving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center">
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

        {/* Search bar */}
        <div className="px-3 py-2 border-b border-border relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t("searchLocation")}
              className="pl-8 h-9 text-sm"
            />
            {searching && (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin" />
            )}
          </div>
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-10 mx-3 bg-card border border-border rounded-xl shadow-lg max-h-[200px] overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => selectSearchResult(result)}
                  className="w-full text-left px-3 py-2.5 hover:bg-secondary transition-colors border-b border-border last:border-b-0 flex items-start gap-2"
                >
                  <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span className="text-xs text-foreground leading-snug line-clamp-2">
                    {result.display_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={mapContainerRef} className="h-[300px] w-full" />

        <div className="p-4">
          {selectedName && (
            <p className="text-xs text-foreground font-medium mb-2 text-center truncate px-2">
              📍 {selectedName}
            </p>
          )}
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
