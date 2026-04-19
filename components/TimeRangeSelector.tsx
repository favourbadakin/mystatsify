"use client";
import { TimeRange, TIME_RANGE_LABELS } from "@/lib/spotify";

export default function TimeRangeSelector({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (r: TimeRange) => void;
}) {
  return (
    <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl w-fit max-w-full overflow-x-auto">
      {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            value === range
              ? "bg-[#1DB954] text-black shadow-lg shadow-[#1DB954]/20"
              : "text-[#6b6b6b] hover:text-white"
          }`}
        >
          {TIME_RANGE_LABELS[range].label}
        </button>
      ))}
    </div>
  );
}
