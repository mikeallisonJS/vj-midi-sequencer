import { useStore } from '../store/useStore';
import type { MidiService } from './MidiService';

// Define a type for the store state
type State = ReturnType<typeof useStore.getState>;

export class TransportService {
  private midiService: MidiService;
  private intervalId: NodeJS.Timeout | null = null;
  private currentBeat = 0;
  private currentBar = 0;
  private barCounter = 0;
  private barChangeListener: ((bar: number) => void) | null = null;
  private beatChangeListener: ((beat: number) => void) | null = null;

  constructor(midiService: MidiService) {
    this.midiService = midiService;
  }

  public setBarChangeListener(callback: (bar: number) => void): void {
    this.barChangeListener = callback;
  }

  public removeBarChangeListener(): void {
    this.barChangeListener = null;
  }

  public setBeatChangeListener(callback: (beat: number) => void): void {
    this.beatChangeListener = callback;
  }

  public removeBeatChangeListener(): void {
    this.beatChangeListener = null;
  }

  public playToggle(): void {
    const state = useStore.getState();
    const { playing, setPlaying } = state;

    if (playing) {
      this.stopBeats();
      setPlaying(false);
    } else {
      this.startBeats();
      setPlaying(true);
    }
  }

  public restart(): void {
    this.stopBeats();
    this.currentBeat = 0;
    this.currentBar = 0;
    this.barCounter = 0;

    // Notify listeners of the reset
    if (this.barChangeListener) {
      this.barChangeListener(this.currentBar);
    }
    if (this.beatChangeListener) {
      this.beatChangeListener(this.currentBeat);
    }

    const state = useStore.getState();
    if (!state.playing) {
      state.setPlaying(true);
    }
    this.startBeats();
  }

  private startBeats(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    const state = useStore.getState();
    // Calculate beat duration in milliseconds (60000ms / BPM = ms per beat)
    const beatDuration = 60000 / state.bpm;

    // Play the first note immediately
    if (this.currentBeat === 0) {
      this.playNote();
    }

    this.intervalId = setInterval(() => {
      // Get the latest state
      const currentState = useStore.getState();

      // Increment beat
      this.currentBeat = (this.currentBeat + 1) % 4;

      // Notify beat change
      if (this.beatChangeListener) {
        this.beatChangeListener(this.currentBeat);
      }

      // If we've completed a bar
      if (this.currentBeat === 0) {
        // Increment bar within the sequence
        this.currentBar = (this.currentBar + 1) % currentState.bars;

        // Notify bar change
        if (this.barChangeListener) {
          this.barChangeListener(this.currentBar);
        }

        // Increment the overall bar counter for scene progression
        this.barCounter++;
        console.log(`Bar counter: ${this.barCounter}, Bars per scene: ${currentState.bars}`);

        // Check if we need to progress to the next scene
        // The key fix: We need to check if we've completed a full cycle of bars
        if (this.barCounter >= currentState.bars) {
          this.barCounter = 0; // Reset bar counter
          this.progressScene(); // Progress to next scene
        }

        // Play note at the start of each bar
        this.playNote();
      }
    }, beatDuration);
  }

  private stopBeats(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private playNote(): void {
    const state = useStore.getState();
    // Play the current scene note
    this.midiService.playNote(state.activeScene, 0);
    console.log(`Playing note: ${state.activeScene}`);
  }

  private progressScene(): void {
    const state = useStore.getState();
    // Progress to the next scene
    if (state.activeScene >= state.maxNote) {
      // If we've reached the max note, either loop back to min or stay at max
      if (state.repeat) {
        state.setActiveScene(state.minNote);
        console.log(`Looping back to scene: ${state.minNote}`);
      } else {
        // If repeat is off, we still need to stay at the max note
        console.log(`Reached max scene: ${state.activeScene}, repeat is off`);
      }
    } else {
      // Move to the next scene
      const nextScene = state.activeScene + 1;
      state.setActiveScene(nextScene);
      console.log(`Progressing to scene: ${nextScene}`);
    }
  }
}
