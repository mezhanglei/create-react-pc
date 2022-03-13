export interface BoundingRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
// 事件对象是否在目标范围内
export const isMoveIn = (event: { x: number, y: number }, other: BoundingRect) => {

  const eventX = event?.x;
  const eventY = event?.y;

  return !(eventX - other?.left < 0 || eventY - other?.top < 0 || eventX - other?.right > 0 || eventY - other?.bottom > 0)
};

// 点距离目标内的四条边的最短距离
export function getMinDistance(event: { x: number, y: number }, other: BoundingRect) {
  const distances = [Math.floor(event.x - other.left), Math.floor(event.y - other?.top), Math.floor(other?.bottom - event?.y), Math.floor(other?.right - event.x)];
  const minDistance = Math.min.apply(Math, distances);
  return minDistance;
};
