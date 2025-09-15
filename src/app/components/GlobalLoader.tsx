"use client";

import { useEffect, useState } from "react";
import { Box, CircularProgress, Fade } from "@mui/material";
import Image from "next/image";
import { useGlobalLoader } from "@/context/loader-context";
import { keyframes } from "@mui/system";

// 🔥 Smooth Gmail-like circular spin animation
const smoothSpin = keyframes`
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 100, 200;
    stroke-dashoffset: -15px;
  }
  100% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: -125px;
  }
`;

export default function GmailSplashLoader() {
  const { loading } = useGlobalLoader();
  const [progress, setProgress] = useState(0);

  // fake progress bar increase (like Gmail)
  useEffect(() => {
    if (!loading) {
      setProgress(100);
      return;
    }

    setProgress(0);
    const timer = setInterval(() => {
      setProgress((old) => (old >= 90 ? old : old + Math.random() * 10));
    }, 300);

    return () => clearInterval(timer);
  }, [loading]);

  return (
    <Fade in={loading} unmountOnExit>
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(255,255,255,0.6)", // semi-transparent
          backdropFilter: "blur(6px)", // glass effect
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 20000,
          flexDirection: "column",
          gap: 4,
          transition: "background-color 300ms ease",
        }}
      >
        {/* App Logo */}
        <Image
          src="/images/ZELLIS_Multisync_dark.svg"
          alt="App Logo"
          width={200}
          height={150} // can be placeholder, will override in style
          priority
          style={{ height: "auto" }} // preserves aspect ratio
        />

        {/* Circular Progress */}
        <CircularProgress
          variant="determinate"
          value={progress}
          size={40}
          thickness={6}
          sx={{
            color: "#4285F4", // Gmail blue
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
              animation: `${smoothSpin} 1.0s ease-in-out infinite`,
            },
          }}
        />
      </Box>
    </Fade>
  );
}
