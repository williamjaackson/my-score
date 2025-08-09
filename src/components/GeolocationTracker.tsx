"use client";

import { useEffect, useRef } from "react";

export default function GeolocationTracker() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function sendLocation(position: GeolocationPosition) {
      const { latitude, longitude } = position.coords;
      fetch("/api/location/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ latitude, longitude }),
      });
    }

    function handleError(error: GeolocationPositionError) {
      console.error("Geolocation error:", error);
    }

    function updateLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(sendLocation, handleError);
      }
    }

    // Initial call
    updateLocation();
    // Set interval
    intervalRef.current = setInterval(updateLocation, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return null;
}
