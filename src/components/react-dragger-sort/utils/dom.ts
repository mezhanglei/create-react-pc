export interface BoundingRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
// 判断是否碰撞
export const isOverLay = (move: BoundingRect, other: BoundingRect) => {
  let l1 = move?.left
  let t1 = move?.top
  let r1 = move?.right
  let b1 = move?.bottom

  let l2 = other?.left
  let t2 = other?.top
  let r2 = other?.right
  let b2 = other?.bottom

  const otherW = other.right - other?.left;
  const otherH = other.bottom - other?.top;

  const maxX = Math.min(15, otherW / 4);
  const maxY = Math.min(15, otherH / 4);

  return !(r1 - l2 < maxX || b1 - t2 < maxY || r2 - l1 < maxX || b2 - t1 < maxY)
}

// 求两点之间的距离
export function getDistance(move: BoundingRect, other: BoundingRect) {
  const moveCenter = {
    x: move?.left + (move.right - move?.left) / 2,
    y: move?.top + (move.bottom - move?.top) / 2
  }
  const otherCenter = {
    x: other?.left + (other.right - other?.left) / 2,
    y: other?.top + (other.bottom - other?.top) / 2
  }

  const x = moveCenter.x - otherCenter.x;
  const y = moveCenter.y - otherCenter.y;
  return Math.sqrt(x * x + y * y)
}