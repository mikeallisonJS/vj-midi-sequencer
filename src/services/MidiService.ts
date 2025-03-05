import { Platform } from "react-native";
import { useStateContext } from "../context/StateContext";
import { requestMIDIAccess } from "@motiz88/react-native-midi";

// Note: React Native MIDI implementation will be different from the web/Electron version
// This is a simplified version that will need to be adapted based on the available MIDI libraries for React Native

export class MidiService {
  keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  octaves = ["-2", "-1", "0", "1", "2", "3", "4", "5", "6", "7", "8"];
  notesArray: string[];
  midiAccess: any;
  midiInputs: Map<string, any>;
  midiOutputs: Map<string, any>;
  selectedOutput: any;

  constructor() {
    this.notesArray = this.buildNoteList();
    this.midiInputs = new Map();
    this.midiOutputs = new Map();
    this.reset();
  }

  async getInfo() {
    try {
      this.midiAccess = await requestMIDIAccess();

      // Clear existing maps
      this.midiInputs.clear();
      this.midiOutputs.clear();

      // Populate inputs
      this.midiAccess.inputs.forEach((input: any, id: string) => {
        this.midiInputs.set(id, input);
      });

      // Populate outputs
      this.midiAccess.outputs.forEach((output: any, id: string) => {
        this.midiOutputs.set(id, output);
      });

      return {
        inputs: Array.from(this.midiInputs.values()),
        outputs: Array.from(this.midiOutputs.values()),
      };
    } catch (error) {
      console.error("Failed to get MIDI access:", error);
      return { inputs: [], outputs: [] };
    }
  }

  buildNoteList(): string[] {
    const notes: string[] = [];
    for (let i = 0; i < 128; i++) {
      notes.push(
        this.keys[i % this.keys.length] +
          this.octaves[Math.floor((i + 3) / this.keys.length)]
      );
    }
    return notes;
  }

  close(): void {
    if (this.selectedOutput) {
      // No explicit close method needed with Web MIDI API
      this.selectedOutput = null;
    }
  }

  playNote(note: number, channel: number): void {
    if (this.selectedOutput) {
      // Note on message: 0x90 + channel, note, velocity
      this.selectedOutput.send([0x90 + channel, note, 127]);

      // Note off after 100ms
      setTimeout(() => {
        this.selectedOutput.send([0x80 + channel, note, 0]);
      }, 100);
    }
  }

  async reset(): Promise<void> {
    try {
      const midiInfo = await this.getInfo();
      console.log("MIDI devices found:", midiInfo);
    } catch (error) {
      console.error("Error initializing MIDI:", error);
    }
  }

  async changeOutputPort(portName: string): Promise<void> {
    if (!this.midiAccess) {
      await this.reset();
    }

    // Find the output port by name
    for (const [id, output] of this.midiOutputs.entries()) {
      if (output.name === portName) {
        this.selectedOutput = output;
        console.log(`Changed MIDI output to: ${portName}`);
        return;
      }
    }

    console.warn(`MIDI output port "${portName}" not found`);
  }
}
