import React, { useState } from 'react';
import './SpeedTest.css';

const SpeedTest = () => {
    const [testing, setTesting] = useState(false);
    const [results, setResults] = useState(null);
    const [progress, setProgress] = useState('');
    const [currentSpeed, setCurrentSpeed] = useState(0);
    const [testPhase, setTestPhase] = useState(''); // 'download', 'upload', or 'ping'
    const abortControllerRef = React.useRef(null);

    const [useMBps, setUseMBps] = useState(false); // Toggle between Mbps and MB/s

    // Helper function to calculate ratings
    const calculateRatings = (download, upload, ping) => {
        // Gaming rating (heavily depends on ping and download)
        let gamingRating = 5;
        if (ping > 100 || download < 5) gamingRating = 1;
        else if (ping > 70 || download < 10) gamingRating = 2;
        else if (ping > 50 || download < 15) gamingRating = 3;
        else if (ping > 30 || download < 25) gamingRating = 4;

        // Video Streaming rating (mainly download speed)
        let streamingRating = 5;
        if (download < 3) streamingRating = 1;
        else if (download < 5) streamingRating = 2;
        else if (download < 10) streamingRating = 3;
        else if (download < 25) streamingRating = 4;

        // Web Browsing rating (balanced between download and ping)
        let browsingRating = 5;
        if (download < 1 || ping > 150) browsingRating = 1;
        else if (download < 3 || ping > 100) browsingRating = 2;
        else if (download < 5 || ping > 70) browsingRating = 3;
        else if (download < 10 || ping > 50) browsingRating = 4;

        // Video Calling rating (depends on upload, download, and ping)
        let callingRating = 5;
        if (upload < 0.5 || download < 1 || ping > 150) callingRating = 1;
        else if (upload < 1 || download < 2 || ping > 100) callingRating = 2;
        else if (upload < 2 || download < 3 || ping > 70) callingRating = 3;
        else if (upload < 5 || download < 5 || ping > 50) callingRating = 4;

        return {
            gaming: gamingRating,
            streaming: streamingRating,
            browsing: browsingRating,
            calling: callingRating
        };
    };




    // Test download speed with parallel streams for saturation (10-15 seconds)
    const testDownloadSpeed = async () => {
        setProgress('Testing download speed...');
        setTestPhase('download');
        setCurrentSpeed(0);

        const testDuration = 8000; // Strictly 8 seconds
        // Multiple high-bandwidth fallback images
        const imageUrls = [
            "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=4000&q=80",
            "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=4000&q=80",
            "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=4000&q=80",
            "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=4000&q=80"
        ];

        const concurrentStreams = 4; // Number of parallel downloads
        let totalBytes = 0;
        const startTime = performance.now();
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        try {
            // Update interval for real-time speed display
            const updateInterval = setInterval(() => {
                const elapsed = performance.now() - startTime;
                if (elapsed >= testDuration) {
                    clearInterval(updateInterval);
                    if (abortControllerRef.current) {
                        abortControllerRef.current.abort();
                    }
                    return;
                }

                // Calculate and display current speed
                const elapsedSeconds = elapsed / 1000;
                if (elapsedSeconds > 0 && totalBytes > 0) {
                    const currentSpeedMbps = (totalBytes * 8) / (elapsedSeconds * 1000000);
                    // Use a moving average or direct calculation? Direct is often spiky, but okay for real-time look
                    setCurrentSpeed(Math.round(currentSpeedMbps * 100) / 100);
                }
            }, 200);

            // Function to handle a single stream of downloads
            const downloadStream = async (urlIndex) => {
                while (performance.now() - startTime < testDuration && !signal.aborted) {
                    try {
                        const url = imageUrls[urlIndex % imageUrls.length] + "&cache=" + Math.random();
                        const response = await fetch(url, { signal });
                        const reader = response.body.getReader();

                        while (true) {
                            const { done, value } = await reader.read();
                            if (done || signal.aborted) break;
                            totalBytes += value.length;
                        }
                    } catch (error) {
                        if (error.name === 'AbortError') return;
                        // Silently fail stream and retry (mimics TCP retry)
                        // console.warn('Stream failed', error); 
                    }
                }
            };

            // Start parallel streams
            const promises = [];
            for (let i = 0; i < concurrentStreams; i++) {
                promises.push(downloadStream(i));
            }

            await Promise.all(promises);
            clearInterval(updateInterval);

            // Calculate final average speed
            const totalSeconds = (performance.now() - startTime) / 1000;
            const finalSpeedMbps = (totalBytes * 8) / (totalSeconds * 1000000);
            const finalSpeed = Math.round(finalSpeedMbps * 100) / 100;

            console.log(`Download Test: ${totalBytes} bytes in ${totalSeconds}s = ${finalSpeedMbps} Mbps`);

            setCurrentSpeed(finalSpeed);
            return finalSpeed;
        } catch (error) {
            console.error('Download test failed:', error);
            setCurrentSpeed(0);
            return 0;
        }
    };

    // Test upload speed with real backend upload (Strictly 8 seconds)
    const testUploadSpeed = async () => {
        setProgress('Testing upload speed...');
        setTestPhase('upload');
        setCurrentSpeed(0);

        const testDuration = 8000; // Strictly 8 seconds
        let totalBytes = 0;
        const startTime = performance.now();
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        // Create 1MB of random data to upload repeatedly
        const chunkSize = 1024 * 1024;
        const randomData = new Uint8Array(chunkSize);
        for (let i = 0; i < chunkSize; i++) randomData[i] = Math.random() * 255;
        const blob = new Blob([randomData]);

        try {
            // Update interval
            const updateInterval = setInterval(() => {
                const elapsed = performance.now() - startTime;
                if (elapsed >= testDuration) {
                    clearInterval(updateInterval);
                    if (abortControllerRef.current) {
                        abortControllerRef.current.abort();
                    }
                    return;
                }

                const elapsedSeconds = elapsed / 1000;
                if (elapsedSeconds > 0 && totalBytes > 0) {
                    const currentSpeedMbps = (totalBytes * 8) / (elapsedSeconds * 1000000);
                    setCurrentSpeed(Math.round(currentSpeedMbps * 100) / 100);
                }
            }, 200);

            // Upload loop
            const API_BASE_URL = process.env.NODE_ENV === 'production'
                ? ''
                : 'http://localhost:5000';

            while (performance.now() - startTime < testDuration && !signal.aborted) {
                try {
                    // Start a fetch request with the large payload
                    // We can't really track progress of a single fetch in standard JS fetch API without streams (which are for download)
                    // So we treat each completed request as a chunk
                    await fetch(`${API_BASE_URL}/api/speedtest/upload`, {
                        method: 'POST',
                        body: blob,
                        signal,
                        mode: 'cors'
                    });
                    totalBytes += chunkSize;
                } catch (error) {
                    if (error.name === 'AbortError') break;
                    // console.warn('Upload chunk failed', error);
                }
            }

            clearInterval(updateInterval);

            const totalSeconds = (performance.now() - startTime) / 1000;
            const finalSpeedMbps = (totalBytes * 8) / (totalSeconds * 1000000);
            const finalSpeed = Math.round(finalSpeedMbps * 100) / 100;

            console.log(`Upload Test: ${totalBytes} bytes in ${totalSeconds}s = ${finalSpeedMbps} Mbps`);

            setCurrentSpeed(finalSpeed);
            return finalSpeed;
        } catch (error) {
            console.error('Upload test failed:', error);
            setCurrentSpeed(0);
            return 0;
        }
    };

    // Test ping/latency with multiple iterations for stability
    const testPing = async () => {
        setProgress('Testing ping...');
        setTestPhase('ping');
        setCurrentSpeed(0);

        const iterations = 5;
        const pings = [];
        const testUrl = 'https://www.google.com/favicon.ico';

        try {
            for (let i = 0; i < iterations; i++) {
                const startTime = performance.now();
                await fetch(testUrl + '?cache=' + Math.random(), { method: 'HEAD', mode: 'no-cors' });
                const endTime = performance.now();

                pings.push(endTime - startTime);

                // Small delay between iterations
                if (i < iterations - 1) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }

            // Calculate average ping for stability
            const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
            return Math.round(avgPing);
        } catch (error) {
            console.error('Ping test failed:', error);
            return 0;
        }
    };

    // Helper function to convert speed based on unit preference
    const convertSpeed = (speedMbps) => {
        if (useMBps) {
            return (speedMbps / 8).toFixed(2); // Convert to MB/s
        }
        return speedMbps;
    };

    // Get unit label
    const getSpeedUnit = () => useMBps ? 'MB/s' : 'Mbps';

    // Run all tests
    const runSpeedTest = async () => {
        setTesting(true);
        setResults(null);
        setCurrentSpeed(0);
        setTestPhase('');


        try {
            // Run tests sequentially: download first, then upload, then ping
            const download = await testDownloadSpeed();
            await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause between tests

            const upload = await testUploadSpeed();
            await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause

            const ping = await testPing();

            const ratings = calculateRatings(download, upload, ping);

            setResults({
                download,
                upload,
                ping,
                ratings
            });

            setProgress('Test complete!');
            setTestPhase('');
            setCurrentSpeed(0);


        } catch (error) {
            console.error('Speed test error:', error);
            setProgress('Test failed. Please try again.');
        } finally {
            setTesting(false);
        }
    };



    // Get rating color
    const getRatingColor = (rating) => {
        if (rating <= 2) return 'rating-poor';
        if (rating === 3) return 'rating-fair';
        return 'rating-good';
    };

    return (
        <div className="speed-test-page">
            <div className="speed-test-content">
                <div className="speed-test-header">
                    <h1>Internet Speed Test</h1>
                </div>

                {/* Unit Toggle */}
                <div className="unit-toggle">
                    <button
                        className={`unit-btn ${!useMBps ? 'active' : ''}`}
                        onClick={() => setUseMBps(false)}
                        disabled={testing}
                    >
                        Mbps
                    </button>
                    <button
                        className={`unit-btn ${useMBps ? 'active' : ''}`}
                        onClick={() => setUseMBps(true)}
                        disabled={testing}
                    >
                        MB/s
                    </button>
                </div>

                <div className="test-control">
                    <button
                        className="start-test-btn"
                        onClick={runSpeedTest}
                        disabled={testing}
                    >
                        {testing ? (
                            <>
                                <div className="spinner"></div>
                                Testing...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                                    <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                                    <line x1="12" y1="20" x2="12.01" y2="20"></line>
                                </svg>
                                Start Speed Test
                            </>
                        )}
                    </button>
                    {progress && <p className="progress-text">{progress}</p>}

                    {/* Real-time speed display during testing */}
                    {testing && testPhase && (
                        <div className="realtime-speed">
                            <div className="realtime-speed-value">
                                {testPhase === 'ping' ? currentSpeed : convertSpeed(currentSpeed)}
                                <span className="speed-unit">
                                    {testPhase === 'ping' ? 'ms' : getSpeedUnit()}
                                </span>
                            </div>
                            <div className="realtime-speed-label">
                                {testPhase === 'download' && 'Download Speed'}
                                {testPhase === 'upload' && 'Upload Speed'}
                                {testPhase === 'ping' && 'Ping'}
                            </div>
                        </div>
                    )}
                </div>

                {results && (
                    <div className="results-section">
                        <div className="speed-results">
                            <div className="result-card">
                                <div className="result-label">Download</div>
                                <div className="result-value">{convertSpeed(results.download)} <span>{getSpeedUnit()}</span></div>
                            </div>
                            <div className="result-card">
                                <div className="result-label">Upload</div>
                                <div className="result-value">{convertSpeed(results.upload)} <span>{getSpeedUnit()}</span></div>
                            </div>
                            <div className="result-card">
                                <div className="result-label">Ping</div>
                                <div className="result-value">{results.ping} <span>ms</span></div>
                            </div>
                        </div>

                        <div className="activity-ratings">
                            <h3>Activity Ratings</h3>
                            <div className="ratings-grid">
                                <div className="rating-card">
                                    <div className="rating-icon-container">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="#4b5563">
                                            <path d="M21 6H3c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h18c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm4-3c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5z"></path>
                                        </svg>
                                    </div>
                                    <div className="rating-name">Gaming</div>
                                    <div className={`rating-score ${getRatingColor(results.ratings.gaming)}`}>
                                        {results.ratings.gaming}/5
                                    </div>
                                </div>
                                <div className="rating-card">
                                    <div className="rating-icon-container">
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            backgroundColor: '#4b5563',
                                            maskImage: 'url(https://img.icons8.com/parakeet-filled/48/video.png)',
                                            WebkitMaskImage: 'url(https://img.icons8.com/parakeet-filled/48/video.png)',
                                            maskSize: 'contain',
                                            WebkitMaskSize: 'contain',
                                            maskRepeat: 'no-repeat',
                                            WebkitMaskRepeat: 'no-repeat',
                                            margin: '0 auto'
                                        }} />
                                    </div>
                                    <div className="rating-name">Video Streaming</div>
                                    <div className={`rating-score ${getRatingColor(results.ratings.streaming)}`}>
                                        {results.ratings.streaming}/5
                                    </div>
                                </div>
                                <div className="rating-card">
                                    <div className="rating-icon-container">
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            backgroundColor: '#4b5563',
                                            maskImage: 'url(https://img.icons8.com/pastel-glyph/64/internet-browser--v1.png)',
                                            WebkitMaskImage: 'url(https://img.icons8.com/pastel-glyph/64/internet-browser--v1.png)',
                                            maskSize: 'contain',
                                            WebkitMaskSize: 'contain',
                                            maskRepeat: 'no-repeat',
                                            WebkitMaskRepeat: 'no-repeat',
                                            margin: '0 auto'
                                        }} />
                                    </div>
                                    <div className="rating-name">Web Browsing</div>
                                    <div className={`rating-score ${getRatingColor(results.ratings.browsing)}`}>
                                        {results.ratings.browsing}/5
                                    </div>
                                </div>
                                <div className="rating-card">
                                    <div className="rating-icon-container">
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            backgroundColor: '#4b5563',
                                            maskImage: 'url(https://img.icons8.com/sf-black-filled/64/video-call.png)',
                                            WebkitMaskImage: 'url(https://img.icons8.com/sf-black-filled/64/video-call.png)',
                                            maskSize: 'contain',
                                            WebkitMaskSize: 'contain',
                                            maskRepeat: 'no-repeat',
                                            WebkitMaskRepeat: 'no-repeat',
                                            margin: '0 auto'
                                        }} />
                                    </div>
                                    <div className="rating-name">Video Calling</div>
                                    <div className={`rating-score ${getRatingColor(results.ratings.calling)}`}>
                                        {results.ratings.calling}/5
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                )}
            </div>
        </div>
    );
};

export default SpeedTest;
