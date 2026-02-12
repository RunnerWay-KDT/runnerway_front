// SVG Paths for GPS Art Presets
// These paths are optimized for backend compatibility (Linear M/L commands only).

// Heart: Simple V-shape heart
export const HEART_PATH = "M 50 90 L 26 50 L 10 26 L 50 66 L 90 26 L 74 50 L 50 90 Z";

// Star: 5-point star
export const STAR_PATH = "M 12 2 L 14.472 8.944 L 21.708 9.416 L 16.281 14.472 L 17.888 21.584 L 12 17.888 L 6.112 21.584 L 7.719 14.472 L 2.292 9.416 L 9 9 L 12 2";

// Dog: Simple dog profile (facing right)
export const DOG_PATH = "M 20 50 L 20 80 L 30 80 L 30 90 L 40 90 L 40 80 L 60 80 L 60 90 L 70 90 L 70 80 L 80 80 L 80 60 L 90 50 L 90 40 L 80 40 L 80 50 L 70 50 L 70 40 L 60 40 L 60 50 L 20 50 Z";

// Cat: Simple cat head
export const CAT_PATH = "M 20 80 L 20 50 L 10 40 L 30 40 L 40 50 L 60 50 L 70 40 L 90 40 L 80 50 L 80 80 L 70 80 L 70 90 L 60 90 L 60 80 L 40 80 L 40 90 L 30 90 L 30 80 Z";

// Circle: Rough circle approximation
export const CIRCLE_PATH = "M 12 6 L 16 8 L 18 12 L 16 16 L 12 18 L 8 16 L 6 12 L 8 8 L 12 6";

// Bookmark
export const BOOKMARK_PATH = "M 7 3 L 17 3 L 19 5 L 19 20 L 17 20 L 13 16 L 11 16 L 7 20 L 5 20 L 5 5 L 7 3 Z";
// Cross
export const CROSS_PATH = "M 2 10 L 10 10 L 10 2 L 14 2 L 14 10 L 22 10 L 22 14 L 14 14 L 14 22 L 10 22 L 10 14 L 2 14 L 2 10 Z";
// Diamond
export const DIAMOND_PATH = "M 12 3 L 21 12 L 12 21 L 3 12 L 12 3 Z";
// Pentagon
export const PENTAGON_PATH = "M 12 2 L 22 10 L 18 21 L 6 21 L 2 10 L 12 2 Z";
// Shield
export const SHIELD_PATH = "M 12 2 L 18 5 L 20 6 L 20 13 L 18 17 L 15 20 L 12 22 L 9 20 L 6 17 L 4 13 L 4 6 L 6 5 L 12 2 Z";
// Smile (Complex path with moves)
export const SMILE_PATH = "M 8 10 L 8 12 L 9 12 L 9 10 L 8 10 M 15 10 L 15 12 L 16 12 L 16 10 L 15 10 M 8 14 L 9 15 L 10 16 L 12 17 L 14 16 L 15 15 L 16 14 M 12 1 L 18 2 L 21 5 L 23 11 L 23 13 L 21 19 L 18 22 L 12 23 L 6 22 L 3 19 L 1 13 L 1 11 L 3 5 L 6 2 L 12 1 Z";
// Stairs
export const STAIRS_PATH = "M 2 4 L 6 4 L 6 8 L 10 8 L 10 12 L 14 12 L 14 16 L 18 16 L 18 20 L 22 20 L 22 22 L 2 22 L 2 4 Z";
// Triangle
export const TRIANGLE_PATH = "M 3 21 L 22 5 L 22 19 L 3 21 Z";
// Zap
export const ZAP_PATH = "M 4 14 L 13.9 3.8 L 12 10 L 20 10 L 10.1 20.2 L 12 14 L 4 14 Z";

// Map shape ID to Path
export const PRESET_SHAPES: Record<string, string> = {
  "heart": HEART_PATH,
  "star": STAR_PATH,
  "circle": CIRCLE_PATH,
  "bookmark": BOOKMARK_PATH,
  "cross": CROSS_PATH,
  "diamond": DIAMOND_PATH,
  "pentagon": PENTAGON_PATH,
  "shield": SHIELD_PATH,
  "smile": SMILE_PATH,
  "stairs": STAIRS_PATH,
  "triangle": TRIANGLE_PATH,
  "zap": ZAP_PATH,
  "dog": DOG_PATH,
  "cat": CAT_PATH,
  // Default fallback
  "default": HEART_PATH
};

export const getPresetSvgPath = (shapeIconName: string): string => {
  // Normalize icon name (e.g. 'heart-outline' -> 'heart')
  const key = Object.keys(PRESET_SHAPES).find(k => shapeIconName.includes(k));
  return PRESET_SHAPES[key || "default"];
};

// UI List Data (Replaces DB fetch)
export const SHAPE_LIST = [
  { id: 'heart', name: '하트', iconName: 'heart', category: 'shape', distance: '5.0km', svgPath: HEART_PATH },
  { id: 'star', name: '별', iconName: 'star', category: 'shape', distance: '5.0km', svgPath: STAR_PATH },
  { id: 'circle', name: '동그라미', iconName: 'circle', category: 'shape', distance: '3.0km', svgPath: CIRCLE_PATH },
  { id: 'triangle', name: '삼각형', iconName: 'triangle', category: 'shape', distance: '3.0km', svgPath: TRIANGLE_PATH },
  { id: 'pentagon', name: '오각형', iconName: 'pentagon', category: 'shape', distance: '4.0km', svgPath: PENTAGON_PATH },
  { id: 'diamond', name: '다이아', iconName: 'diamond', category: 'shape', distance: '3.5km', svgPath: DIAMOND_PATH },
  { id: 'cross', name: '십자가', iconName: 'cross', category: 'shape', distance: '4.0km', svgPath: CROSS_PATH },
  { id: 'shield', name: '방패', iconName: 'shield', category: 'shape', distance: '4.5km', svgPath: SHIELD_PATH },
  { id: 'zap', name: '번개', iconName: 'zap', category: 'shape', distance: '3.0km', svgPath: ZAP_PATH },
  { id: 'bookmark', name: '북마크', iconName: 'bookmark', category: 'shape', distance: '3.0km', svgPath: BOOKMARK_PATH },
  { id: 'smile', name: '스마일', iconName: 'smile', category: 'shape', distance: '3.5km', svgPath: SMILE_PATH },
  { id: 'stairs', name: '계단', iconName: 'stairs', category: 'shape', distance: '4.0km', svgPath: STAIRS_PATH },
  { id: 'dog', name: '강아지', iconName: 'dog', category: 'animal', distance: '3.0km', svgPath: DOG_PATH },
  { id: 'cat', name: '고양이', iconName: 'cat', category: 'animal', distance: '3.0km', svgPath: CAT_PATH },
];
