import React from "react";

export default function HUDControls({ running, setRunning, globalSpeed, setGlobalSpeed, resetView }) {
  return (
    <div className="absolute left-4 bottom-6 bg-black bg-opacity-50 p-3 rounded-lg flex items-center gap-3">
      <button
        onClick={() => setRunning(!running)}
        className="px-3 py-1 rounded bg-white bg-opacity-10 hover:bg-opacity-20"
      >
        {running ? "Pause" : "Play"}
      </button>

      <div className="flex items-center gap-2">
        <label className="text-xs">Speed</label>
        <input
          type="range"
          min="0.1"
          max="4"
          step="0.1"
          value={globalSpeed}
          onChange={(e) => setGlobalSpeed(Number(e.target.value))}
        />
      </div>

      <button
        onClick={resetView}
        className="px-3 py-1 rounded bg-white bg-opacity-10 hover:bg-opacity-20 text-xs"
      >
        Reset
      </button>
    </div>
  );
}
