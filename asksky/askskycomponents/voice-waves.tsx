import React, { useEffect, useRef, useCallback } from "react";

interface WaveCurveOptions {
  controller: VoiceWaves;
  color: [number, number, number];
}

class WaveCurve {
  private controller: VoiceWaves;
  private color: [number, number, number];
  private tick: number;
  private amplitude: number = 0;
  private seed: number = 0;
  private open_class: number = 0;

  constructor(opt: WaveCurveOptions) {
    this.controller = opt.controller;
    this.color = opt.color;
    this.tick = 0;

    this.respawn();
  }

  private respawn(): void {
    this.amplitude = 0.3 + Math.random() * 0.7;
    this.seed = Math.random();
    this.open_class = 2 + Math.random() * 3;
  }

  private equation(i: number): number {
    const p = this.tick;
    const y =
      -1 *
      Math.abs(Math.sin(p)) *
      (this.controller.amplitude * this.amplitude) *
      this.controller.MAX *
      (1 / (1 + (this.open_class * i) ** 2) ** 2);
    if (Math.abs(y) < 0.001) {
      this.respawn();
    }
    return y;
  }

  private drawWave(m: number): void {
    this.tick +=
      this.controller.speed * (1 - 0.5 * Math.sin(this.seed * Math.PI));
    const ctx = this.controller.ctx;
    ctx.beginPath();
    const xBase =
      this.controller.width / 2 +
      (-this.controller.width / 4 + this.seed * (this.controller.width / 2));
    const yBase = this.controller.height / 2;
    let x: number;
    let y: number;
    let xInit: number | undefined;
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
      h * 0.3,
    );
    gradient.addColorStop(0, `rgba(${this.color.join(",")},0.4)`);
    gradient.addColorStop(1, `rgba(${this.color.join(",")},0.2)`);
    ctx.fillStyle = gradient;
    ctx.lineTo(xInit!, yBase);
    ctx.closePath();
    ctx.fill();
  }

  draw(): void {
    this.drawWave(-1);
    this.drawWave(1);
  }
}

interface VoiceWavesOptions {
  canvas: HTMLCanvasElement;
  width?: number;
  height?: number;
  ratio?: number;
  speed?: number;
  amplitude?: number;
  autostart?: boolean;
  colors?: [number, number, number][] | null;
}

class VoiceWaves {
  private opt: VoiceWavesOptions;
  private run: boolean;
  private animationId: number | null;
  public ratio: number;
  public width: number;
  public height: number;
  public MAX: number;
  public speed: number;
  public amplitude: number;
  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public curves: WaveCurve[];
  private colors: [number, number, number][];

  constructor(opt: VoiceWavesOptions) {
    this.opt = opt;
    this.run = false;
    this.animationId = null;

    // UI vars
    this.ratio = this.opt.ratio || window.devicePixelRatio || 1;
    this.width = this.ratio * (this.opt.width || 320);
    this.height = this.ratio * (this.opt.height || 100);
    this.MAX = this.height / 2;
    this.speed = this.opt.speed || 0.1;
    this.amplitude = this.opt.amplitude || 1;

    // Canvas
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

    // Create curves
    this.curves = [];

    // Purple color scheme
    this.colors = this.opt.colors || [
      [147, 51, 234], // Purple-600
      [168, 85, 247], // Purple-500
      [196, 125, 255], // Purple-400
      [139, 69, 189], // Dark purple
      [124, 58, 237], // Violet-600
    ];

    this.init();
  }

  private init(): void {
    for (let i = 0; i < this.colors.length; i += 1) {
      const color = this.colors[i];
      const curveCount = Math.floor(Math.random() * 3) + 1; // 1-3 curves per color
      for (let j = 0; j < curveCount; j += 1) {
        this.curves.push(
          new WaveCurve({
            controller: this,
            color,
          }),
        );
      }
    }
    if (this.opt.autostart) {
      this.start();
    }
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  private draw(): void {
    if (this.run === false) return;
    this.clear();

    const len = this.curves.length;
    for (let i = 0; i < len; i += 1) {
      this.curves[i].draw();
    }
    this.animationId = requestAnimationFrame(() => this.draw());
  }

  start(): void {
    this.run = true;
    this.draw();
  }

  stop(): void {
    this.run = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy(): void {
    this.stop();
    if (this.canvas?.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

interface VoiceWavesComponentProps {
  width?: number;
  height?: number;
  speed?: number;
  amplitude?: number;
  autostart?: boolean;
  colors?: [number, number, number][] | null;
  className?: string;
  style?: React.CSSProperties;
}

export const VoiceWavesComponent: React.FC<VoiceWavesComponentProps> = ({
  width = 250,
  height = 40,
  speed = 0.2,
  amplitude = 1,
  autostart = true,
  colors = null,
  className = "",
  style = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const voiceWavesRef = useRef<VoiceWaves | null>(null);

  const initializeWaves = useCallback(() => {
    if (canvasRef.current) {
      // Clean up existing instance if it exists
      if (voiceWavesRef.current) {
        voiceWavesRef.current.destroy();
        voiceWavesRef.current = null;
      }

      const options: VoiceWavesOptions = {
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
};
