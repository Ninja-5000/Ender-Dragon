# Ender Dragon

An interactive web app featuring the Ender Dragon from Minecraft. Speak to the dragon and receive live, menacing responses powered by Gemini Live API. The dragon animates with flapping wings, glowing eyes, moving mouth, ambient sounds, and magical particle effects. All conversations are transcribed in real time.

## Features

- **Live voice conversation** with the Ender Dragon (powered by Gemini Live API)
- **Animated 2D dragon** with wings, mouth, and tail movement
- **Ambient sound effects** (wing flaps, growls, magical hums, wind, portal)
- **Mood effects** (screen flash and shake for aggressive responses)
- **Live transcription** of both user and dragon speech

## Getting Started

1. **Install dependencies:**

   ```
   npm install
   ```

2. **Add your Gemini API key** to .env.local:

   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the app locally:**

   ```
   npm run dev
   ```

4. **Open** [http://localhost:6767](http://localhost:6767) in your browser.

## Deployment

- Static build: `npm run build`
- Preview build: `npm run preview`
- Docker: See `Dockerfile` and `docker-compose.yml` for container setup.

## Credits

Created by Carmelo Canavan. Powered by [Gemini AI](https://ai.google.dev/).

---

**Note:** Requires microphone access.
