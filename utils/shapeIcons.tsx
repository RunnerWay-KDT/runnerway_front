import { Heart, Star, Coffee, Cat, Smile } from "lucide-react-native";

// Custom Dog icon since lucide-react-native might not have it
import Svg, { Path } from "react-native-svg";
import React from "react";

// Custom Dog Icon Component
export const Dog = ({
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5" />
    <Path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.45-2.344-2.5" />
    <Path d="M8 14v.5" />
    <Path d="M16 14v.5" />
    <Path d="M11.25 16.25h1.5L12 17l-.75-.75Z" />
    <Path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306" />
  </Svg>
);

// 아이콘 이름을 실제 컴포넌트로 매핑
export const iconMap: Record<string, React.ComponentType<any>> = {
  heart: Heart,
  star: Star,
  coffee: Coffee,
  dog: Dog,
  cat: Cat,
  smile: Smile,
};

// 아이콘 이름으로 컴포넌트 가져오기
export const getIconComponent = (
  iconName: string,
): React.ComponentType<any> => {
  return iconMap[iconName] || Heart;
};
