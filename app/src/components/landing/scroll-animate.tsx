"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollAnimateProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fade-up" | "fade-in" | "slide-left" | "slide-right" | "scale";
  delay?: number;
}

export function ScrollAnimate({ children, className = "", animation = "fade-up", delay = 0 }: ScrollAnimateProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  const animations = {
    "fade-up": {
      hidden: "opacity-0 translate-y-8",
      visible: "opacity-100 translate-y-0",
    },
    "fade-in": {
      hidden: "opacity-0",
      visible: "opacity-100",
    },
    "slide-left": {
      hidden: "opacity-0 -translate-x-8",
      visible: "opacity-100 translate-x-0",
    },
    "slide-right": {
      hidden: "opacity-0 translate-x-8",
      visible: "opacity-100 translate-x-0",
    },
    "scale": {
      hidden: "opacity-0 scale-95",
      visible: "opacity-100 scale-100",
    },
  };

  const anim = animations[animation];

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? anim.visible : anim.hidden} ${className}`}
    >
      {children}
    </div>
  );
}
