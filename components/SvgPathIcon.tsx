/**
 * SvgPathIcon - 커스텀 도형의 SVG path를 미니 아이콘으로 렌더링
 *
 * DB에 저장된 SVG path 문자열 (예: "M 30 60 L 35 45 L 50 30 ...")을
 * 지정된 size에 맞춰 자동으로 스케일링하여 표시합니다.
 */
import React, { useMemo } from "react";
import Svg, { Path } from "react-native-svg";

interface SvgPathIconProps {
  /** DB에 저장된 SVG path 문자열 (예: "M 30 60 L 35 45 ...") */
  svgPath: string;
  /** 아이콘 크기 (px) */
  size?: number;
  /** 선 색상 */
  color?: string;
  /** 선 두께 (선택 - 미지정시 viewBox 크기에 비례하여 자동 계산) */
  strokeWidth?: number;
}

/**
 * SVG path 문자열에서 모든 좌표를 추출하여 bounding box를 계산한 뒤,
 * 지정된 size에 맞게 viewBox를 설정하여 렌더링합니다.
 * strokeWidth는 viewBox 대비 약 2.5% 비율로 자동 계산됩니다.
 */
export const SvgPathIcon: React.FC<SvgPathIconProps> = ({
  svgPath,
  size = 32,
  color = "#34d399",
  strokeWidth: strokeWidthProp,
}) => {
  const { viewBox, calculatedStrokeWidth } = useMemo(() => {
    // SVG path에서 모든 숫자(좌표)를 추출
    const numbers = svgPath.match(/-?\d+\.?\d*/g);
    if (!numbers || numbers.length < 2) {
      return { viewBox: "0 0 100 100", calculatedStrokeWidth: 3 };
    }

    // x, y 좌표 분리 (M x y L x y L x y ...)
    const coords: { x: number; y: number }[] = [];
    for (let i = 0; i < numbers.length - 1; i += 2) {
      coords.push({
        x: parseFloat(numbers[i]),
        y: parseFloat(numbers[i + 1]),
      });
    }

    if (coords.length === 0) {
      return { viewBox: "0 0 100 100", calculatedStrokeWidth: 3 };
    }

    // bounding box 계산
    const xs = coords.map((c) => c.x);
    const ys = coords.map((c) => c.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    const width = maxX - minX || 1;
    const height = maxY - minY || 1;
    const maxDim = Math.max(width, height);

    // padding: viewBox 크기의 10%
    const padding = maxDim * 0.1;

    // strokeWidth: viewBox 대비 약 7% -> 8.3% (Lucide 2px/24px 비율과 유사하게 조정)
    const autoStroke = maxDim * 0.083;

    return {
      viewBox: `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`,
      calculatedStrokeWidth: autoStroke,
    };
  }, [svgPath]);

  const finalStrokeWidth = strokeWidthProp ?? calculatedStrokeWidth;

  return (
    <Svg width={size} height={size} viewBox={viewBox}>
      <Path
        d={svgPath}
        stroke={color}
        strokeWidth={finalStrokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
