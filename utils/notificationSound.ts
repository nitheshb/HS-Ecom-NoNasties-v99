/**
 * Plays a notification sound when a new order is received
 * Uses Web Audio API to generate a pleasant beep sound
 */

let audioContext: AudioContext | null = null;

// Initialize audio context on first user interaction (required by browser autoplay policies)
function initAudioContext() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }
  return audioContext;
}

// Initialize audio context on any user interaction
if (typeof window !== 'undefined') {
  const initEvents = ['click', 'touchstart', 'keydown'];
  const initHandler = () => {
    initAudioContext();
    initEvents.forEach(event => {
      window.removeEventListener(event, initHandler);
    });
  };
  initEvents.forEach(event => {
    window.addEventListener(event, initHandler, { once: true });
  });
}

export function playNotificationSound() {
  try {
    const ctx = initAudioContext();
    if (!ctx) {
      // Audio context not available, fail silently
      return;
    }

    // Resume audio context if it's suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {
        // Silent fail if can't resume
        return;
      });
    }

    const now = ctx.currentTime;
    
    // Create a pleasant chime sound with two tones (like a bell)
    // First tone: higher pitch
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = 880; // A5 note
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    // Second tone: lower pitch, slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 1108; // C#6 note
    gain2.gain.setValueAtTime(0, now + 0.05);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    // Play both tones
    osc1.start(now);
    osc1.stop(now + 0.3);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.35);
    
  } catch (error) {
    // Silent fail - notification sound is nice-to-have, not critical
    console.debug('Notification sound could not play:', error);
  }
}

