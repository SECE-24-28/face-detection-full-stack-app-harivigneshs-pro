"use client";

import { FormEvent, useRef, useState } from "react";

type Face = {
  // Luxand format
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
  // Generic format
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  [key: string]: unknown;
};

type DetectionResult = {
  detected: boolean;
  faceCount: number;
  faces: Face[];
};

type DetectionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: DetectionResult }
  | { status: "error"; message: string };

export function FaceDetector() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionState>({ status: "idle" });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setResult({ status: "idle" });

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  }

  function drawFaces(faces: Face[]) {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (faces.length === 0) return;

    faces.forEach((face, i) => {
      // Normalise to x/y/w/h (Luxand uses top/left/bottom/right)
      const x = face.x ?? face.left ?? 0;
      const y = face.y ?? face.top ?? 0;
      const w = face.width ?? ((face.right ?? 0) - (face.left ?? 0));
      const h = face.height ?? ((face.bottom ?? 0) - (face.top ?? 0));

      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = Math.max(2, canvas.width * 0.003);
      ctx.strokeRect(x, y, w, h);

      // Label background
      const label = `Face ${i + 1}`;
      ctx.font = `bold ${Math.max(14, canvas.width * 0.02)}px Inter, sans-serif`;
      const textWidth = ctx.measureText(label).width;
      const padding = 6;
      const labelHeight = Math.max(20, canvas.width * 0.025);

      ctx.fillStyle = "#22c55e";
      ctx.fillRect(x, y - labelHeight - 2, textWidth + padding * 2, labelHeight + 4);

      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, x + padding, y - 5);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setResult({ status: "error", message: "Please choose an image first." });
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);
    setResult({ status: "loading" });

    const response = await fetch("/api/detect", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      setResult({
        status: "error",
        message: data.error ?? "Face detection failed.",
      });
      return;
    }

    setResult({ status: "success", data });

    // Draw after image loads
    const img = imageRef.current;
    if (img && img.complete) {
      drawFaces(data.faces ?? []);
    } else if (img) {
      img.onload = () => drawFaces(data.faces ?? []);
    }
  }

  const successData = result.status === "success" ? result.data : null;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-800">
            Upload image
          </label>
          <input
            accept="image/*"
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-gray-700"
            onChange={handleFileChange}
            type="file"
          />
        </div>

        <button
          className="w-full rounded-md bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          disabled={result.status === "loading" || !selectedFile}
          type="submit"
        >
          {result.status === "loading" ? "Detecting…" : "Detect Face"}
        </button>
      </form>

      {/* Image preview + canvas overlay */}
      {previewUrl && (
        <div className="relative inline-block max-w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src={previewUrl}
            alt="Preview"
            className="max-w-full rounded-lg border border-gray-200"
            style={{ display: "block" }}
            onLoad={() => {
              // Re-draw if result already available
              if (successData) drawFaces(successData.faces ?? []);
            }}
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none rounded-lg"
          />
        </div>
      )}

      {/* Result banner */}
      {result.status === "success" && (
        <div
          className={`rounded-md border p-4 ${
            result.data.detected
              ? "border-emerald-200 bg-emerald-50"
              : "border-yellow-200 bg-yellow-50"
          }`}
        >
          <p
            className={`text-sm font-semibold ${
              result.data.detected ? "text-emerald-900" : "text-yellow-800"
            }`}
          >
            {result.data.detected
              ? `✅ ${result.data.faceCount} face${result.data.faceCount !== 1 ? "s" : ""} detected`
              : "⚠️ No face detected in this image"}
          </p>
        </div>
      )}

      {result.status === "error" && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {result.message}
        </div>
      )}
    </section>
  );
}
