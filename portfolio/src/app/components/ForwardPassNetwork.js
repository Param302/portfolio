"use client";

import { useEffect, useRef, useState } from "react";

function buildNetwork(width, height) {
  const mobile = width < 640;
  const tablet = width < 1024;
  const layerSizes = mobile
    ? [3, 4, 5, 4, 3]
    : tablet
      ? [4, 5, 6, 5, 4, 3]
      : [4, 5, 6, 6, 5, 4, 3];

  const paddingX = mobile ? 32 : 56;
  const paddingY = mobile ? 84 : 92;
  const layerGap = (width - paddingX * 2) / Math.max(layerSizes.length - 1, 1);
  const layers = [];
  const nodes = [];

  layerSizes.forEach((count, layerIndex) => {
    const layerNodes = [];
    const x = paddingX + layerGap * layerIndex;
    const baseGap = (height - paddingY * 2) / Math.max(count - 1, 1);

    for (let index = 0; index < count; index += 1) {
      const jitter = ((index % 2 === 0 ? -1 : 1) * (14 + layerIndex * 2)) + (layerIndex % 2 === 0 ? 8 : -8);
      const y =
        count === 1
          ? height / 2
          : paddingY + baseGap * index + jitter;

      const node = {
        id: `${layerIndex}-${index}`,
        x,
        y,
        layerIndex,
        glow: 0,
        lastTriggeredAt: -Infinity,
        outgoing: [],
      };

      layerNodes.push(node);
      nodes.push(node);
    }

    layers.push(layerNodes);
  });

  const edges = [];

  layers.slice(0, -1).forEach((layer, layerIndex) => {
    const nextLayer = layers[layerIndex + 1];

    layer.forEach((node, nodeIndex) => {
      const ratio = layer.length === 1 ? 0.5 : nodeIndex / (layer.length - 1);
      const primary = Math.round(ratio * (nextLayer.length - 1));
      const targets = new Set([
        primary,
        Math.max(0, primary - 1),
        Math.min(nextLayer.length - 1, primary + 1),
      ]);

      if ((layerIndex + nodeIndex) % 2 === 0) {
        targets.add(Math.min(nextLayer.length - 1, primary + 2));
      }

      [...targets]
        .slice(0, 3)
        .forEach((targetIndex) => {
          const edge = {
            startNode: node,
            endNode: nextLayer[targetIndex],
          };

          node.outgoing.push(edge);
          edges.push(edge);
        });
    });
  });

  return {
    nodes,
    edges,
    inputNodes: layers[0],
  };
}

