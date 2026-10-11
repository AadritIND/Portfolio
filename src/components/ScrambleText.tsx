import { useCallback, useEffect, useRef, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}=+*^?#@$%&01";

/**
 * Text scramble — letters resolve from random glyphs on mount and re-run
 * on hover. Small decoder-ring effect for display headlines.
 */
export default function ScrambleText({
  text,
  className = "",
  duration = 22,
}: {
  text: string;
  className?: string;
  /** frames the reveal takes */
  duration?: number;
}) {
  const [display, setDisplay] = useState(text);
  const frame = useRef(0);
  const raf = useRef<number>(0);

  const run = useCallback(() => {
    cancelAnimationFrame(raf.current);
    frame.current = 0;
    const step = () => {
      frame.current += 1;
      const progress = frame.current / duration;
      setDisplay(
        text
          .split("")
          .map((ch, i) => {
            if (ch === " ") return " ";
            if (i / text.length < progress) return ch;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join(""),
      );
      if (frame.current < duration) {
        raf.current = requestAnimationFrame(step);
      } else {
        setDisplay(text);
      }
    };
    raf.current = requestAnimationFrame(step);
  }, [text, duration]);

  useEffect(() => {
    run();
    return () => cancelAnimationFrame(raf.current);
  }, [run]);

  return (
    <span className={className} onMouseEnter={run} aria-label={text}>
      {display}
    </span>
  );
}
