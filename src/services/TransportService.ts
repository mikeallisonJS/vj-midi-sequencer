import { MidiService } from "./MidiService";
import { useStateContext } from "../context/StateContext";

// Define a type alias for the return type of useStateContext
type State = ReturnType<typeof useStateContext>;

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

  public playToggle(state: State): void {
    if (state.playing) {
      this.stopBeats();
      state.setPlaying(false);
    } else {
      this.startBeats(state);
      state.setPlaying(true);
    }
  }

  public restart(state: State): void {
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

    this.startBeats(state);
  }

  private startBeats(state: State): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Calculate beat duration in milliseconds (60000ms / BPM = ms per beat)
    const beatDuration = 60000 / state.bpm;

    // Play the first note immediately
    if (this.currentBeat === 0) {
      this.playNote(state);
    }

    this.intervalId = setInterval(() => {
      // Increment beat
      this.currentBeat = (this.currentBeat + 1) % 4;

      // Notify beat change
      if (this.beatChangeListener) {
        this.beatChangeListener(this.currentBeat);
      }

      // If we've completed a bar
      if (this.currentBeat === 0) {
        // Increment bar within the sequence
        this.currentBar = (this.currentBar + 1) % state.bars;

        // Notify bar change
        if (this.barChangeListener) {
          this.barChangeListener(this.currentBar);
        }

        // Increment the overall bar counter for scene progression
        this.barCounter++;
        console.log(
          `Bar counter: ${this.barCounter}, Bars per scene: ${state.bars}`
        );

        // Check if we need to progress to the next scene
        if (this.barCounter >= state.bars) {
          this.barCounter = 0;
          this.progressScene(state);
        }

        // Play note at the start of each bar
        this.playNote(state);
      }
    }, beatDuration);
  }

  private stopBeats(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private playNote(state: State): void {
    // Play the current scene note
    this.midiService.playNote(state.activeScene, 0);
    console.log(`Playing note: ${state.activeScene}`);
  }

  private progressScene(state: State): void {
    // Progress to the next scene
    if (state.activeScene >= state.maxNote) {
      // If we've reached the max note, either loop back to min or stay at max
      if (state.repeat) {
        state.setActiveScene(state.minNote);
        console.log(`Looping back to scene: ${state.minNote}`);
      }
    } else {
      // Move to the next scene
      const nextScene = state.activeScene + 1;
      state.setActiveScene(nextScene);
      console.log(`Progressing to scene: ${nextScene}`);
    }
  }
}
