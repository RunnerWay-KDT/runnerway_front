import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import WebView from "react-native-webview";
import { KAKAO_MAP_CONFIG } from "../constants/config";
import { Colors } from "../constants/theme";

interface LiveKakaoMapProps {
  routePath?: string;
  customDrawing?: string | null;
  progress?: number;
  center?: {
    lat: number;
    lng: number;
  };
  currentPosition?: {
    lat: number;
    lng: number;
  };
  polyline?: {
    lat: number;
    lng: number;
  }[];
}

export function LiveKakaoMap({
  routePath = "heart",
  customDrawing = null,
  progress = 0,
  center = { lat: 37.5665, lng: 126.978 },
  currentPosition,
  polyline = [],
}: LiveKakaoMapProps) {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // 경로에 따른 샘플 폴리라인 데이터 생성
  const getRoutePolyline = (shape: string) => {
    const centerLat = center.lat;
    const centerLng = center.lng;
    const size = 0.01;

    switch (shape) {
      case "heart":
        return [
          { lat: centerLat, lng: centerLng },
          { lat: centerLat + size * 0.5, lng: centerLng - size * 0.3 },
          { lat: centerLat + size * 0.8, lng: centerLng - size * 0.5 },
          { lat: centerLat + size * 0.3, lng: centerLng },
          { lat: centerLat + size * 0.8, lng: centerLng + size * 0.5 },
          { lat: centerLat + size * 0.5, lng: centerLng + size * 0.3 },
          { lat: centerLat, lng: centerLng },
        ];
      case "star":
        const points = 5;
        const outerRadius = size * 0.8;
        const innerRadius = size * 0.4;
        const starPoints = [];
        for (let i = 0; i < points * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / points - Math.PI / 2;
          starPoints.push({
            lat: centerLat + radius * Math.sin(angle),
            lng: centerLng + radius * Math.cos(angle),
          });
        }
        starPoints.push(starPoints[0]);
        return starPoints;
      case "circle":
        const circlePoints = [];
        for (let i = 0; i <= 32; i++) {
          const angle = (i * 2 * Math.PI) / 32;
          circlePoints.push({
            lat: centerLat + size * 0.7 * Math.sin(angle),
            lng: centerLng + size * 0.7 * Math.cos(angle),
          });
        }
        return circlePoints;
      default:
        return [
          { lat: centerLat, lng: centerLng },
          { lat: centerLat + size, lng: centerLng + size },
        ];
    }
  };

  const routePolyline =
    polyline.length > 0 ? polyline : getRoutePolyline(routePath);

  // 진행률에 따른 현재 위치 계산
  const calculateCurrentPosition = () => {
    if (currentPosition) return currentPosition;

    if (routePolyline.length < 2)
      return routePolyline[0] || { lat: center.lat, lng: center.lng };

    const totalPoints = routePolyline.length - 1;
    const currentIndex = Math.floor(progress * totalPoints);
    const nextIndex = Math.min(currentIndex + 1, totalPoints);
    const localProgress = progress * totalPoints - currentIndex;

    const current = routePolyline[currentIndex];
    const next = routePolyline[nextIndex];

    return {
      lat: current.lat + (next.lat - current.lat) * localProgress,
      lng: current.lng + (next.lng - current.lng) * localProgress,
    };
  };

  const currentPos = calculateCurrentPosition();

  // 진행률이 변경될 때마다 지도 업데이트
  useEffect(() => {
    if (webViewRef.current && isMapReady) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "updatePosition",
          position: currentPos,
          progress: progress,
        }),
      );
    }
  }, [progress, currentPos, isMapReady]);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${
    KAKAO_MAP_CONFIG.APP_KEY
  }"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { 
      width: 100%; 
      height: 100%; 
      overflow: hidden;
      background-color: #1a1a1a;
    }
    #map { 
      width: 100%; 
      height: 100%; 
    }
    #error {
      display: none;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #fff;
      text-align: center;
      font-family: sans-serif;
      padding: 20px;
    }
    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.5); opacity: 0; }
      100% { transform: scale(1); opacity: 0.5; }
    }
    .pulse-ring {
      position: absolute;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #10b981;
      opacity: 0.3;
      animation: pulse 2s infinite;
    }
    .current-marker {
      position: absolute;
      top: 5px;
      left: 5px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #10b981;
      border: 3px solid white;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="error">
    <p>지도 로드 중 오류가 발생했습니다</p>
  </div>
  
  <script>
    (function() {
      var map, completedPolyline, currentMarker;
      var fullPath = [];
      
      try {
        // 로그를 React Native로 전송
        function sendLog(type, message) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: type,
              message: message
            }));
          }
        }

        sendLog('info', 'Live Kakao Map initialization started');

        // Kakao API가 로드되었는지 확인
        if (typeof kakao === 'undefined' || typeof kakao.maps === 'undefined') {
          throw new Error('Kakao Maps API가 로드되지 않았습니다');
        }

        var container = document.getElementById('map');
        if (!container) {
          throw new Error('Map container not found');
        }

        var options = {
          center: new kakao.maps.LatLng(${center.lat}, ${center.lng}),
          level: ${KAKAO_MAP_CONFIG.DEFAULT_LEVEL}
        };

        map = new kakao.maps.Map(container, options);
        sendLog('info', 'Map created successfully');

        // 전체 경로 폴리라인
        fullPath = [
          ${routePolyline
            .map((point) => `new kakao.maps.LatLng(${point.lat}, ${point.lng})`)
            .join(",\n          ")}
        ];

        var fullPolyline = new kakao.maps.Polyline({
          path: fullPath,
          strokeWeight: 5,
          strokeColor: '#3f3f46',
          strokeOpacity: 0.5,
          strokeStyle: 'solid'
        });
        fullPolyline.setMap(map);

        // 완료된 경로 폴리라인
        completedPolyline = new kakao.maps.Polyline({
          path: [],
          strokeWeight: 6,
          strokeColor: '#10b981',
          strokeOpacity: 1,
          strokeStyle: 'solid'
        });
        completedPolyline.setMap(map);

        // 시작점 마커
        var startMarker = document.createElement('div');
        startMarker.style.cssText = 'width:30px;height:30px;background:#10b981;border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:14px;';
        startMarker.innerText = 'S';

        var startOverlay = new kakao.maps.CustomOverlay({
          position: fullPath[0],
          content: startMarker,
          zIndex: 10
        });
        startOverlay.setMap(map);

        // 현재 위치 마커
        var markerContainer = document.createElement('div');
        markerContainer.style.cssText = 'position:relative;width:30px;height:30px;';
        markerContainer.innerHTML = '<div class="pulse-ring"></div><div class="current-marker"></div>';

        currentMarker = new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(${currentPos.lat}, ${currentPos.lng}),
          content: markerContainer,
          zIndex: 20
        });
        currentMarker.setMap(map);

        // 경로에 맞게 지도 범위 조정
        var bounds = new kakao.maps.LatLngBounds();
        fullPath.forEach(function(point) {
          bounds.extend(point);
        });
        map.setBounds(bounds);

        // 약간의 여백 추가
        setTimeout(function() {
          var level = map.getLevel();
          map.setLevel(level + 1);
        }, 100);

        sendLog('ready', 'Map fully loaded and ready');

      } catch (error) {
        sendLog('error', 'Map initialization error: ' + error.message);
        document.getElementById('error').style.display = 'block';
        document.getElementById('map').style.display = 'none';
      }

      // 메시지 수신 처리
      window.addEventListener('message', function(event) {
        try {
          var data = JSON.parse(event.data);
          if (data.type === 'updatePosition' && map && currentMarker && completedPolyline) {
            var newPos = new kakao.maps.LatLng(data.position.lat, data.position.lng);
            currentMarker.setPosition(newPos);
            
            // 완료된 경로 업데이트
            var progressIndex = Math.floor(data.progress * (fullPath.length - 1));
            var completedPath = fullPath.slice(0, progressIndex + 1);
            if (completedPath.length > 0) {
              completedPath.push(newPos);
            }
            completedPolyline.setPath(completedPath);
            
            // 현재 위치를 중심으로 지도 이동
            map.panTo(newPos);
          }
        } catch (error) {
          sendLog('error', 'Message handling error: ' + error.message);
        }
      });

      document.addEventListener('message', function(event) {
        window.postMessage(event.data, '*');
      });
    })();
  </script>
