// JavaScript version of VoiceWavesComponent and engine logic
import React, { useEffect, useRef, useCallback } from "react";

class WaveCurve {
  constructor(opt) {
    this.controller = opt.controller;
    this.color = opt.color;
    this.tick = 0;
    this.amplitude = 0;
    this.seed = 0;
    this.open_class = 0;
    this.respawn();
  }

  respawn() {
    this.amplitude = 0.3 + Math.random() * 0.7;
    this.seed = Math.random();
    this.open_class = 2 + Math.random() * 3;
  }

  equation(i) {
    const p = this.tick;
    const y =
      -1 *
      Math.abs(Math.sin(p)) *
      (this.controller.amplitude * this.amplitude) *
      this.controller.MAX *
      (1 / Math.pow(1 + Math.pow(this.open_class * i, 2), 2));
    if (Math.abs(y) < 0.001) {
      this.respawn();
    }
    return y;
  }

  drawWave(m) {
    this.tick +=
      this.controller.speed * (1 - 0.5 * Math.sin(this.seed * Math.PI));
    const ctx = this.controller.ctx;
    ctx.beginPath();
    const xBase =
      this.controller.width / 2 +
      (-this.controller.width / 4 + this.seed * (this.controller.width / 2));
    const yBase = this.controller.height / 2;
    let x, y, xInit;
    let i = -3;
    while (i <= 3) {
      x = xBase + (i * this.controller.width) / 4;
      y = yBase + m * this.equation(i);
      xInit = xInit || x;
      ctx.lineTo(x, y);
      i += 0.01;
    }
    const h = Math.abs(this.equation(0));
    const gradient = ctx.createRadialGradient(
      xBase,
      yBase,
      h * 1.15,
      xBase,
      yBase,
      h * 0.3
    );
    gradient.addColorStop(0, `rgba(${this.color.join(",")},0.4)`);
    gradient.addColorStop(1, `rgba(${this.color.join(",")},0.2)`);
    ctx.fillStyle = gradient;
    ctx.lineTo(xInit, yBase);
    ctx.closePath();
    ctx.fill();
  }

  draw() {
    this.drawWave(-1);
    this.drawWave(1);
  }
}

class VoiceWaves {
  constructor(opt) {
    this.opt = opt;
    this.run = false;
    this.animationId = null;
    this.ratio = this.opt.ratio || window.devicePixelRatio || 1;
    this.width = this.ratio * (this.opt.width || 320);
    this.height = this.ratio * (this.opt.height || 100);
    this.MAX = this.height / 2;
    this.speed = this.opt.speed || 0.1;
    this.amplitude = this.opt.amplitude || 1;
    this.canvas = this.opt.canvas;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.width = `${this.width / this.ratio}px`;
    this.canvas.style.height = `${this.height / this.ratio}px`;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context from canvas");
    }
    this.ctx = ctx;
    this.curves = [];
    this.colors = this.opt.colors || [
      [147, 51, 234],
      [168, 85, 247],
      [196, 125, 255],
      [139, 69, 189],
      [124, 58, 237],
    ];
    this.init();
  }

  init() {
    for (let i = 0; i < this.colors.length; i++) {
      const color = this.colors[i];
      const curveCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < curveCount; j++) {
        this.curves.push(new WaveCurve({ controller: this, color }));
      }
    }
    if (this.opt.autostart) {
      this.start();
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  draw() {
    if (!this.run) return;
    this.clear();
    for (let i = 0; i < this.curves.length; i++) {
      this.curves[i].draw();
    }
    this.animationId = requestAnimationFrame(() => this.draw());
  }

  start() {
    this.run = true;
    this.draw();
  }

  stop() {
    this.run = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy() {
    this.stop();
    if (this.canvas?.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

export function VoiceWavesComponent({
  width = 200,
  height = 40,
  speed = 0.2,
  amplitude = 1,
  autostart = true,
  colors = null,
  className = "",
  style = {},
}) {
  const canvasRef = useRef(null);
  const voiceWavesRef = useRef(null);

  const initializeWaves = useCallback(() => {
    if (canvasRef.current) {
      if (voiceWavesRef.current) {
        voiceWavesRef.current.destroy();
        voiceWavesRef.current = null;
      }

      const options = {
        canvas: canvasRef.current,
        width,
        height,
        speed,
        amplitude,
        autostart,
        colors,
      };

      voiceWavesRef.current = new VoiceWaves(options);
    }
  }, [width, height, speed, amplitude, autostart, colors]);

  useEffect(() => {
    const timer = setTimeout(() => {
      initializeWaves();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (voiceWavesRef.current) {
        voiceWavesRef.current.destroy();
        voiceWavesRef.current = null;
      }
    };
  }, [initializeWaves]);

  useEffect(() => {
    if (voiceWavesRef.current) {
      voiceWavesRef.current.speed = speed;
      voiceWavesRef.current.amplitude = amplitude;
    }
  }, [speed, amplitude]);

  return (
    <div
      className={`voice-waves-container ${className}`}
      style={{
        ...style,
        width: `${width}px`,
        height: `${height}px`,
        position: "relative",
        overflow: "visible",
      }}
    >
      <canvas
        ref={canvasRef}
        className="voice-waves-canvas"
        width={width}
        height={height}
        style={{
          display: "block",
          width: `${width}px`,
          height: `${height}px`,
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
}
