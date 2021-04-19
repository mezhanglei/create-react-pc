// 返回边界内的位置
export const checkInContainer = (gridX: number, gridY: number, col: number, w: number) => {

    /**防止元素出container */
    if (gridX + w > col - 1) gridX = col - w //右边界
    if (gridX < 0) gridX = 0//左边界
    if (gridY < 0) gridY = 0//上边界
    return { gridX, gridY }
}