import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./LocationMap.css";

// Fix for default marker issue
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const customIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const LocationMap = () => {
  const position = [13.345623, 74.751789]; // Kodigehalli Gate, Bangalore

  const handleDirectionClick = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`,
      "_blank"
    );
  };

  return (
    <div className="map-container">
      <button className="direction-button" onClick={handleDirectionClick}>
        Get Direction ↗
      </button>

      <MapContainer center={position} zoom={10} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={customIcon}>
          <Popup>
            <b>Udupi Saree</b> <br />
            Kalasanka,Udupi
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LocationMap;
