# Natural Host voice setup

Stage 6 uses the ElevenLabs streaming text-to-speech API through `server.js`. The API key and voice ID exist only on the server; neither value is sent to the browser.

1. In ElevenLabs, create or select an original synthetic voice that is not an imitation of a real person.
2. Copy `.env.example` to `.env`.
3. Set `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` in `.env`.
4. Run `npm start`, then open `http://localhost:8080`. Do not open `index.html` directly when testing natural Host speech.

The default model is `eleven_flash_v2_5`. Generic clips are held in a bounded, process-local memory cache (96 entries by default). Clips containing a current player name are not cached. The cache contains audio only, is cleared whenever the server stops, and never stores credentials.

If the provider is missing or unavailable, gameplay continues silently. Browser speech synthesis is intentionally not used. The Stage 5 provider contract remains compatible with a future local prerecorded-clip provider.

Optional settings are documented in `.env.example`. Use `window.__LOS_HOST_AUDIO_DIAGNOSTICS__` in developer tools to inspect requests, cache hits, cancellations, failures, time-to-audio-start, and total playback time.

## LOWLOW Homie Vibe turn announcements (preview build)

- The existing LOWLOW ElevenLabs voice ID and model stay unchanged. **Only** the player handoff uses a calmer voice setting (speed `0.94`, style `0.12`, stability `0.68`).
- In LOS, go to **Who's In?** → **SELECT SAVED PLAYER** → **HEAR NAME** beside a profile. Each click plays a different complete sentence (for example, "Hey, Patty, you're up."). Audio requires the local server running with valid ElevenLabs settings and Voice enabled.
- The saved name **Patricia** is spoken **Patty**; **David Estrada** is spoken **David**, and **Isaac Rodriguez** is spoken **Isaac**. These aliases do not rename profiles on screen. Do not guess unconfirmed pronunciations.
- Each new full-sentence MP3 is saved **on this computer**, under `runtime-voice-cache/homie-handoff/`. Identical requested phrases are replayed from that recording after an app/server restart. Each of the six sentence variations has a different file. This cache is intentionally not committed to Git.
- **Include `runtime-voice-cache/` when making the USB game backup** if you want the locally generated LOWLOW recordings. If the folder is omitted, the local server will regenerate missing clips when online.
- New clips are samples for human listening review, not automatically approved pronunciation. The host voice, approved art and question banks have not been replaced.
