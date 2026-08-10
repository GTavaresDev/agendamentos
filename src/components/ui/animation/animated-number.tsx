"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface AnimatedNumberProps {
  value: string; // Ex: "250+", "260+", "50", "100%"
  className?: string;
}

export function AnimatedNumber({ value, className = "" }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const shouldReduceMotion = useReducedMotion();

  // Extract number and suffix (ex: "250+" -> numeric 250, suffix "+")
  const numericMatch = value.match(/(\d+)/);
  const targetNumber = numericMatch ? parseInt(numericMatch[0], 10) : 0;
  const prefix = value.substring(0, value.indexOf(numericMatch ? numericMatch[0] : ""));
  const suffix = numericMatch
    ? value.substring(value.indexOf(numericMatch[0]) + numericMatch[0].length)
    : "";

  const [currentNumber, setCurrentNumber] = useState(shouldReduceMotion ? targetNumber : 0);

  useEffect(() => {
    if (!isInView || shouldReduceMotion || targetNumber === 0) {
      if (shouldReduceMotion) setCurrentNumber(targetNumber);
      return;
    }

    let startTimestamp: number | null = null;
    const duration = 1600; // ms

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // EaseOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCurrentNumber(Math.floor(easeProgress * targetNumber));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCurrentNumber(targetNumber);
      }
    };

    window.requestAnimationFrame(step);
  }, [isInView, targetNumber, shouldReduceMotion]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {currentNumber}
      {suffix}
    </span>
  );
}