</body>
</html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{
          html: htmlContent,
          baseUrl:
            Platform.OS === "android" ? "file:///android_asset/" : undefined,
        }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={Platform.OS === "android"}
        mixedContentMode="always"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("WebView error:", nativeEvent);
          setHasError(true);
          setIsLoading(false);
        }}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === "error") {
              console.error("Kakao Map Error:", data.message);
              setHasError(true);
            } else if (data.type === "ready") {
              console.log("Kakao Map Ready:", data.message);
              setIsMapReady(true);
              setHasError(false);
            } else if (data.type === "success") {
              console.log("Kakao Map Success:", data.message);
              setHasError(false);
            } else {
              console.log("Kakao Map:", data.type, data.message);
            }
          } catch {
            console.log("WebView message:", event.nativeEvent.data);
          }
        }}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.emerald[400]} />
          <Text style={styles.loadingText}>지도 로딩 중...</Text>
        </View>
      )}

      {hasError && !isLoading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>지도를 불러올 수 없습니다</Text>
          <Text style={styles.errorSubtext}>
            API 키를 확인하거나 인터넷 연결을 확인하세요
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: Colors.zinc[400],
    fontSize: 14,
  },
  errorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: Colors.red[400],
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  errorSubtext: {
    color: Colors.zinc[500],
    fontSize: 14,
    textAlign: "center",
  },
});
