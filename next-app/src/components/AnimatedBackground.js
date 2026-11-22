"use client";

export default function AnimatedBackground({ mode }) {
  return (
    <div
      className={`app-background app-background--${mode}`}
      aria-hidden="true"
    />
  );
}
