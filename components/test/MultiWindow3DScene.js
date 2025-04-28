import { useEffect, useRef } from "react";
import * as THREE from "three";

class WindowManager {
  #windows;
  #count;
  #id;
  #winData;
  #winShapeChangeCallback;
  #winChangeCallback;

  constructor() {
    let that = this;

    addEventListener("storage", (event) => {
      if (event.key === "windows") {
        let newWindows = JSON.parse(event.newValue);
        let winChange = that.#didWindowsChange(that.#windows, newWindows);
        that.#windows = newWindows;
        if (winChange && that.#winChangeCallback) that.#winChangeCallback();
      }
    });

    window.addEventListener("beforeunload", function () {
      let index = that.getWindowIndexFromId(that.#id);
      that.#windows.splice(index, 1);
      that.updateWindowsLocalStorage();
    });
  }

  #didWindowsChange(pWins, nWins) {
    if (pWins.length !== nWins.length) return true;
    for (let i = 0; i < pWins.length; i++) {
      if (pWins[i].id !== nWins[i].id) return true;
    }
    return false;
  }

  init(metaData) {
    this.#windows = JSON.parse(localStorage.getItem("windows")) || [];
    this.#count = Number(localStorage.getItem("count")) || 0;
    this.#count++;
    this.#id = this.#count;
    let shape = this.getWinShape();
    this.#winData = { id: this.#id, shape, metaData };
    this.#windows.push(this.#winData);
    localStorage.setItem("count", this.#count);
    this.updateWindowsLocalStorage();
  }

  getWinShape() {
    return {
      x: window.screenLeft,
      y: window.screenTop,
      w: window.innerWidth,
      h: window.innerHeight,
    };
  }

  getWindowIndexFromId(id) {
    return this.#windows.findIndex((w) => w.id === id);
  }

  updateWindowsLocalStorage() {
    localStorage.setItem("windows", JSON.stringify(this.#windows));
  }

  update() {
    let winShape = this.getWinShape();
    if (
      winShape.x !== this.#winData.shape.x ||
      winShape.y !== this.#winData.shape.y ||
      winShape.w !== this.#winData.shape.w ||
      winShape.h !== this.#winData.shape.h
    ) {
      this.#winData.shape = winShape;
      let index = this.getWindowIndexFromId(this.#id);
      this.#windows[index].shape = winShape;
      if (this.#winShapeChangeCallback) this.#winShapeChangeCallback();
      this.updateWindowsLocalStorage();
    }
  }

  setWinShapeChangeCallback(callback) {
    this.#winShapeChangeCallback = callback;
  }

  setWinChangeCallback(callback) {
    this.#winChangeCallback = callback;
  }

  getWindows() {
    return this.#windows;
  }

  getThisWindowData() {
    return this.#winData;
  }
}

const MultiWindow3DScene = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const t = THREE;
    const pixR = window.devicePixelRatio || 1;
    let camera, scene, renderer, world;
    let cubes = [];
    let sceneOffsetTarget = { x: 0, y: 0 };
    let sceneOffset = { x: 0, y: 0 };

    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let todayTime = today.getTime();

    const getTime = () => (new Date().getTime() - todayTime) / 1000.0;

    const windowManager = new WindowManager();
    windowManager.setWinShapeChangeCallback(() => updateWindowShape());
    windowManager.setWinChangeCallback(() => windowsUpdated());
    windowManager.init({});

    setupScene();
    windowsUpdated();
    updateWindowShape(false);

    window.addEventListener("resize", resize);
    render();

    function setupScene() {
      camera = new t.OrthographicCamera(
        0,
        window.innerWidth,
        0,
        window.innerHeight,
        -10000,
        10000
      );
      camera.position.z = 2.5;
      scene = new t.Scene();
      scene.background = new t.Color(0x000000);
      scene.add(camera);

      renderer = new t.WebGLRenderer({ antialias: true, depthBuffer: true });
      renderer.setPixelRatio(pixR);
      containerRef.current.appendChild(renderer.domElement);

      world = new t.Object3D();
      scene.add(world);

      resize();
    }

    function windowsUpdated() {
      updateNumberOfCubes();
    }

    function updateNumberOfCubes() {
      let wins = windowManager.getWindows();
      cubes.forEach((c) => world.remove(c));
      cubes = [];

      for (let i = 0; i < wins.length; i++) {
        let win = wins[i];
        let color = new t.Color();
        color.setHSL(i * 0.1, 1.0, 0.5);
        let s = 100 + i * 50;
        let cube = new t.Mesh(
          new t.BoxGeometry(s, s, s),
          new t.MeshBasicMaterial({ color, wireframe: true })
        );
        cube.position.x = win.shape.x + win.shape.w * 0.5;
        cube.position.y = win.shape.y + win.shape.h * 0.5;
        world.add(cube);
        cubes.push(cube);
      }
    }

    function updateWindowShape(easing = true) {
      sceneOffsetTarget = { x: -window.screenX, y: -window.screenY };
      if (!easing) sceneOffset = sceneOffsetTarget;
    }

    function render() {
      let t = getTime();
      windowManager.update();

      let falloff = 0.05;
      sceneOffset.x += (sceneOffsetTarget.x - sceneOffset.x) * falloff;
      sceneOffset.y += (sceneOffsetTarget.y - sceneOffset.y) * falloff;

      world.position.x = sceneOffset.x;
      world.position.y = sceneOffset.y;

      let wins = windowManager.getWindows();
      for (let i = 0; i < cubes.length; i++) {
        let cube = cubes[i];
        let win = wins[i];
        let posTarget = {
          x: win.shape.x + win.shape.w * 0.5,
          y: win.shape.y + win.shape.h * 0.5,
        };
        cube.position.x += (posTarget.x - cube.position.x) * falloff;
        cube.position.y += (posTarget.y - cube.position.y) * falloff;
        cube.rotation.x = t * 0.5;
        cube.rotation.y = t * 0.3;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }

    function resize() {
      let width = window.innerWidth;
      let height = window.innerHeight;
      camera.left = 0;
      camera.right = width;
      camera.top = 0;
      camera.bottom = height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
    />
  );
};

export default MultiWindow3DScene;
