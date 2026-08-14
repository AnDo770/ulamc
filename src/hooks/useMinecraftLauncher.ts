'use client';

import { useState, useCallback } from 'react';

const JAVA_SERVER = process.env.NEXT_PUBLIC_JAVA_SERVER_ADDRESS || 'play.ULAMC.COM';
const BEDROCK_SERVER = process.env.NEXT_PUBLIC_BEDROCK_SERVER_ADDRESS || 'play.ULAMC.COM';
const BEDROCK_PORT = process.env.NEXT_PUBLIC_BEDROCK_SERVER_PORT || '19132';

export type DeviceType = 'pc' | 'mobile';
export type LaunchState = 'idle' | 'attempting' | 'success' | 'fallback';

function detectDevice(): DeviceType {
  if (typeof navigator === 'undefined') return 'pc';
  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
  return isMobile ? 'mobile' : 'pc';
}

export function useMinecraftLauncher() {
  const [launchState, setLaunchState] = useState<LaunchState>('idle');
  const [deviceType, setDeviceType] = useState<DeviceType>('pc');

  const launch = useCallback(() => {
    const device = detectDevice();
    setDeviceType(device);
    setLaunchState('attempting');

    if (device === 'mobile') {
      // Minecraft Bedrock deep link for Android/iOS
      // minecraft://connect?serverUrl=<host>&serverPort=<port>
      const bedrockLink = `minecraft://connect?serverUrl=${BEDROCK_SERVER}&serverPort=${BEDROCK_PORT}`;

      // Use iframe trick to avoid navigating away; detect failure via timeout
      let launched = false;

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const cleanup = () => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      };

      // Fallback timer — if app doesn't open within 2s, show fallback
      const timer = setTimeout(() => {
        if (!launched) {
          cleanup();
          setLaunchState('fallback');
        }
      }, 2000);

      // Listen for page visibility change — if app opened, page goes hidden
      const handleVisibilityChange = () => {
        if (document.hidden) {
          launched = true;
          clearTimeout(timer);
          cleanup();
          setLaunchState('success');
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      try {
        iframe.src = bedrockLink;
      } catch {
        clearTimeout(timer);
        cleanup();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        setLaunchState('fallback');
      }

      // Also try window.location as fallback for iOS
      setTimeout(() => {
        if (!launched) {
          try {
            window.location.href = bedrockLink;
          } catch {
            // ignore
          }
        }
      }, 300);
    } else {
      // PC — Minecraft Java Edition
      const javaLink = `minecraft-launcher://`;

      let launched = false;

      const timer = setTimeout(() => {
        if (!launched) {
          setLaunchState('fallback');
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
      }, 2500);

      const handleVisibilityChange = () => {
        if (document.hidden) {
          launched = true;
          clearTimeout(timer);
          setLaunchState('success');
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      try {
        window.location.href = javaLink;
      } catch {
        clearTimeout(timer);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        setLaunchState('fallback');
      }
    }
  }, []);

  const reset = useCallback(() => {
    setLaunchState('idle');
  }, []);

  return {
    launch,
    reset,
    launchState,
    deviceType,
    javaServer: JAVA_SERVER,
    bedrockServer: BEDROCK_SERVER,
    bedrockPort: BEDROCK_PORT,
  };
}
