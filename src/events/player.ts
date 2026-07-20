import type { AgentEvent } from "./types";

export type EventListener = (event: AgentEvent) => void;

export class EventPlayer {
  private events: AgentEvent[] = [];
  private index = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<EventListener>();
  private intervalMs = 1600;
  private playing = false;

  load(events: AgentEvent[]) {
    this.stop();
    this.events = events;
    this.index = 0;
  }

  onEvent(listener: EventListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: AgentEvent) {
    for (const l of this.listeners) l(event);
  }

  current(): AgentEvent | null {
    return this.events[this.index] ?? null;
  }

  step() {
    if (this.events.length === 0) return;
    const event = this.events[this.index];
    this.emit(event);
    this.index = (this.index + 1) % this.events.length;
  }

  play(intervalMs = this.intervalMs) {
    this.intervalMs = intervalMs;
    if (this.playing) return;
    this.playing = true;
    this.step();
    this.timer = setInterval(() => this.step(), this.intervalMs);
  }

  pause() {
    this.playing = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  stop() {
    this.pause();
    this.index = 0;
  }

  isPlaying() {
    return this.playing;
  }

  setIntervalMs(ms: number) {
    this.intervalMs = ms;
    if (this.playing) {
      this.pause();
      this.play(ms);
    }
  }
}
