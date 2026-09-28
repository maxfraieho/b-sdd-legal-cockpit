import React, { useEffect, useRef } from "react";

interface AudioWaveformVisualizerProps {
  isRecording: boolean;
  audioStream?: MediaStream | null;
  className?: string;
}

export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = ({
  isRecording,
  audioStream,
  className = "w-full h-20",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (isRecording && audioStream) {
      try {
        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const source = audioCtx.createMediaStreamSource(audioStream);
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;
        sourceRef.current = source;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          animationFrameRef.current = requestAnimationFrame(draw);
          analyser.getByteFrequencyData(dataArray);

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const barWidth = (canvas.width / bufferLength) * 1.5;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
            const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            gradient.addColorStop(0, "#10B981");
            gradient.addColorStop(0.6, "#3B82F6");
            gradient.addColorStop(1, "#F59E0B");

            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
            x += barWidth;
          }
        };

        draw();
      } catch (err) {
        console.warn("Web Audio API initialization error:", err);
      }
    } else {
      // Draw gentle idle or simulated waveform
      let phase = 0;
      const drawIdle = () => {
        animationFrameRef.current = requestAnimationFrame(drawIdle);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        phase += 0.05;

        const numBars = 32;
        const barWidth = canvas.width / numBars;

        for (let i = 0; i < numBars; i++) {
          const height = isRecording
            ? (Math.sin(phase + i * 0.3) * 0.4 + 0.5) * canvas.height * 0.8
            : (Math.sin(phase + i * 0.2) * 0.15 + 0.2) * canvas.height * 0.3;

          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, isRecording ? "#EF4444" : "#1E293B");
          gradient.addColorStop(1, isRecording ? "#F59E0B" : "#334155");

          ctx.fillStyle = gradient;
          ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 2, height);
        }
      };

      drawIdle();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch {
          // ignore
        }
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        try {
          audioContextRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, [isRecording, audioStream]);

  return (
    <div className={`relative bg-[#070B14] rounded-xl border border-slate-800 p-2 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        width={400}
        height={80}
        className="w-full h-full block"
      />
    </div>
  );
};
