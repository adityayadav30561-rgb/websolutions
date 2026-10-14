import { useSyncExternalStore } from "react";

/*
 * Background music. One track, of which only the opening CLIP_SECONDS play, fading in at the
 * start and out at the end, then starting over, for as long as the music is on. The site tries to start it on arrival; browsers refuse sound before
 * the visitor has touched the page, so in that case it starts on their first click, tap or key.
 * Turning it off is remembered, and then it never starts by itself.
 *
 * The file lives at public/audio/theme.mp3. It must be a track you hold a licence to use on a
 * commercial site. Without the file the sound button simply does not appear.
 */

const SRC = "/audio/theme.mp3";
const CLIP_SECONDS = 30;
const FADE_IN = 1.2;
const FADE_OUT = 2.5;
const VOLUME = 0.55;
const STORAGE_KEY = "northlight-sound";

type State = "off" | "waiting" | "playing" | "unavailable";

let state: State = "off";
let audio: HTMLAudioElement | null = null;
const listeners = new Set<() => void>();

const set = (next: State) => {
  state = next;
  listeners.forEach((l) => l());
};

const wantsOff = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "off";
  } catch {
    return false;
  }
};
const remember = (on: boolean) => {
  try {
    if (on) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, "off");
  } catch {
    /* storage blocked: the choice lasts for this visit only */
  }
};

/** Volume follows the position in the clip: a fade at each end, then back to the start. (iOS ignores volume.) */
function level() {
  if (!audio) return;
  const t = audio.currentTime;
  if (t >= CLIP_SECONDS) audio.currentTime = 0;
  audio.volume = Math.max(0, Math.min(1, t / FADE_IN, (CLIP_SECONDS - t) / FADE_OUT)) * VOLUME;
}
/* Smooth while the page is visible; a background tab stops animation frames, so "timeupdate" keeps it going there. */
function shape() {
  level();
  if (state === "playing") requestAnimationFrame(shape);
}

function stop() {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
  if (state !== "unavailable") set("off");
}

const GESTURES = ["pointerdown", "keydown", "touchstart"] as const;
function onFirstGesture() {
  GESTURES.forEach((g) => window.removeEventListener(g, onFirstGesture, true));
  if (state === "waiting") void play();
}

async function play() {
  if (!audio || state === "unavailable") return;
  try {
    audio.volume = 0;
    await audio.play();
    set("playing");
    requestAnimationFrame(shape);
  } catch (e) {
    // Blocked until the visitor interacts: wait for that rather than giving up.
    if ((e as DOMException).name === "NotAllowedError") {
      set("waiting");
      GESTURES.forEach((g) => window.addEventListener(g, onFirstGesture, { capture: true, passive: true }));
    }
  }
}

/** Called once when the app starts. */
export function startSound() {
  if (audio || typeof Audio === "undefined") return () => {};
  audio = new Audio(SRC);
  audio.preload = "auto";
  audio.addEventListener("error", () => set("unavailable"));
  // The file may end before the clip does; loop it either way.
  audio.loop = true;
  audio.addEventListener("timeupdate", level);
  if (!wantsOff()) void play();
  return () => {
    GESTURES.forEach((g) => window.removeEventListener(g, onFirstGesture, true));
    audio?.pause();
    audio = null;
  };
}

/** The header button: on starts the clip from the top, off stops it and is remembered. */
export function toggleSound() {
  if (state === "playing" || state === "waiting") {
    remember(false);
    GESTURES.forEach((g) => window.removeEventListener(g, onFirstGesture, true));
    stop();
  } else {
    remember(true);
    if (audio) audio.currentTime = 0;
    void play();
  }
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const useSound = () => useSyncExternalStore(subscribe, () => state, () => state);

/** Sound on/off. Bars move while it plays; one flat line when it is off. */
export function SoundToggle({ className = "" }: { className?: string }) {
  const s = useSound();
  if (s === "unavailable") return null;
  const on = s === "playing" || s === "waiting";
  return (
    <button
      type="button"
      onClick={toggleSound}
      aria-pressed={on}
      aria-label={on ? "Turn music off" : "Turn music on"}
      title={on ? "Music on" : "Music off"}
      className={`grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-300 hover:bg-b-ink/10 ${className}`}
    >
      <span aria-hidden className="flex h-4 items-center gap-[3px]">
        {[0.55, 1, 0.75, 0.4].map((h, i) => (
          <span
            key={i}
            className={`sound-bar w-[2px] rounded-full bg-current ${s === "playing" ? "is-on" : ""}`}
            style={{ height: `${s === "playing" ? h * 100 : 14}%`, animationDelay: `${i * -0.23}s` }}
          />
        ))}
      </span>
    </button>
  );
}
