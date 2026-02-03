/**
 * Grid pattern helper functions
 */

/**
 * Determines if a cell should be filled based on pattern type
 */
export function shouldFillCell(row, col, pattern, totalRows, totalCols) {
    switch (pattern) {
        case 'all':
            return true;
        case 'checkerboard':
            return (row + col) % 2 === 0;
        case 'diagonal':
            return row === col || row + col === totalRows - 1;
        case 'border':
            return row === 0 || row === totalRows - 1 || col === 0 || col === totalCols - 1;
        case 'odd-rows':
            return row % 2 === 0;
        case 'even-rows':
            return row % 2 === 1;
        case 'odd-cols':
            return col % 2 === 0;
        case 'even-cols':
            return col % 2 === 1;
        default:
            return false;
    }
}

/**
 * Calculates grid positions for motifs
 * Returns array of {x, y} positions
 */
export function calculateGridPositions(canvasWidth, canvasHeight, rows, cols, spacing, pattern) {
    const positions = [];

    // Calculate cell dimensions
    const totalSpacingX = spacing * (cols - 1);
    const totalSpacingY = spacing * (rows - 1);
    const cellWidth = (canvasWidth - totalSpacingX) / cols;
    const cellHeight = (canvasHeight - totalSpacingY) / rows;

    // Generate positions for each cell
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // Check if this cell should be filled based on pattern
            if (shouldFillCell(row, col, pattern, rows, cols)) {
                const x = col * (cellWidth + spacing) + cellWidth / 2;
                const y = row * (cellHeight + spacing) + cellHeight / 2;
                positions.push({ x, y, row, col });
            }
        }
    }

    return positions;
}

/**
 * Draws grid overlay on canvas
 */
export function drawGridOverlay(ctx, canvasWidth, canvasHeight, rows, cols, spacing) {
    if (!ctx) return;

    ctx.save();
    ctx.strokeStyle = 'rgba(147, 51, 234, 0.3)'; // Purple with transparency
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]); // Dashed line

    const totalSpacingX = spacing * (cols - 1);
    const totalSpacingY = spacing * (rows - 1);
    const cellWidth = (canvasWidth - totalSpacingX) / cols;
    const cellHeight = (canvasHeight - totalSpacingY) / rows;

    // Draw vertical lines
    for (let col = 0; col <= cols; col++) {
        const x = col * (cellWidth + spacing);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }

    // Draw horizontal lines
    for (let row = 0; row <= rows; row++) {
        const y = row * (cellHeight + spacing);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
    }

    ctx.restore();
}
