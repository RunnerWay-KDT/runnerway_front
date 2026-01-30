import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import { WebKakaoMap } from "./maps/WebKakaoMap";
import { Colors } from "../constants/theme";

interface LocationPickerMapProps {
  onLocationSelected?: (location: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number };
  style?: object;
}

export default function LocationPickerMap({
  onLocationSelected,
  initialLocation,
  style,
}: LocationPickerMapProps) {
  const [center, setCenter] = useState(
    initialLocation || { lat: 37.5005, lng: 127.0365 }
  );

  useEffect(() => {
    if (initialLocation) {
      setCenter(initialLocation);
    }
  }, [initialLocation]);

  const handleCenterChanged = (map: kakao.maps.Map) => {
    const latlng = map.getCenter();
    const newLocation = {
      lat: latlng.getLat(),
      lng: latlng.getLng(),
    };
    // 상태 업데이트 (중앙 좌표는 계속 변함)
    // 주의: onCenterChanged는 매우 빈번하게 호출되므로, 
    // 실제 데이터 전송은 드래그 끝났을 때 하거나 디바운스 처리하는 것이 좋음.
    // 여기서는 UI 일관성을 위해 드래그 종료 시에만 부모에게 알림.
  };

  const handleDragEnd = (map: kakao.maps.Map) => {
    const latlng = map.getCenter();
    const newLocation = {
      lat: latlng.getLat(),
      lng: latlng.getLng(),
    };
    if (onLocationSelected) {
      onLocationSelected(newLocation);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebKakaoMap
        center={center}
        style={styles.map}
        level={3}
        onDragEnd={handleDragEnd}
        // WebKakaoMap에 필요한 prop이 있다면 추가 (예: onCenterChanged)
      >
          {/* 마커 제거: 앱과 동일하게 핀은 오버레이로 처리 */}
      </WebKakaoMap>
      
      {/* 앱과 동일한 핀 디자인 오버레이 */}
      <View style={styles.centerPinContainer} pointerEvents="none">
        <View style={styles.pinShadow} />
        <View style={styles.pin}>
          <View style={styles.pinHead} />
          <View style={styles.pinPoint} />
        </View>
      </View>

      <View style={styles.hintOverlay}>
        <Text style={styles.hintText}>지도를 드래그하여 위치를 조정하세요</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  hintOverlay: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  hintText: {
    color: "#fff",
    fontSize: 14,
  },
  // 앱과 동일한 핀 스타일 복사
  centerPinContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -50,
    alignItems: "center",
    zIndex: 20, 
  },
  pin: { alignItems: "center" },
  pinHead: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4A90E2",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pinPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#4A90E2",
    marginTop: -2,
  },
  pinShadow: {
    position: "absolute",
    bottom: -8,
    width: 20,
    height: 6,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
});
