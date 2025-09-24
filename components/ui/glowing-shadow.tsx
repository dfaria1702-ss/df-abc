"use client"

import { type ReactNode } from "react"

interface GlowingShadowButtonProps {
  children: ReactNode
}

export function GlowingShadow({ children }: GlowingShadowButtonProps) {
  return (
    <>
      <style jsx global>{`
        .glow-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          cursor: pointer;
          width: 100%;
          height: 100%;
        }

        .glow-container:before {
          content: "";
          position: absolute;
          inset: -2px;
          padding: 2px;
          background: linear-gradient(45deg, 
            #ff0000, #ff7300, #fffb00, #48ff00, 
            #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000
          );
          border-radius: 12px;
          opacity: 0.8;
          background-size: 400% 400%;
          animation: glowing 4s ease infinite;
          z-index: -1;
        }

        .glow-content {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          overflow: hidden;
        }

        .glow-container:hover:before {
          opacity: 1;
          filter: blur(2px);
          animation-duration: 2s;
        }

        @keyframes glowing {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .glow-container:before {
            animation: none;
          }
        }
      `}</style>

      <div className="glow-container">
        <div className="glow-content">
          {children}
        </div>
      </div>
    </>
  )
}