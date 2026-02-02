import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Loader = ({ text = "Loading...", size = 200 }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            width: '100%'
        }}>
            <div style={{ width: size, height: size }}>
                <DotLottieReact
                    src="https://lottie.host/43c5aa27-827e-4082-aa72-36ddd55fb46e/12x7wMiu7V.lottie"
                    loop
                    autoplay
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
            {text && (
                <p style={{
                    marginTop: '10px',
                    color: '#888',
                    fontSize: '1rem',
                    fontWeight: '500'
                }}>
                    {text}
                </p>
            )}
        </div>
    );
};

export default Loader;
