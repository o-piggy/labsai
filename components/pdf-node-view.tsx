"use client";

import { useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap, type Edge, type Node } from "reactflow";
import "reactflow/dist/style.css";

import type { PdfSummary } from "@/app/api/pdf-summary/schema";

function layoutNodes(summary: PdfSummary): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = summary.nodes.map((n, idx) => ({
    id: n.id,
    position: { x: (idx % 3) * 280, y: Math.floor(idx / 3) * 140 },
    data: {
      label: (
        <div className="space-y-1">
          <div className="text-sm font-semibold">{n.label}</div>
          <div className="text-xs text-muted-foreground">{n.detail}</div>
        </div>
      ),
    },
    style: {
      border: "1px solid hsl(var(--border))",
      background: "hsl(var(--card))",
      color: "hsl(var(--card-foreground))",
      borderRadius: 12,
      padding: 12,
      width: 260,
    },
  }));

  const edges: Edge[] = summary.edges.map((e, i) => ({
    id: `e-${i}-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    label: e.label ?? undefined,
    animated: false,
    style: { stroke: "hsl(var(--muted-foreground))" },
    labelStyle: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
  }));

  return { nodes, edges };
}

export function PdfNodeView({ summary }: { summary: PdfSummary }) {
  const graph = useMemo(() => layoutNodes(summary), [summary]);

  if (graph.nodes.length === 0) {
    return (
      <div className="flex h-[280px] w-full items-center justify-center rounded-xl border border-dashed bg-muted/20 text-sm text-muted-foreground">
        No concept-map nodes in this summary.
      </div>
    );
  }

  return (
    <div className="h-[520px] w-full overflow-hidden rounded-xl border bg-card">
      <ReactFlow nodes={graph.nodes} edges={graph.edges} fitView>
        <MiniMap zoomable pannable />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

