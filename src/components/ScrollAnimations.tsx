import React, { ReactNode, CSSProperties, useState, useEffect } from "react";
import { useScrollAnimation, useParallax } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

type AnimationType = 
  | "fade-up" 
  | "fade-down" 
  | "fade-left" 
  | "fade-right" 
  | "zoom-in" 
  | "zoom-out"
  | "flip-up"
  | "blur-in";

interface AnimatedSectionProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
  /** If true, element starts visible and animates on page load instead of scroll */
  animateOnLoad?: boolean;
}

const animationStyles: Record<AnimationType, { initial: CSSProperties; animate: CSSProperties }> = {
  "fade-up": {
    initial: { opacity: 0, transform: "translateY(20px)" },
    animate: { opacity: 1, transform: "translateY(0)" },
  },
  "fade-down": {
    initial: { opacity: 0, transform: "translateY(-20px)" },
    animate: { opacity: 1, transform: "translateY(0)" },
  },
  "fade-left": {
    initial: { opacity: 0, transform: "translateX(-20px)" },
    animate: { opacity: 1, transform: "translateX(0)" },
  },
  "fade-right": {
    initial: { opacity: 0, transform: "translateX(20px)" },
    animate: { opacity: 1, transform: "translateX(0)" },
  },
  "zoom-in": {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  "zoom-out": {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  "flip-up": {
    initial: { opacity: 0, transform: "translateY(15px)" },
    animate: { opacity: 1, transform: "translateY(0)" },
  },
  "blur-in": {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
};

export function AnimatedSection({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 0.6,
  className,
  threshold = 0.1,
  animateOnLoad = false,
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold });
  const styles = animationStyles[animation];
  const [hasAnimated, setHasAnimated] = useState(false);
  const [mounted, setMounted] = useState(false);

  // For animateOnLoad, trigger animation after mount
  useEffect(() => {
    if (animateOnLoad) {
      // Small delay to ensure CSS transition works
      const timer = setTimeout(() => setMounted(true), 50);
      return () => clearTimeout(timer);
    }
  }, [animateOnLoad]);

  useEffect(() => {
    if ((isVisible || (animateOnLoad && mounted)) && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isVisible, hasAnimated, animateOnLoad, mounted]);

  // Determine visibility: for animateOnLoad use mounted state, otherwise use scroll visibility
  const shouldAnimate = animateOnLoad ? mounted : isVisible;
  const currentStyles = hasAnimated || shouldAnimate ? styles.animate : styles.initial;

  return (
    <div
      ref={animateOnLoad ? undefined : ref}
      className={className}
      style={{
        ...currentStyles,
        transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerContainer({ children, staggerDelay = 0.1, className }: StaggerContainerProps) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={index}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(30px)",
                transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * staggerDelay}s`,
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxSection({ children, speed = 0.3, className }: ParallaxSectionProps) {
  const { ref, offset } = useParallax(speed);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      <div style={{ transform: `translateY(${offset}px)` }}>{children}</div>
    </div>
  );
}

interface TextRevealProps {
  text: string;
  className?: string;
  wordDelay?: number;
}

export function TextReveal({ text, className, wordDelay = 0.05 }: TextRevealProps) {
  const { ref, isVisible } = useScrollAnimation();
  const words = text.split(" ");

  return (
    <span ref={ref} className={className}>
      {words.map((word, index) => (
        <span
          key={index}
          className="inline-block overflow-hidden"
          style={{ marginRight: "0.25em" }}
        >
          <span
            className="inline-block"
            style={{
              transform: isVisible ? "translateY(0)" : "translateY(100%)",
              opacity: isVisible ? 1 : 0,
              transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * wordDelay}s`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({ end, duration = 2, prefix = "", suffix = "", className }: CountUpProps) {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <span ref={ref} className={className}>
      <span
        style={{
          display: "inline-block",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {prefix}
        <CountNumber end={end} duration={duration} isVisible={isVisible} />
        {suffix}
      </span>
    </span>
  );
}

function CountNumber({ end, duration, isVisible }: { end: number; duration: number; isVisible: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, end, duration]);

  return <>{count}</>;
}
