import { Backdrop, CircularProgress, Fade } from '@mui/material';
import { keyframes } from '@mui/system';
import { useGlobalLoader } from '@/context/loader-context';

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

export default function GlobalLoader() {
  const { loading } = useGlobalLoader();

  return (
    <Fade in={loading} unmountOnExit>
      <Backdrop
        open={loading}
        sx={{
          color: '#1976d2',
          zIndex: (theme) => theme.zIndex.drawer + 9999,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          transition: 'background-color 300ms ease',
        }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            animationDuration: '1400ms',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
              animation: `${smoothSpin} 1.5s ease-in-out infinite`,
            },
          }}
        />
      </Backdrop>
    </Fade>
  );
}
