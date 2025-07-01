export function random(max, min){
  if (typeof max !== "number") {
    return Math.random();
  }
  if (typeof min !== "number") {
    min = 0;
  }
  return Math.random() * (max - min) + min;
}