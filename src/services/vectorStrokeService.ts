import { strokeOrderData } from '../data/strokeOrderData';

export interface Point {
  x: number;
  y: number;
}

export interface StrokeData {
  path: string;
  points: Point[];
  direction: 'horizontal' | 'vertical' | 'diagonal' | 'curve';
  startPoint: Point;
  endPoint: Point;
  tolerance: number;
}

export interface CharacterStrokeData {
  character: string;
  strokes: StrokeData[];
  meaning?: string;
  reading?: string;
  examples?: string[];
}

export interface StrokeValidationResult {
  isValid: boolean;
  strokeIndex: number;
  errorMessage?: string;
  suggestedPath?: string;
  progress: number;
}

export interface DrawingState {
  currentStroke: number;
  completedStrokes: string[];
  isDrawing: boolean;
  currentPath: Point[];
  lastPoint: Point | null;
}

export class VectorStrokeService {
  private strokeTolerance = 30; // pixels
  private directionTolerance = 45; // degrees
  private minimumStrokeLength = 10; // pixels
  private snapDistance = 25; // pixels for auto-snap

  constructor() {}

  // Get character stroke data
  getCharacterData(character: string): CharacterStrokeData | null {
    return strokeOrderData[character] || null;
  }

  // Initialize drawing state for a character
  initializeDrawingState(): DrawingState {
    return {
      currentStroke: 0,
      completedStrokes: [],
      isDrawing: false,
      currentPath: [],
      lastPoint: null
    };
  }

  // Convert SVG path to points array
  private pathToPoints(path: string): Point[] {
    const points: Point[] = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return points;

    const path2d = new Path2D(path);
    const pathData = path.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g);
    
    if (!pathData) return points;

    let currentX = 0;
    let currentY = 0;

    pathData.forEach(command => {
      const type = command[0];
      const coords = command.slice(1).trim().split(/[\s,]+/).map(Number);

      switch (type.toLowerCase()) {
        case 'm': // Move to
          currentX = type === 'M' ? coords[0] : currentX + coords[0];
          currentY = type === 'M' ? coords[1] : currentY + coords[1];
          points.push({ x: currentX, y: currentY });
          break;
        case 'l': // Line to
          currentX = type === 'L' ? coords[0] : currentX + coords[0];
          currentY = type === 'L' ? coords[1] : currentY + coords[1];
          points.push({ x: currentX, y: currentY });
          break;
        case 'h': // Horizontal line
          currentX = type === 'H' ? coords[0] : currentX + coords[0];
          points.push({ x: currentX, y: currentY });
          break;
        case 'v': // Vertical line
          currentY = type === 'V' ? coords[0] : currentY + coords[0];
          points.push({ x: currentX, y: currentY });
          break;
        case 'c': // Cubic bezier
          // Simplified - just use end point for now
          const endIdx = coords.length - 2;
          currentX = type === 'C' ? coords[endIdx] : currentX + coords[endIdx];
          currentY = type === 'C' ? coords[endIdx + 1] : currentY + coords[endIdx + 1];
          points.push({ x: currentX, y: currentY });
          break;
      }
    });

