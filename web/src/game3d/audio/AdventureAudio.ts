export class AdventureAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;

  get isAvailable(): boolean {
    return typeof AudioContext !== "undefined";
  }

  get isUnlocked(): boolean {
    return this.context !== null && this.context.state === "running";
  }

  async unlock(): Promise<boolean> {
    if (!this.isAvailable) return false;
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.connect(this.context.destination);
    }
    if (this.context.state === "suspended") await this.context.resume();
    return this.context.state === "running";
  }

  setMasterVolume(value: number): void {
    if (!this.master || !this.context) return;
    const volume = Math.max(0, Math.min(1, value));
    this.master.gain.setTargetAtTime(volume, this.context.currentTime, 0.02);
  }

  async playCue(cue: "inspect" | "install" | "activate"): Promise<boolean> {
    if (!(await this.unlock()) || !this.context || !this.master) return false;
    const notes = cue === "inspect"
      ? [330, 440]
      : cue === "install"
        ? [392, 523, 659]
        : [523, 659, 784, 1047];
    const start = this.context.currentTime;
    notes.forEach((frequency, index) => {
      const oscillator = this.context!.createOscillator();
      const gain = this.context!.createGain();
      const noteStart = start + index * .11;
      oscillator.type = cue === "activate" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, noteStart);
      gain.gain.setValueAtTime(.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(.12, noteStart + .018);
      gain.gain.exponentialRampToValueAtTime(.0001, noteStart + .16);
      oscillator.connect(gain);
      gain.connect(this.master!);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + .18);
    });
    return true;
  }

  async suspend(): Promise<void> {
    if (this.context?.state === "running") await this.context.suspend();
  }

  async resume(): Promise<boolean> {
    if (!this.context) return false;
    if (this.context.state === "suspended") await this.context.resume();
    return this.context.state === "running";
  }

  async dispose(): Promise<void> {
    const context = this.context;
    this.context = null;
    this.master = null;
    if (context && context.state !== "closed") await context.close();
  }
}
