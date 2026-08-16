"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  variant?: "up" | "down" | "left" | "right" | "scale" | "blur";
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number | "some" | "all";
  className?: string;
}

export function FadeIn({
  children,
  variant = "up",
  delay = 0,
  duration = 0.5,
  once = true,
  amount = 0.2,
  className = "",
}: FadeInProps) {
  const shouldReduceMotion = useReducedMotion();

  const getVariants = (): Variants => {
    if (shouldReduceMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2, delay } },
      };
    }

    switch (variant) {
      case "up":
        return {
          hidden: { opacity: 0, y: 24 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration, delay, ease: [0.21, 0.47, 0.32, 0.98] },
          },
        };
      case "down":
        return {
          hidden: { opacity: 0, y: -24 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration, delay, ease: [0.21, 0.47, 0.32, 0.98] },
          },
        };
      case "left":
        return {
          hidden: { opacity: 0, x: 30 },
          visible: {
            opacity: 1,
            x: 0,
            transition: { duration, delay, ease: [0.21, 0.47, 0.32, 0.98] },
          },
        };
      case "right":
        return {
          hidden: { opacity: 0, x: -30 },
          visible: {
            opacity: 1,
            x: 0,
            transition: { duration, delay, ease: [0.21, 0.47, 0.32, 0.98] },
          },
        };
      case "scale":
        return {
          hidden: { opacity: 0, scale: 0.94 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: { duration, delay, ease: [0.21, 0.47, 0.32, 0.98] },
          },
        };
      case "blur":
        return {
          hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
          visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration, delay, ease: [0.21, 0.47, 0.32, 0.98] },
          },
        };
      default:
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration, delay } },
        };
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={getVariants()}
      className={className}
    >
      {children}
    </motion.div>
  );
}
