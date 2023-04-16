import React, { useEffect, useRef, useState } from "react";
import { useOnDraw } from "../../hooks/DrawHook";
import { drawLineStandalone } from "../../Utils/drawLine";
import socketInit from "../../Socket";
import styles from "./Canvas.module.css";
const colors = ["#00FF00", "#0000FF", "#FFFFFF", "#FF0000"];

const canvasStyle = {
  border: "1px solid black",
};

function Canvas({ fileId, width, height, user }) {
  console.log({ canvas: fileId });
  const [setCanvasRef, eraseCanvas, canvasRef] = useOnDraw(onDraw);
  const color = useRef("#00FF00");
  const loading = useRef(true);
  const socket = useRef(null);

  // Function to draw in all connected peers.
  function onDraw(ctx, point, prevPoint) {
    if (loading.current) return;
    drawLineStandalone(prevPoint, point, ctx, color.current, 5);
    socket.current.emit("put-line", fileId, prevPoint, point, color.current);
  }

  // Function to clear board in all connected peers.
  function clearBoard() {
    socket.current.emit("clear-board", fileId);
    eraseCanvas();
  }

  // universal useEffect
  useEffect(() => {
    if (!fileId) return;
    let interval;
    const ctx = canvasRef.current.getContext("2d");

    const initBoardCollaboration = async () => {
      // initialize socket.
      socket.current = socketInit();
      console.log(socket.current);

      // define listeners functions
      async function handleIncoming(prev, curr, color) {
        if (!ctx) return;
        drawLineStandalone(prev, curr, ctx, color, 5);
      }
      async function getCanvasState() {
        if (!canvasRef.current) return;
        socket.current.emit(
          "set-canvas-state",
          fileId,
          canvasRef.current.toDataURL()
        );
      }
      async function loadCanvas(content) {
        const img = new Image();
        img.src = content;
        img.onload = () => {
          ctx?.drawImage(img, 0, 0);
        };

        loading.current = false;
        const boardComponent = document.getElementById("boardComponent");
        boardComponent.classList.remove(styles.skeleton);

        interval = setInterval(
          () =>
            socket.current.emit(
              "save-board",
              fileId,
              canvasRef.current.toDataURL()
            ),
          5000
        );
      }

      // start listeners here.
      socket.current.emit("get-canvas", fileId);
      socket.current.emit("get-board", fileId);
      socket.current.once("load-canvas", loadCanvas);
      socket.current.on("clear-board", eraseCanvas);
      socket.current.on("put-line", handleIncoming);
      socket.current.on("get-canvas-state", getCanvasState);
    };

    initBoardCollaboration();

    // cleanup listeners here.
    return () => {
      socket.current.off("clear-board");
      socket.current.off("put-line");
      socket.current.off("get-canvas-state");
      clearInterval(interval);
      socket.current.disconnect();
      socket.current = null;
    };
  }, [fileId]);

  return (
    <div
      // style={{ height: "100vh" }}
      id="boardComponent"
      className={`${styles.skeleton} ${styles.boardWrapper}`}
    >
      <div className={styles.drawArea}>
        <canvas
          className={styles.customCanvas}
          width={width}
          height={height}
          style={canvasStyle}
          ref={setCanvasRef}
        />
      </div>
      <div className={styles.colorBox}>
        {colors.map((c, i) => {
          return (
            <button
              className={styles.btn}
              key={i}
              style={{ background: c }}
              onClick={() => {
                console.log(c);
                color.current = c;
              }}
            ></button>
          );
        })}
        <button className={styles.deleteButton} onClick={clearBoard}>
          <img
            className={styles.deleteButtonImage}
            src="\images\delete.png"
            alt=""
          />
        </button>
      </div>
    </div>
  );
}

export default Canvas;