    return points;
  }

  // Calculate distance between two points
  private distance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  // Calculate angle between two points
  private angle(p1: Point, p2: Point): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
  }

  // Check if point is near a stroke path
  private isPointNearPath(point: Point, strokePoints: Point[]): boolean {
    for (let i = 0; i < strokePoints.length - 1; i++) {
      const dist = this.distanceToLineSegment(point, strokePoints[i], strokePoints[i + 1]);
      if (dist <= this.strokeTolerance) {
        return true;
      }
    }
    return false;
  }

  // Calculate distance from point to line segment
  private distanceToLineSegment(point: Point, lineStart: Point, lineEnd: Point): number {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return this.distance(point, lineStart);

    const t = Math.max(0, Math.min(1, dot / lenSq));
    const projection = {
      x: lineStart.x + t * C,
      y: lineStart.y + t * D
    };

    return this.distance(point, projection);
  }

  // Check if stroke direction matches expected direction
  private isDirectionCorrect(userPath: Point[], expectedPath: Point[]): boolean {
    if (userPath.length < 2 || expectedPath.length < 2) return false;

    const userAngle = this.angle(userPath[0], userPath[userPath.length - 1]);
    const expectedAngle = this.angle(expectedPath[0], expectedPath[expectedPath.length - 1]);
    
    const angleDiff = Math.abs(userAngle - expectedAngle);
    const normalizedDiff = Math.min(angleDiff, 360 - angleDiff);

    return normalizedDiff <= this.directionTolerance;
  }

  // Snap user stroke to correct path
  snapToPath(userPath: Point[], correctPath: Point[]): Point[] {
    if (userPath.length === 0) return userPath;

    const snappedPath: Point[] = [];

    userPath.forEach(userPoint => {
      let closestPoint = userPoint;
      let minDistance = Infinity;

      // Find closest point on correct path
      for (let i = 0; i < correctPath.length - 1; i++) {
        const projected = this.projectPointOnLineSegment(userPoint, correctPath[i], correctPath[i + 1]);
        const dist = this.distance(userPoint, projected);
        
        if (dist < minDistance && dist <= this.snapDistance) {
          minDistance = dist;
          closestPoint = projected;
        }
      }

      snappedPath.push(closestPoint);
    });

    return snappedPath;
  }

  // Project point onto line segment
  private projectPointOnLineSegment(point: Point, lineStart: Point, lineEnd: Point): Point {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return lineStart;

    const t = Math.max(0, Math.min(1, dot / lenSq));
    return {
      x: lineStart.x + t * C,
      y: lineStart.y + t * D
    };
  }

  // Validate stroke as user draws
  validateStroke(
    userPath: Point[],
    characterData: CharacterStrokeData,
    currentStrokeIndex: number
  ): StrokeValidationResult {
    if (currentStrokeIndex >= characterData.strokes.length) {
      return {
        isValid: false,
        strokeIndex: currentStrokeIndex,
        errorMessage: 'Semua goresan sudah selesai',
        progress: 100
      };
    }

    const expectedStroke = characterData.strokes[currentStrokeIndex];
    const expectedPath = this.pathToPoints(expectedStroke.path);

    // Check if stroke started from correct position
    if (userPath.length > 0) {
      const startDistance = this.distance(userPath[0], expectedPath[0]);
      if (startDistance > this.strokeTolerance) {
        return {
          isValid: false,
          strokeIndex: currentStrokeIndex,
          errorMessage: 'Mulai dari titik yang salah',
          progress: 0
        };
      }
    }

    // Check if stroke is following correct path
    if (userPath.length > 1) {
      const isPathCorrect = userPath.every(point => this.isPointNearPath(point, expectedPath));
      if (!isPathCorrect) {
        return {
          isValid: false,
          strokeIndex: currentStrokeIndex,
          errorMessage: 'Jalur goresan salah',
          progress: 0
        };
      }

      // Check direction
      const isDirectionOk = this.isDirectionCorrect(userPath, expectedPath);
      if (!isDirectionOk) {
        return {
          isValid: false,
          strokeIndex: currentStrokeIndex,
          errorMessage: 'Arah goresan salah',
          progress: 0
        };
      }
    }

    // Calculate progress
    const progress = userPath.length > 0 ? 
      Math.min(100, (userPath.length / expectedPath.length) * 100) : 0;

    return {
      isValid: true,
      strokeIndex: currentStrokeIndex,
      progress: progress
    };
  }

  // Check if stroke is complete
  isStrokeComplete(userPath: Point[], expectedPath: Point[]): boolean {
    if (userPath.length === 0 || expectedPath.length === 0) return false;

    const endDistance = this.distance(
      userPath[userPath.length - 1],
      expectedPath[expectedPath.length - 1]
    );

    return endDistance <= this.strokeTolerance && userPath.length >= expectedPath.length * 0.8;
  }

  // Generate stroke animation frames
  generateStrokeAnimation(strokeData: StrokeData, duration: number = 1000): Point[][] {
    const frames: Point[][] = [];
    const points = this.pathToPoints(strokeData.path);
    const frameCount = Math.max(10, Math.floor(duration / 50)); // 20 FPS
    
    for (let i = 0; i <= frameCount; i++) {
      const progress = i / frameCount;
      const pointIndex = Math.floor(progress * (points.length - 1));
      const framePoints = points.slice(0, pointIndex + 1);
      frames.push(framePoints);
    }

    return frames;
  }

  // Generate complete character animation
  generateCharacterAnimation(characterData: CharacterStrokeData): Point[][][] {
    const animations: Point[][][] = [];
    
    characterData.strokes.forEach(stroke => {
      const strokeAnimation = this.generateStrokeAnimation(stroke, 1200);
      animations.push(strokeAnimation);
    });

    return animations;
  }

  // Convert points to SVG path
  pointsToPath(points: Point[]): string {
    if (points.length === 0) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return path;
  }

  // Scale stroke data to fit canvas
  scaleStrokeData(strokeData: StrokeData, scale: number, offsetX: number = 0, offsetY: number = 0): StrokeData {
    const scaledPoints = strokeData.points.map(point => ({
      x: point.x * scale + offsetX,
      y: point.y * scale + offsetY
    }));

    return {
      ...strokeData,
      points: scaledPoints,
      startPoint: {
        x: strokeData.startPoint.x * scale + offsetX,
        y: strokeData.startPoint.y * scale + offsetY
      },
      endPoint: {
        x: strokeData.endPoint.x * scale + offsetX,
        y: strokeData.endPoint.y * scale + offsetY
      }
    };
  }

  // Get random character by type
  getRandomCharacter(type: 'hiragana' | 'katakana' | 'kanji'): CharacterStrokeData | null {
    const characters = Object.values(strokeOrderData).filter(char => {
      if (type === 'hiragana') return /[\u3040-\u309f]/.test(char.character);
      if (type === 'katakana') return /[\u30a0-\u30ff]/.test(char.character);
      if (type === 'kanji') return /[\u4e00-\u9faf]/.test(char.character);
      return false;
    });

    if (characters.length === 0) return null;
    return characters[Math.floor(Math.random() * characters.length)];
  }

  // Get stroke order hint
  getStrokeOrderHint(characterData: CharacterStrokeData, currentStroke: number): string {
    if (currentStroke >= characterData.strokes.length) return 'Selesai!';
    
    const stroke = characterData.strokes[currentStroke];
    const strokeNumber = currentStroke + 1;
    const totalStrokes = characterData.strokes.length;
    
    let hint = `Goresan ${strokeNumber}/${totalStrokes}`;
    
    if (stroke.direction === 'horizontal') hint += ' - Horizontal';
    else if (stroke.direction === 'vertical') hint += ' - Vertikal';
    else if (stroke.direction === 'diagonal') hint += ' - Diagonal';
    else if (stroke.direction === 'curve') hint += ' - Lengkung';
    
    return hint;
  }

  // Calculate character completion percentage
  getCompletionPercentage(completedStrokes: number, totalStrokes: number): number {
    return Math.round((completedStrokes / totalStrokes) * 100);
  }
}

export const vectorStrokeService = new VectorStrokeService();