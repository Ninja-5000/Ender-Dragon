import { useCallback, useRef, useEffect } from 'react';

export const useAmbientSounds = () => {
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        // Create context only once
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const context = audioContextRef.current;
        
        return () => {
            // Closing the context is often too destructive if other components might use it.
            // Instead, we just let it be garbage collected if nothing else holds a reference.
        };
    }, []);

    const playWingFlap = useCallback(() => {
        const context = audioContextRef.current;
        if (!context || context.state === 'suspended') {
            context?.resume();
        }
        if (!context) return;
        
        const bufferSize = context.sampleRate * 0.5; // 0.5 second buffer
        const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const noise = context.createBufferSource();
        noise.buffer = buffer;

        const bandpass = context.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 400;
        bandpass.Q.value = 0.5;

        const gainNode = context.createGain();
        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, context.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.4);

        noise.connect(bandpass);
        bandpass.connect(gainNode);
        gainNode.connect(context.destination);
        noise.start();
        noise.stop(context.currentTime + 0.5);

    }, []);

    const playGrowl = useCallback(() => {
        const context = audioContextRef.current;
        if (!context) return;

        const osc1 = context.createOscillator();
        const osc2 = context.createOscillator();
        const gainNode = context.createGain();
        const filter = context.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(80, context.currentTime);

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(40, context.currentTime); // Deep base frequency

        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(41, context.currentTime); // Slightly detuned for thickness

        const lfo = context.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(5, context.currentTime); // LFO for rumble effect
        const lfoGain = context.createGain();
        lfoGain.gain.setValueAtTime(5, context.currentTime); // Amount of frequency modulation
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);

        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, context.currentTime + 0.2);
        gainNode.gain.linearRampToValueAtTime(0.1, context.currentTime + 1.5);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 2.5);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(context.destination);

        lfo.start(context.currentTime);
        osc1.start(context.currentTime);
        osc2.start(context.currentTime);
        
        lfo.stop(context.currentTime + 2.5);
        osc1.stop(context.currentTime + 2.5);
        osc2.stop(context.currentTime + 2.5);

    }, []);

    const playMagicalHum = useCallback(() => {
        const context = audioContextRef.current;
        if (!context) return;
        
        const osc1 = context.createOscillator();
        const osc2 = context.createOscillator();
        const gainNode = context.createGain();

        osc1.type = 'sine';
        osc1.frequency.value = 50; // low frequency
        osc2.type = 'sine';
        osc2.frequency.value = 50.5; // slightly detuned

        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.02, context.currentTime + 0.5); // quiet hum
        gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 4);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(context.destination);

        osc1.start();
        osc2.start();
        osc1.stop(context.currentTime + 4);
        osc2.stop(context.currentTime + 4);
    }, []);

    const playWindEffect = useCallback(() => {
        const context = audioContextRef.current;
        if (!context) return;
        
        const bufferSize = context.sampleRate * 3; // 3 seconds
        const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1; // white noise
        }

        const noise = context.createBufferSource();
        noise.buffer = buffer;

        const bandpass = context.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(400, context.currentTime);
        bandpass.frequency.linearRampToValueAtTime(800, context.currentTime + 3);
        bandpass.Q.value = 1;

        const gainNode = context.createGain();
        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, context.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 3);

        noise.connect(bandpass);
        bandpass.connect(gainNode);
        gainNode.connect(context.destination);
        noise.start();
        noise.stop(context.currentTime + 3);
    }, []);

    const playPortalHum = useCallback(() => {
        const context = audioContextRef.current;
        if (!context) return;
        
        const osc1 = context.createOscillator();
        const osc2 = context.createOscillator();
        const gainNode = context.createGain();
        const filter = context.createBiquadFilter();

        osc1.type = 'sine';
        osc1.frequency.value = 30; // very low
        osc2.type = 'sawtooth';
        osc2.frequency.value = 31; // slightly detuned

        filter.type = 'lowpass';
        filter.frequency.value = 100;

        gainNode.gain.setValueAtTime(0, context.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.04, context.currentTime + 1.5);
        gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 5);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(context.destination);

        osc1.start();
        osc2.start();
        osc1.stop(context.currentTime + 5);
        osc2.stop(context.currentTime + 5);
    }, []);

    return { playWingFlap, playGrowl, playMagicalHum, playWindEffect, playPortalHum };
};