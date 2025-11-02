import React from 'react';

interface EnderDragonProps {
  isTalking: boolean;
}

export const EnderDragon: React.FC<EnderDragonProps> = ({ isTalking }) => {
  return (
    <div className={`dragon-container ${isTalking ? 'talking' : ''}`}>
      <div className="dragon">
        {/* Spine spikes */}
        <div className="spine-spike"></div>
        <div className="spine-spike"></div>
        <div className="spine-spike"></div>
        <div className="spine-spike"></div>
        <div className="spine-spike"></div>

        {/* Left Wing */}
        <div className="wing left">
          <div className="wing-arm"></div>
          <div className="wing-finger"></div>
          <div className="wing-finger"></div>
          <div className="wing-membrane upper"></div>
          <div className="wing-membrane lower"></div>
        </div>

        {/* Right Wing */}
        <div className="wing right">
          <div className="wing-arm"></div>
          <div className="wing-finger"></div>
          <div className="wing-finger"></div>
          <div className="wing-membrane upper"></div>
          <div className="wing-membrane lower"></div>
        </div>

        {/* Head */}
        <div className="head">
          <div className="head-top"></div>
          <div className="horn left"></div>
          <div className="horn right"></div>
          <div className="side-horn left"></div>
          <div className="side-horn right"></div>
          <div className="eye left"></div>
          <div className="eye right"></div>
          <div className="snout"></div>
          <div className="jaw">
             <div className="mouth"></div>
          </div>
        </div>

        {/* Neck */}
        <div className="neck"></div>

        {/* Body */}
        <div className="body"></div>
        <div className="chest"></div>

        {/* Legs */}
        <div className="leg front-left"></div>
        <div className="leg front-right"></div>
        <div className="leg back-left"></div>
        <div className="leg back-right"></div>

        {/* Tail */}
        <div className="tail">
          <div className="tail-spike"></div>
          <div className="tail-spike"></div>
          <div className="tail-spike"></div>
          <div className="tail-spike"></div>
          <div className="tail-spike"></div>
        </div>

        {/* Particles */}
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
    </div>
  );
};