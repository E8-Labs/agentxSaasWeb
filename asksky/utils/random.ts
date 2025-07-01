export function random(max?: number, min?: number): number {
  if (typeof max !== "number") {
    return Math.random();
  }
  if (typeof min !== "number") {
    min = 0;
  }
  return Math.random() * (max - min) + min;
}