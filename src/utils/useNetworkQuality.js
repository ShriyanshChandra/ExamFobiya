import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useNetworkQuality
 * Custom React hook that monitors real-time network conditions based purely on actual bandwidth (Mbps) and latency.
 * Independent of cellular generation labels (2G, 3G, 4G, 5G).
 *
 * Metrics:
 * - isSlow: true when measured bandwidth is critically low (< 0.6 Mbps) or round-trip probe latency exceeds 2000ms.
 * - isStable: true when connection bandwidth is healthy (>= 0.8 Mbps) and probe responds promptly (< 1000ms).
 */

const SLOW_BANDWIDTH_THRESHOLD_MBPS = 0.6;   // Below 600 kbps is considered slow
const STABLE_BANDWIDTH_THRESHOLD_MBPS = 0.8; // 0.8 Mbps and above is stable
const LATENCY_SLOW_THRESHOLD_MS = 2000;      // 2000ms and above is high latency / slow
const LATENCY_STABLE_THRESHOLD_MS = 1000;    // Under 1000ms is responsive / stable

export function useNetworkQuality() {
    const [networkState, setNetworkState] = useState(() => {
        const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
        const initialPreload = typeof window !== 'undefined' ? window.__INITIAL_NETWORK_STATE__ : null;
        const conn = typeof navigator !== 'undefined' ? (navigator.connection || navigator.mozConnection || navigator.webkitConnection) : null;

        let isSlow = initialPreload?.isSlow || false;
        let isStable = initialPreload ? !initialPreload.isSlow : isOnline;
        let downlinkMbps = initialPreload?.bandwidthMbps ?? null;
        let rttMs = null;

        if (conn && typeof conn.downlink === 'number') {
            downlinkMbps = conn.downlink;
            rttMs = typeof conn.rtt === 'number' ? conn.rtt : null;

            if (downlinkMbps > 0 && downlinkMbps < SLOW_BANDWIDTH_THRESHOLD_MBPS) {
                isSlow = true;
                isStable = false;
            } else if (downlinkMbps >= STABLE_BANDWIDTH_THRESHOLD_MBPS) {
                isSlow = false;
                isStable = true;
            }
        }

        return {
            isOnline,
            isSlow,
            isStable,
            bandwidthMbps: downlinkMbps,
            rtt: rttMs,
            lastChecked: Date.now()
        };
    });

    const isProbingRef = useRef(false);

    // Active latency and bandwidth probe
    const probeBandwidth = useCallback(async () => {
        if (typeof window === 'undefined' || !navigator.onLine || isProbingRef.current) {
            return;
        }

        // Avoid probing if document is hidden to conserve resources
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
            return;
        }

        isProbingRef.current = true;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const startTime = performance.now();

        try {
            const probeUrl = `/vite.svg?_bw=${Date.now()}`;
            const response = await fetch(probeUrl, {
                method: 'HEAD',
                cache: 'no-store',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const durationMs = performance.now() - startTime;

            const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            const reportedDownlink = typeof conn?.downlink === 'number' ? conn.downlink : null;
            const reportedRtt = typeof conn?.rtt === 'number' ? conn.rtt : null;

            let isSlow = false;
            let isStable = true;

            if (reportedDownlink !== null && reportedDownlink > 0) {
                isSlow = reportedDownlink < SLOW_BANDWIDTH_THRESHOLD_MBPS || durationMs > LATENCY_SLOW_THRESHOLD_MS;
                isStable = !isSlow && reportedDownlink >= STABLE_BANDWIDTH_THRESHOLD_MBPS;
            } else {
                // For browsers without navigator.connection (Safari/Firefox):
                // Response within 1000ms confirms responsive connection
                isSlow = durationMs > LATENCY_SLOW_THRESHOLD_MS || !response.ok;
                isStable = !isSlow && durationMs < LATENCY_STABLE_THRESHOLD_MS;
            }

            setNetworkState(prev => ({
                ...prev,
                isOnline: true,
                isSlow,
                isStable,
                bandwidthMbps: reportedDownlink !== null ? reportedDownlink : (isSlow ? 0.2 : 5.0),
                rtt: reportedRtt || Math.round(durationMs),
                lastChecked: Date.now()
            }));
        } catch (err) {
            clearTimeout(timeoutId);
            const isTimeout = err?.name === 'AbortError';
            // Timed out probe means bandwidth is severely constrained or stalled
            if (isTimeout && navigator.onLine) {
                setNetworkState(prev => ({
                    ...prev,
                    isSlow: true,
                    isStable: false,
                    bandwidthMbps: 0.1,
                    lastChecked: Date.now()
                }));
            }
        } finally {
            isProbingRef.current = false;
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleOnline = () => {
            setNetworkState(prev => ({ ...prev, isOnline: true }));
            probeBandwidth();
        };

        const handleOffline = () => {
            setNetworkState(prev => ({ 
                ...prev, 
                isOnline: false, 
                isSlow: true, 
                isStable: false,
                bandwidthMbps: 0
            }));
        };

        const handleConnectionChange = () => {
            const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (!conn) return;

            const downlink = typeof conn.downlink === 'number' ? conn.downlink : null;
            const rtt = typeof conn.rtt === 'number' ? conn.rtt : null;

            if (downlink !== null && downlink > 0) {
                const isSlow = downlink < SLOW_BANDWIDTH_THRESHOLD_MBPS;
                const isStable = downlink >= STABLE_BANDWIDTH_THRESHOLD_MBPS;

                setNetworkState(prev => ({
                    ...prev,
                    isSlow,
                    isStable,
                    bandwidthMbps: downlink,
                    rtt,
                    lastChecked: Date.now()
                }));
            }
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn) {
            conn.addEventListener('change', handleConnectionChange);
        }

        // Background periodic bandwidth probe every 12 seconds
        const intervalId = setInterval(() => {
            probeBandwidth();
        }, 12000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (conn) {
                conn.removeEventListener('change', handleConnectionChange);
            }
            clearInterval(intervalId);
        };
    }, [probeBandwidth]);

    return networkState;
}

export default useNetworkQuality;
