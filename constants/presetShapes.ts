export const BOOKMARK_PATH = "M 7 3 L 17 3 L 19 5 L 19 20 L 17 20 L 13 16 L 11 16 L 7 20 L 5 20 L 5 5 L 7 3";
export const CIRCLE_PATH = "M 12 6 L 16 8 L 18 12 L 16 16 L 12 18 L 8 16 L 6 12 L 8 8 L 12 6";
export const DIAMOND_PATH = "M 14 8 L 16 11 L 12 17 L 12 17 L 10 17 L 6 11 L 8 8 L 14 8";
export const DOG_PATH = "M 20 50 L 20 80 L 30 80 L 30 90 L 40 90 L 40 80 L 60 80 L 60 90 L 70 90 L 70 80 L 80 80 L 80 60 L 90 50 L 90 40 L 80 40 L 80 50 L 70 50 L 70 40 L 60 40 L 60 50 L 20 50 Z";
export const FISH_PATH = "M 30 60 L 35 45 L 45 35 L 60 25 L 85 20 L 110 25 L 130 35 L 145 25 L 165 20 L 175 25 L 170 45 L 160 60 L 170 75 L 175 95 L 165 100 L 145 95 L 130 85 L 110 95 L 85 100 L 60 95 L 45 85 L 35 75 L 30 60";
export const BEAR_PATH = "M 130.33 151.67 L 85.67 156.33 L 65.00 129.33 L 59.67 93.00 L 91.00 50.67 L 140.00 49.33 L 159.67 100.67 L 196.00 81.67 L 221.33 78.00 L 250.33 92.33 L 265.00 112.67 L 286.33 61.33 L 306.33 40.00 L 326.67 42.33 L 355.33 68.00 L 362.00 108.33 L 352.33 124.67 L 323.33 143.00 L 280.67 149.33 L 291.33 237.00 L 257.33 289.00 L 165.67 297.33 L 136.33 278.67 L 117.33 236.33 L 119.00 185.33 L 128.00 167.67 L 130.33 151.67";
export const HEART_PATH = "M 175 260 L 150 230 L 130 210 L 130 190 L 145 175 L 160 175 L 175 190 L 190 175 L 205 175 L 220 190 L 220 210 L 200 230 L 175 260";
export const PENTAGON_PATH = "M 12 2 L 22 10 L 18 21 L 6 21 L 2 10 L 12 2";
export const SHIELD_PATH = "M 12 2 L 18 5 L 20 6 L 20 13 L  18 17 L 15 20 L 12 22 L 9 20 L 6 17 L 4 13 L 4 6 L 6 5 L 12 2";
export const STAR_PATH = "M 50.0 5.0 L 60.6 35.4 L 92.8 36.1 L 67.1 55.6 L 76.5 86.4 L 50.0 68.0 L 23.5 86.4 L 32.9 55.6 L 7.2 36.1 L 39.4 35.4 L 50.0 5.0 ";
export const TRIANGLE_PATH = "M 8 19 L 22 5 L 22 19 L 8 19";
export const ZAP_PATH = "M 4 14 L 13.9 3.8 L 12 10 L 20 10 L 10.1 20.2 L 12 14 L 4 14";
export const CAT_PATH = "M 20 80 L 20 50 L 10 40 L 30 40 L 40 50 L 60 50 L 70 40 L 90 40 L 80 50 L 80 80 L 70 80 L 70 90 L 60 90 L 60 80 L 40 80 L 40 90 L 30 90 L 30 80 L 20 80";

export const PRESET_SHAPES: Record<string, string> = {
  "heart": HEART_PATH,
  "star": STAR_PATH,
  "circle": CIRCLE_PATH,
  "bookmark": BOOKMARK_PATH,
  "diamond": DIAMOND_PATH,
  "pentagon": PENTAGON_PATH,
  "shield": SHIELD_PATH,
  "triangle": TRIANGLE_PATH,
  "zap": ZAP_PATH,
  "dog": DOG_PATH,
  "cat": CAT_PATH,
  "fish": FISH_PATH,
  "bear": BEAR_PATH,
  "default": HEART_PATH
};

export const getPresetSvgPath = (shapeIconName: string): string => {
  const key = Object.keys(PRESET_SHAPES).find(k => shapeIconName.includes(k));
  return PRESET_SHAPES[key || "default"];
};

export const SHAPE_LIST = [
  { id: 'heart', name: '하트', iconName: 'heart', category: 'shape', svgPath: HEART_PATH },
  { id: 'star', name: '별', iconName: 'star', category: 'shape', svgPath: STAR_PATH },
  { id: 'circle', name: '동그라미', iconName: 'circle', category: 'shape', svgPath: CIRCLE_PATH },
  { id: 'triangle', name: '삼각형', iconName: 'triangle', category: 'shape', svgPath: TRIANGLE_PATH },
  { id: 'pentagon', name: '오각형', iconName: 'pentagon', category: 'shape', svgPath: PENTAGON_PATH },
  { id: 'diamond', name: '다이아', iconName: 'diamond', category: 'shape', svgPath: DIAMOND_PATH },
  { id: 'shield', name: '방패', iconName: 'shield', category: 'shape', svgPath: SHIELD_PATH },
  { id: 'zap', name: '번개', iconName: 'zap', category: 'shape', svgPath: ZAP_PATH },
  { id: 'bookmark', name: '북마크', iconName: 'bookmark', category: 'shape', svgPath: BOOKMARK_PATH },
  { id: 'dog', name: '강아지', iconName: 'dog', category: 'animal', svgPath: DOG_PATH },
  { id: 'cat', name: '고양이', iconName: 'cat', category: 'animal', svgPath: CAT_PATH },
  { id: 'fish', name: '물고기', iconName: 'fish', category: 'animal', svgPath: FISH_PATH },
  { id: 'bear', name: '곰', iconName: 'bear', category: 'animal', svgPath: BEAR_PATH },
];
