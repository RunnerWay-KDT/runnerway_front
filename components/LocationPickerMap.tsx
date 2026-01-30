import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { KAKAO_MAP_CONFIG } from "../constants/config";

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
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(
    initialLocation || { lat: 37.5005, lng: 127.0365 },
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(true);

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        setIsGettingLocation(true);
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setLocationError("위치 권한이 필요합니다");
          setIsGettingLocation(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const newLocation = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };

        setCurrentLocation(newLocation);
        setIsGettingLocation(false);

        if (onLocationSelected) {
          onLocationSelected(newLocation);
        }
      } catch (error) {
        console.error("위치 가져오기 에러:", error);
        setLocationError("위치를 가져올 수 없습니다");
        setIsGettingLocation(false);
      }
    };

    if (!initialLocation) {
      getCurrentLocation();
    } else {
      setIsGettingLocation(false);
      if (onLocationSelected) {
        onLocationSelected(initialLocation);
      }
    }
  }, []);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "mapLoaded") {
        setIsLoading(false);
      } else if (
        data.type === "locationChanged" ||
        data.type === "locationSelected"
      ) {
        if (onLocationSelected) {
          onLocationSelected({ lat: data.lat, lng: data.lng });
        }
      } else if (data.type === "error") {
        console.error("Map error:", data.message);
      }
    } catch (error) {
      console.error("메시지 파싱 에러:", error);
    }
  };

  const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"><script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_CONFIG.APP_KEY}"></script><style>*{margin:0;padding:0}html,body{width:100%;height:100%;overflow:hidden}#map{width:100%;height:100%}</style></head><body><div id="map"></div><script>let map;let debounceTimer;function initMap(){try{const container=document.getElementById('map');const options={center:new kakao.maps.LatLng(${currentLocation.lat},${currentLocation.lng}),level:3};map=new kakao.maps.Map(container,options);window.ReactNativeWebView.postMessage(JSON.stringify({type:'mapLoaded'}));kakao.maps.event.addListener(map,'idle',function(){const center=map.getCenter();clearTimeout(debounceTimer);debounceTimer=setTimeout(function(){window.ReactNativeWebView.postMessage(JSON.stringify({type:'locationChanged',lat:center.getLat(),lng:center.getLng()}));},300);});}catch(error){window.ReactNativeWebView.postMessage(JSON.stringify({type:'error',message:error.toString()}));}}if(typeof kakao!=='undefined'&&kakao.maps){initMap();}else{document.addEventListener('DOMContentLoaded',function(){setTimeout(initMap,100);});}</script></body></html>`;

  if (isGettingLocation) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>현재 위치를 가져오는 중...</Text>
        </View>
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{locationError}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onError={(error) => console.error("WebView Error:", error)}
      />
      <View style={styles.centerPinContainer} pointerEvents="none">
        <View style={styles.pinShadow} />
        <View style={styles.pin}>
          <View style={styles.pinHead} />
          <View style={styles.pinPoint} />
        </View>
      </View>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.overlayText}>지도 로딩 중...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  webview: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  errorText: { fontSize: 16, color: "#FF6B6B" },
  centerPinContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -50,
    alignItems: "center",
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: { marginTop: 12, fontSize: 16, color: "#666" },
});
