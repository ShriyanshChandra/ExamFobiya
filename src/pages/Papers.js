import React from "react";
import "./Papers.css";
import { motion } from "framer-motion";
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';

const Papers = () => {
  return (
    <div className="papers-container">
      <div className="development-box large">
        <div className="lottie-container">
          <DotLottiePlayer
            src="https://assets-v2.lottiefiles.com/a/04489f0a-1168-11ee-acde-3f59cc25c37d/UfYn4CXhi6.lottie"
            autoplay
            loop
            style={{ height: '300px', width: '300px' }}
          />
        </div>
        <h2>This page is under development</h2>
        <p>Please check again later!</p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default Papers;
