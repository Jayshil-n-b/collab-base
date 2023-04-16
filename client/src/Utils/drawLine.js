function drawLineStandalone(start, end, ctx, color, width) {
  start = start ?? end;
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.arc(end.x, end.y, 2, 0, 2 * Math.PI);
  ctx.arc(start.x, start.y, 2, 0, 2 * Math.PI);
  ctx.fill();
}

export { drawLineStandalone };
