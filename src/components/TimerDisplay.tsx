import { formatTime } from '../utils/formatTime';
import { COUNTDOWN_WARN_THRESHOLD } from '../constants';

interface Props {
  timeRemainingMs: number;
  totalDurationMs: number;
  phase: 'idle' | 'exercise' | 'rest' | 'finished';
}

const RADIUS = 120;
const STROKE = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const VIEWBOX = (RADIUS + STROKE) * 2;

export function TimerDisplay({ timeRemainingMs, totalDurationMs, phase }: Props) {
  const seconds = Math.ceil(timeRemainingMs / 1000);
  const isWarn = seconds <= COUNTDOWN_WARN_THRESHOLD && seconds > 0 && phase !== 'idle' && phase !== 'finished';
  const fraction = totalDurationMs > 0 ? timeRemainingMs / totalDurationMs : 1;
  const offset = CIRCUMFERENCE * (1 - fraction);

  const strokeColor = phase === 'rest' ? '#f59e0b' : '#22c55e';
  const textColor = isWarn ? '#f87171' : strokeColor;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={VIEWBOX}
        height={VIEWBOX}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        className={`-rotate-90 ${isWarn ? 'animate-pulse' : ''}`}
      >
        {/* Background track */}
        <circle
          cx={VIEWBOX / 2}
          cy={VIEWBOX / 2}
          r={RADIUS}
          fill="none"
          stroke="#1e293b"
          strokeWidth={STROKE}
        />
        {/* Progress arc */}
        <circle
          cx={VIEWBOX / 2}
          cy={VIEWBOX / 2}
          r={RADIUS}
          fill="none"
          stroke={strokeColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.2s linear, stroke 0.3s ease' }}
        />
      </svg>
      {/* Timer text centered in donut */}
      <span
        className="absolute font-mono font-bold text-5xl tracking-tight tabular-nums"
        style={{ color: textColor }}
      >
        {formatTime(timeRemainingMs)}
      </span>
    </div>
  );
}