export default function ForwardPassNetwork() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const networkRef = useRef({ nodes: [], edges: [], inputNodes: [] });
  const pulsesRef = useRef([]);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const [canHover, setCanHover] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const syncHover = () => setCanHover(mediaQuery.matches);

    syncHover();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", syncHover);
    } else {
      mediaQuery.addListener(syncHover);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", syncHover);
      } else {
        mediaQuery.removeListener(syncHover);
      }
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) {
      return undefined;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return undefined;
    }

    let frameId = 0;
    let width = 0;
    let height = 0;
    let previousTime = performance.now();
    let autoPulseTimer = 0;

    const resize = () => {
      const bounds = section.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = bounds.width;
      height = bounds.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      networkRef.current = buildNetwork(width, height);
      pulsesRef.current = [];
    };

    const triggerNode = (node, now) => {
      if (!node || now - node.lastTriggeredAt < 300) {
        return;
      }

      node.lastTriggeredAt = now;
      node.glow = 1;

      node.outgoing.forEach((edge, index) => {
        pulsesRef.current.push({
          edge,
          progress: 0,
          speed: 1 / 420,
          color: (node.layerIndex + index) % 2 === 0 ? "#1BB6E0" : "#FFEDD4",
        });
      });
    };

    const draw = (time) => {
      const delta = Math.min(32, time - previousTime);
      previousTime = time;

      ctx.clearRect(0, 0, width, height);

      const { nodes, edges, inputNodes } = networkRef.current;

      edges.forEach((edge) => {
        ctx.beginPath();
        ctx.moveTo(edge.startNode.x, edge.startNode.y);
        ctx.lineTo(edge.endNode.x, edge.endNode.y);
        ctx.strokeStyle = "rgba(226, 232, 240, 0.14)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      if (canHover && pointerRef.current.active) {
        inputNodes.forEach((node) => {
          const distance = Math.hypot(pointerRef.current.x - node.x, pointerRef.current.y - node.y);
          if (distance <= 40) {
            triggerNode(node, time);
          }
        });
      } else {
        autoPulseTimer += delta;
        if (autoPulseTimer >= 900 && inputNodes.length) {
          autoPulseTimer = 0;
          const randomNode = inputNodes[Math.floor(Math.random() * inputNodes.length)];
          triggerNode(randomNode, time);
        }
      }

      for (let index = pulsesRef.current.length - 1; index >= 0; index -= 1) {
        const pulse = pulsesRef.current[index];
        pulse.progress += delta * pulse.speed;

        if (pulse.progress >= 1) {
          triggerNode(pulse.edge.endNode, time);
          pulsesRef.current.splice(index, 1);
          continue;
        }

        const x =
          pulse.edge.startNode.x +
          (pulse.edge.endNode.x - pulse.edge.startNode.x) * pulse.progress;
        const y =
          pulse.edge.startNode.y +
          (pulse.edge.endNode.y - pulse.edge.startNode.y) * pulse.progress;

        ctx.beginPath();
        ctx.fillStyle = pulse.color;
        ctx.shadowBlur = 14;
        ctx.shadowColor = pulse.color;
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      nodes.forEach((node) => {
        node.glow = Math.max(0, node.glow - delta * 0.0025);
        const isWarm = node.layerIndex % 2 === 0;
        const glowColor = isWarm ? "#1BB6E0" : "#FFEDD4";

        ctx.beginPath();
        ctx.fillStyle =
          node.glow > 0
            ? glowColor
            : "rgba(226, 232, 240, 0.22)";
        if (node.glow > 0) {
          ctx.shadowBlur = 12 * node.glow;
          ctx.shadowColor = glowColor;
        }
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      frameId = window.requestAnimationFrame(draw);
    };

    resize();
    frameId = window.requestAnimationFrame(draw);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(section);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [canHover]);

  const handlePointerMove = (event) => {
    if (!canHover || !sectionRef.current) {
      return;
    }

    const bounds = sectionRef.current.getBoundingClientRect();
    pointerRef.current = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      active: true,
    };
  };

  const handlePointerLeave = () => {
    pointerRef.current.active = false;
  };

  return (
    <section className="w-full bg-ink-black py-16 sm:py-18 lg:py-20">
      <div
        ref={sectionRef}
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
        className="relative mx-auto min-h-[430px] max-w-7xl overflow-hidden rounded-[2.5rem] border border-prussian-blue/80 bg-ink-black px-6 py-8 sm:min-h-[500px] sm:px-8 sm:py-10 lg:min-h-[560px] lg:px-12 lg:py-12"
      >
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-0 h-full w-full"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-3xl">
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-sky-surge">
            Forward Pass
          </p>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-bright-snow sm:text-4xl lg:text-5xl">
            The route is missing, but the network is still processing.
          </h2>
          <p className="mt-5 font-description text-sm leading-7 text-bright-snow/72 sm:text-base">
            This canvas simulates forward propagation through a sparse deep network. Move close to the input layer on the left and trigger a cascade of cyan and peach pulses as the signal travels across the hidden layers.
          </p>
          <p className="mt-4 font-accent text-2xl italic text-papaya-whip sm:text-3xl">
            Sparse pathways. Layered activations. A clean forward sweep.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-prussian-blue px-4 py-2 font-description text-xs uppercase tracking-[0.18em] text-bright-snow/72">
              Input Layer
            </span>
            <span className="rounded-full border border-prussian-blue px-4 py-2 font-description text-xs uppercase tracking-[0.18em] text-bright-snow/72">
              Sparse Connections
            </span>
            <span className="rounded-full border border-prussian-blue px-4 py-2 font-description text-xs uppercase tracking-[0.18em] text-bright-snow/72">
              Forward Propagation
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
