import { useRef } from "react";

interface PinInputProps {
  length: 4 | 6;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

export const PinInput = ({ length, value, onChange, autoFocus, disabled }: PinInputProps) => {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (idx: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const arr = Array.from({ length }, (_, i) => value[i] ?? "");
    arr[idx] = digit;
    const next = arr.join("");
    onChange(next);
    if (digit && idx < length - 1) {
      refs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (value[idx]) {
        const arr = Array.from({ length }, (_, i) => value[i] ?? "");
        arr[idx] = "";
        onChange(arr.join(""));
      } else if (idx > 0) {
        refs.current[idx - 1]?.focus();
        const arr = Array.from({ length }, (_, i) => value[i] ?? "");
        arr[idx - 1] = "";
        onChange(arr.join(""));
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      refs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < length - 1) {
      refs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted.padEnd(length, "").slice(0, length).replace(/^(\S*)/, (m) => m));
    onChange(pasted);
    const nextIdx = Math.min(pasted.length, length - 1);
    refs.current[nextIdx]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { refs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[idx] ?? ""}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onFocus={(e) => e.target.select()}
          autoFocus={autoFocus && idx === 0}
          disabled={disabled}
          className="w-12 h-14 text-center text-2xl font-bold border-2 border-border rounded-xl bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors disabled:opacity-50 caret-transparent"
        />
      ))}
    </div>
  );
};
