import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './Loader.css';

const Loader = ({ text = "Loading...", size = 200, fullScreen = false, caption = "Preparing your next view" }) => {
    return (
        <div className={`loader-wrap ${fullScreen ? 'loader-wrap--fullscreen' : ''}`}>
            <div className="loader-card">
                <div className="loader-orb" />
                <div className="loader-animation" style={{ width: size, height: size }}>
                    <DotLottieReact
                        src="https://lottie.host/43c5aa27-827e-4082-aa72-36ddd55fb46e/12x7wMiu7V.lottie"
                        loop
                        autoplay
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
                {text && <p className="loader-title">{text}</p>}
                {caption && <p className="loader-caption">{caption}</p>}
            </div>
        </div>
    );
};

export default Loader;
