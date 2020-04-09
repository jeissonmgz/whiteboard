export class Point {
  constructor(public x: number = null, public y: number = null) {}

  set(x: number | Point, y: number = null): Point {
    if (typeof x === "object") {
      return this.set(x.x, x.y);
    }
    this.x = Number(x);
    this.y = y;
    return this;
  }
  clone(): Point {
    return new Point(this.x, this.y);
  }
  equals(x: number | Point, y: number = null): boolean {
    let point = new Point().set(x, y);
    if (this.x !== point.x) {
      return false;
    }
    if (this.y !== point.y) {
      return false;
    }
    return true;
  }
  isZero(): boolean {
    if (this.x === 0 && this.y === 0) {
      return true;
    }
    return false;
  }
  difference(x: number | Point, y: number = null): Point {
    let point = new Point().set(x, y);
    return new Point().set(
      Math.abs(point.x - this.x),
      Math.abs(point.y - this.y)
    );
  }
}
