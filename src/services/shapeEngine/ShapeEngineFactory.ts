import { TypeShape, ShapeData } from '../../types/shape';
import { ShapeStrategy } from './types';
import { RectStrategy } from './strategies/RectStrategy';
import { EllipseStrategy } from './strategies/EllipseStrategy';
import { LineStrategy } from './strategies/LineStrategy';
import { ArrowStrategy } from './strategies/ArrowStrategy';
import { PolylineStrategy } from './strategies/PolylineStrategy';
import { TextStrategy } from './strategies/TextStrategy';
import { NoteStrategy } from './strategies/NoteStrategy';

export class ShapeEngineFactory {
  private static strategies: Map<TypeShape, ShapeStrategy<any>> = new Map();
  private static initialized = false;

  private static ensureInitialized(): void {
    if (!this.initialized) {
      this.registerStrategy(new RectStrategy());
      this.registerStrategy(new EllipseStrategy());
      this.registerStrategy(new LineStrategy());
      this.registerStrategy(new ArrowStrategy());
      this.registerStrategy(new PolylineStrategy());
      this.registerStrategy(new TextStrategy());
      this.registerStrategy(new NoteStrategy());
      this.initialized = true;
    }
  }

  public static registerStrategy(strategy: ShapeStrategy<any>): void {
    this.strategies.set(strategy.type, strategy);
  }

  public static getStrategy<T extends ShapeData = ShapeData>(type: TypeShape): ShapeStrategy<T> {
    this.ensureInitialized();
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`[ShapeEngineFactory] No strategy registered for shape type: ${type}`);
    }
    return strategy as ShapeStrategy<T>;
  }
}
