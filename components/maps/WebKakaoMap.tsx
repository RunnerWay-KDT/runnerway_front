import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Map, useKakaoLoader } from "react-kakao-maps-sdk";
import { Colors } from "../../constants/theme";

interface WebKakaoMapProps {
  center: { lat: number; lng: number };
  style?: any;
  level?: number;
  draggable?: boolean;
  zoomable?: boolean;
  onCreate?: (map: any) => void;
  children?: React.ReactNode;
  onClick?: (_: any, mouseEvent: any) => void;
  onDragEnd?: (map: any) => void;
}

export const WebKakaoMap: React.FC<WebKakaoMapProps> = ({
  center,
  style,
  level = 3,
  draggable = true,
  zoomable = true,
  onCreate,
  children,
  onClick,
  onDragEnd
}) => {
  const [loading, error] = useKakaoLoader({
    appkey: process.env.EXPO_PUBLIC_KAKAO_MAP_APP_KEY || "", // Javascript Key
    libraries: ["services", "clusterer", "drawing"],
  });

  if (loading) {
    return (
      <View style={[style, { justifyContent: "center", alignItems: "center", backgroundColor: Colors.zinc[100] }]}>
        <ActivityIndicator size="large" color={Colors.emerald[500]} />
        <Text style={{ marginTop: 8, color: Colors.zinc[500] }}>지도를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[style, { justifyContent: "center", alignItems: "center", backgroundColor: Colors.zinc[100] }]}>
        <Text style={{ color: Colors.red[500] }}>지도를 불러올 수 없습니다.</Text>
        <Text style={{ fontSize: 12, color: Colors.zinc[500], marginTop: 4 }}>{error.message}</Text>
      </View>
    );
  }

  return (
    <View style={style}>
      <Map
        center={center}
        style={{ width: "100%", height: "100%" }}
        level={level}
        draggable={draggable}
        zoomable={zoomable}
        onCreate={onCreate}
        onClick={onClick}
        onDragEnd={onDragEnd}
      >
        {children}
      </Map>
    </View>
  );
};
