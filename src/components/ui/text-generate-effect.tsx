"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
  textClassName,
  startDelay = 0,
  bold = true,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
  textClassName?: string;
  startDelay?: number;
  bold?: boolean;
}) => {
  const [scope, animate] = useAnimate();
  let wordsArray = words.split(" ");
  useEffect(() => {
    const node = (scope as any)?.current as HTMLElement | null;
    const showAllFallback = () => {
      if (!node) return;
      node.querySelectorAll('span').forEach((el) => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.filter = 'none';
      });
    };

    try {
      animate(
        "span",
        {
          opacity: 1,
          filter: filter ? "blur(0px)" : "none",
        },
        {
          duration: duration ?? 1,
          delay: stagger(0.2, { startDelay }),
        }
      );
    } catch {
      showAllFallback();
    }
  }, [scope, animate, filter, duration, startDelay]);

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className="opacity-0"
              style={{
                filter: filter ? "blur(10px)" : "none",
              }}
            >
              {word}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={cn(bold ? "font-bold" : "", className)}>
      <div className="mt-4">
        <div className={cn("text-2xl leading-snug tracking-wide", textClassName)}>
          {renderWords()}
        </div>
      </div>
    </div>
  );
};
