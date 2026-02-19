import React, { useRef, useState } from "react";
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

interface KakaoMapProps {
  routePath?: string;
  customDrawing?: string | null;
  center?: {
    lat: number;
    lng: number;
  };
  markers?: {
    lat: number;
    lng: number;
    title?: string;
  }[];
  polyline?: {
    lat: number;
    lng: number;
  }[];

  startPosition?: { lat: number; lng: number } | null;

  /** 계획 경로 (route_options.coordinates) - 회색 점선으로 표시 */
  plannedPath?: {
    lat: number;
    lng: number;
  }[];
  /** 실제 이동 경로 (workouts.actual_path) - 에메랄드 실선으로 표시 */
  actualPath?: {
    lat: number;
    lng: number;
  }[];
  /** 로딩 상태 - true면 프리셋 경로를 표시하지 않음 */
  isLoading?: boolean;
}

export function KakaoMap({
  routePath = "heart",
  customDrawing = null,
  center = { lat: 37.5007, lng: 127.0364 },
  markers = [],
  polyline = [],
  startPosition = null,
  plannedPath = [],
  actualPath = [],
  isLoading = false,
}: KakaoMapProps) {
  const webViewRef = useRef<WebView>(null);
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const startLat = startPosition?.lat ?? 0;
  const startLng = startPosition?.lng ?? 0;

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

  // 로딩 중이면 프리셋 경로를 생성하지 않음
  const routePolyline =
    polyline.length > 0
      ? polyline
      : isLoading
        ? [] // 로딩 중이면 빈 배열
        : routePath
          ? getRoutePolyline(routePath)
          : []; // routePath가 없으면 빈 배열

  // 경로 비교 모드인지 확인 (plannedPath 또는 actualPath가 있으면)
  const isComparisonMode = plannedPath.length > 0 || actualPath.length > 0;

  // 비교 모드에서 지도 중심 계산
  const comparisonCenter = (() => {
    const allPoints = [...plannedPath, ...actualPath];
    if (allPoints.length === 0) return center;
    const avgLat = allPoints.reduce((s, p) => s + p.lat, 0) / allPoints.length;
    const avgLng = allPoints.reduce((s, p) => s + p.lng, 0) / allPoints.length;
    return { lat: avgLat, lng: avgLng };
  })();

  const mapCenter = isComparisonMode ? comparisonCenter : center;

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
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="error">
    <p>지도 로드 중 오류가 발생했습니다</p>
  </div>
  
  <script>
    (function() {
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

        sendLog('info', 'Kakao Map initialization started');

        // Kakao API가 로드되었는지 확인
        if (typeof kakao === 'undefined' || typeof kakao.maps === 'undefined') {
          throw new Error('Kakao Maps API가 로드되지 않았습니다');
        }

        var container = document.getElementById('map');
        if (!container) {
          throw new Error('Map container not found');
        }

        var options = {
          center: new kakao.maps.LatLng(${mapCenter.lat}, ${mapCenter.lng}),
          level: ${KAKAO_MAP_CONFIG.DEFAULT_LEVEL}
        };

        var map = new kakao.maps.Map(container, options);
        sendLog('info', 'Map created successfully');

        // 마커 추가
        ${markers
          .map((marker, index) => {
            const m = marker as {
              lat: number;
              lng: number;
              title?: string;
              color?: string;
              icon?: string;
            };
            const color = m.color || "#6b7280";
            const emoji =
              m.icon === "cafe" ? "☕" : m.icon === "convenience" ? "🏪" : "📍";
            const titleEscaped = (m.title || "")
              .replace(/'/g, "\\'")
              .replace(/</g, "&lt;");
            return `
          try {
            var pos${index} = new kakao.maps.LatLng(${m.lat}, ${m.lng});
            var circleDiv${index} = document.createElement('div');
            circleDiv${index}.style.cssText = 'width:28px;height:28px;background:${color};border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 1px 4px rgba(0,0,0,0.3);';
            circleDiv${index}.innerText = '${emoji}';
            var overlay${index} = new kakao.maps.CustomOverlay({
              position: pos${index},
              content: circleDiv${index},
              yAnchor: 0.5
            });
            overlay${index}.setMap(map);
            ${
              m.title
                ? `
            var iw${index} = new kakao.maps.InfoWindow({
              content: '<div style="padding:6px 8px;font-size:12px;max-width:120px;">' + ${JSON.stringify(titleEscaped)} + '</div>'
            });
            circleDiv${index}.addEventListener('click', function() {
              iw${index}.open(map, pos${index});
            });
            `
                : ""
            }
          } catch(e) {
            sendLog('error', 'Marker ${index} error: ' + e.message);
          }
        `;
          })
          .join("")}

        // 경로 폴리라인 추가
        try {
          var bounds = new kakao.maps.LatLngBounds();

          ${
            isComparisonMode
              ? `
          // ===== 경로 비교 모드 =====
          
          // 1) 계획 경로 (회색 점선)
          ${
            plannedPath.length > 0
              ? `
          var plannedLinePath = [
            ${plannedPath
              .map(
                (point) => `new kakao.maps.LatLng(${point.lat}, ${point.lng})`,
              )
              .join(",\n            ")}
          ];
          
          if (plannedLinePath.length > 0) {
            var plannedPolyline = new kakao.maps.Polyline({
              path: plannedLinePath,
              strokeWeight: 4,
              strokeColor: '#a1a1aa',
              strokeOpacity: 0.7,
              strokeStyle: 'shortdash'
            });
            plannedPolyline.setMap(map);
            plannedLinePath.forEach(function(point) { bounds.extend(point); });
            sendLog('info', 'Planned path added with ' + plannedLinePath.length + ' points');
          }
          `
              : ""
          }
          
          // 2) 실제 경로 (에메랄드 실선)
          ${
            actualPath.length > 0
              ? `
          var actualLinePath = [
            ${actualPath
              .map(
                (point) => `new kakao.maps.LatLng(${point.lat}, ${point.lng})`,
              )
              .join(",\n            ")}
          ];
          
          if (actualLinePath.length > 0) {
            var actualPolyline = new kakao.maps.Polyline({
              path: actualLinePath,
              strokeWeight: 5,
              strokeColor: '#34d399',
              strokeOpacity: 0.9,
              strokeStyle: 'solid'
            });
            actualPolyline.setMap(map);
            actualLinePath.forEach(function(point) { bounds.extend(point); });
            sendLog('info', 'Actual path added with ' + actualLinePath.length + ' points');
          }
          `
              : ""
          }
          
          // 모든 경로에 맞게 지도 범위 조정
          map.setBounds(bounds);
          setTimeout(function() {
            var level = map.getLevel();
            if (level > 1) map.setLevel(level + 1);
          }, 100);
          `
              : `
          // ===== 기본 단일 경로 모드 =====
          var linePath = [
            ${routePolyline
              .map(
                (point) => `new kakao.maps.LatLng(${point.lat}, ${point.lng})`,
              )
              .join(",\n            ")}
          ];

          if (linePath.length > 0) {
            var polyline = new kakao.maps.Polyline({
              path: linePath,
              strokeWeight: 5,
              strokeColor: '#10b981',
              strokeOpacity: 0.8,
              strokeStyle: 'solid'
            });
            polyline.setMap(map);
            sendLog('info', 'Polyline added with ' + linePath.length + ' points');

            // 시작점 마커 추가
            var customMarker = document.createElement('div');
            customMarker.style.cssText = 'width:30px;height:30px;background:#10b981;border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:14px;';
            customMarker.innerText = 'S';

            var startMarkerPos = (${startLat !== null} && ${startLng !== null})
              ? new kakao.maps.LatLng(${startLat}, ${startLng})
              : linePath[0];

            var startOverlay = new kakao.maps.CustomOverlay({
              position: startMarkerPos,
              content: customMarker,
              yAnchor: 0.5
            });
            startOverlay.setMap(map);

            // 경로에 맞게 지도 범위 조정
            linePath.forEach(function(point) {
              bounds.extend(point);
            });
            map.setBounds(bounds);
            
            // 약간의 여백 추가
            setTimeout(function() {
              var level = map.getLevel();
              map.setLevel(level + 1);
            }, 100);
          }
          `
          }
        } catch(e) {
          sendLog('error', 'Polyline error: ' + e.message);
        }

        sendLog('success', 'Map fully loaded');

      } catch (error) {
        sendLog('error', 'Map initialization error: ' + error.message);
        document.getElementById('error').style.display = 'block';
        document.getElementById('map').style.display = 'none';
      }
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
        onLoadStart={() => setWebViewLoading(true)}
        onLoadEnd={() => setWebViewLoading(false)}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("WebView error:", nativeEvent);
          setHasError(true);
          setWebViewLoading(false);
        }}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === "error") {
              console.error("Kakao Map Error:", data.message);
              setHasError(true);
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
