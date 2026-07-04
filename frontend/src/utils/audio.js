let audioCtx = null;

/**
 * Initializes and resumes the shared audio context.
 */
function getAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  return audioCtx;
}

/**
 * Synthesizes a fast, organic bubble pop sound.
 * Sweeps the oscillator frequency quickly upwards.
 */
export const playBubbleSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    // Pitch sweep: from 420Hz (medium-low) to 1200Hz (high pop) in 0.06 seconds
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.06);

    // Volume envelope: quick attack, fast decay to prevent pops
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02); // Peak volume
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06); // Decay

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch (error) {
    // Fail silently to avoid interrupting interface loop
  }
};

/**
 * Synthesizes a crisp, mechanical tick/click sound.
 * Decays quickly from 800Hz to 100Hz in 0.04s.
 */
export const playTickSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.005); // Attack
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04); // Decay

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch (error) {
    // Ignore
  }
};

/**
 * Synthesizes a happy, harmonic chime arpeggio.
 * Plays two rising sine wave notes to reward task completions.
 */
export const playChimeSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Notes: C5 (523Hz) followed by E5 (659Hz) 0.08 seconds later
    const notes = [523.25, 659.25];

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      
      const noteStart = now + index * 0.08;

      osc.frequency.setValueAtTime(freq, noteStart);
      
      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.08, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + 0.25);
    });
  } catch (error) {
    // Fail silently
  }
};
