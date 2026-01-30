import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { MapMarker, Polyline } from "react-kakao-maps-sdk";
import { WebKakaoMap } from "./maps/WebKakaoMap";
import { Colors } from "../constants/theme";

// Helper function (You might need to import this or redefine it if mapUtils is missing on web)
const getRoutePolyline = (shape: string, center: { lat: number; lng: number }, scale: number = 0.005) => {
    // Simple fallback or import if available
    const { lat, lng } = center;
    if (shape === 'circle') {
        const points = [];
        for (let i = 0; i <= 360; i += 10) {
            const rad = (i * Math.PI) / 180;
            points.push({
                lat: lat + Math.sin(rad) * scale * 0.7,
                lng: lng + Math.cos(rad) * scale * 0.7
            });
        }
        return points;
    }
    // Default square
    return [
        { lat: lat + scale, lng: lng + scale },
        { lat: lat - scale, lng: lng + scale },
        { lat: lat - scale, lng: lng - scale },
        { lat: lat + scale, lng: lng - scale },
        { lat: lat + scale, lng: lng + scale },
    ];
};

interface KakaoMapProps {
  center?: { lat: number; lng: number };
  routePath?: string; // Icon name -> Shape
  polyline?: { lat: number; lng: number }[];
}

export const KakaoMap: React.FC<KakaoMapProps> = ({ 
  center = { lat: 37.5665, lng: 126.978 },
  routePath,
  polyline = []
}) => {
  const [path, setPath] = useState<{lat: number, lng: number}[]>([]);

  useEffect(() => {
    if (polyline && polyline.length > 0) {
        setPath(polyline);
    } else if (routePath && center) {
        // Generate path for preview (static) - Using local fallback for simplicity or import real util
        const generatedPath = getRoutePolyline(routePath, center, 0.008);
        setPath(generatedPath);
    }
  }, [routePath, center, polyline]);

  if (!center) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <WebKakaoMap 
        center={center} 
        style={styles.map} 
        level={4} // Zoom for preview
        draggable={true}
        zoomable={true}
      >
        {path.length > 0 && (
            <Polyline
                path={path}
                strokeWeight={8}
                strokeColor={Colors.emerald[500]}
                strokeOpacity={0.8}
                strokeStyle={"solid"}
            />
        )}
        
        {/* Start Marker */}
        <MapMarker
          position={path.length > 0 ? path[0] : center}
          image={{
              src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/blue_b.png",
              size: { width: 40, height: 42 },
              options: { offset: { x: 20, y: 42 } }
          }}
        />
      </WebKakaoMap>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
     ...StyleSheet.absoluteFillObject,
     zIndex: 0, 
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
