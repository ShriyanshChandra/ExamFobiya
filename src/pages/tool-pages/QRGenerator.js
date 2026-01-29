import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './QRGenerator.css';

const QRGenerator = () => {
    const [url, setUrl] = useState('');
    const canvasRef = useRef(null);

    // Helpers to extract domain
    const getDomain = (link) => {
        try {
            // Add protocol if missing for URL parsing
            const safeLink = link.startsWith('http') ? link : `https://${link}`;
            const hostname = new URL(safeLink).hostname;
            // Remove www.
            return hostname.replace(/^www\./, '');
        } catch (e) {
            return '';
        }
    };

    const domain = getDomain(url);

    // Logic to download image
    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // High resolution 1:1 canvas
        const canvasSize = 1024;
        const downloadCanvas = document.createElement('canvas');
        downloadCanvas.width = canvasSize;
        downloadCanvas.height = canvasSize;
        const ctx = downloadCanvas.getContext('2d');

        // Background White
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        const qrCanvas = document.querySelector('.qr-canvas-element');

        // Settings for layout
        // If domain text exists, we shrink QR slightly to make room at bottom while keeping vertical center balanced
        const qrSize = domain ? 800 : 880;

        const gap = domain ? 30 : 0;

        // Calculate centered position
        // Total content height = qrSize + gap + textHeight (approx text height)
        // Note: textBaseline 'top' makes textHeight calc easier, but 'middle' is often used.
        // Let's use specific positioning.

        const totalContentHeight = qrSize + gap + (domain ? 40 : 0);
        const startY = (canvasSize - totalContentHeight) / 2;
        const startX = (canvasSize - qrSize) / 2;

        if (qrCanvas) {
            // Draw high-res QR
            ctx.drawImage(qrCanvas, startX, startY, qrSize, qrSize);
        }

        // Draw Text
        if (domain) {
            ctx.font = 'bold 48px "Nunito", sans-serif';
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            // Position text below QR
            ctx.fillText(domain, canvasSize / 2, startY + qrSize + gap);
        }

        // Trigger download
        const pngUrl = downloadCanvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `qr-code-${domain || 'link'}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    return (
        <div className="qr-generator-page">
            <div className="qr-generator-content">
                <div className="qr-header">
                    <h1>QR Code Generator</h1>
                </div>

                <div className="qr-input-section">
                    <input
                        type="text"
                        placeholder="Enter URL (e.g., https://facebook.com)"
                        className="qr-url-input"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>

                {url && (
                    <div className="qr-preview-section">
                        <div className="qr-display-area" ref={canvasRef}>
                            <div className="qr-code-wrapper">
                                <QRCodeCanvas
                                    value={url}
                                    size={1024} // High-res render for download
                                    level={"H"}
                                    includeMargin={false}
                                    className="qr-canvas-element"
                                    style={{ width: '256px', height: '256px' }} // CSS scaling for display
                                />
                            </div>
                            {domain && <div className="qr-domain-tag">{domain}</div>}
                        </div>

                        <div className="qr-actions">
                            <button className="download-btn" onClick={handleDownload}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Download PNG
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRGenerator;
