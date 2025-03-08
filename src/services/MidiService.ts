import { requestMIDIAccess } from '@motiz88/react-native-midi';
import { useStore } from '../store/useStore';

// Define proper types for MIDI interfaces
interface MIDIPort {
  id: string;
  name: string;
  manufacturer: string;
  state: string;
  type: string;
  version: string;
  connection: string;
}

interface MIDIInput extends MIDIPort {
  onmidimessage: ((event: MIDIMessageEvent) => void) | null;
}

interface MIDIOutput extends MIDIPort {
  send: (data: number[], timestamp?: number) => void;
  clear: () => void;
}

interface MIDIMessageEvent {
  data: Uint8Array;
  timeStamp: number;
}

interface MIDIAccess {
  inputs: Map<string, MIDIInput>;
  outputs: Map<string, MIDIOutput>;
  onstatechange: ((event: MIDIConnectionEvent) => void) | null;
}

interface MIDIConnectionEvent {
  port: MIDIPort;
  timeStamp: number;
}

export const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const octaves = ['-2', '-1', '0', '1', '2', '3', '4', '5', '6', '7', '8'];

export function buildNoteList(): string[] {
  const notes: string[] = [];
  for (let i = 0; i < 128; i++) {
    notes.push(keys[i % keys.length] + octaves[Math.floor((i + 3) / keys.length)]);
  }
  return notes;
}
export class MidiService {
  midiAccess: MIDIAccess | null = null;
  midiInputs: Map<string, MIDIInput>;
  midiOutputs: Map<string, MIDIOutput>;
  selectedOutput: MIDIOutput | null = null;

  constructor() {
    this.midiInputs = new Map();
    this.midiOutputs = new Map();
    this.reset();
  }

  async getInfo() {
    try {
      this.midiAccess = (await requestMIDIAccess()) as unknown as MIDIAccess;

      // Clear existing maps
      this.midiInputs.clear();
      this.midiOutputs.clear();

      // Populate inputs
      this.midiAccess.inputs.forEach((input: MIDIInput, id: string) => {
        this.midiInputs.set(id, input);
      });

      // Populate outputs
      this.midiAccess.outputs.forEach((output: MIDIOutput, id: string) => {
        this.midiOutputs.set(id, output);
      });

      return {
        inputs: Array.from(this.midiInputs.values()),
        outputs: Array.from(this.midiOutputs.values()),
      };
    } catch (error) {
      console.error('Failed to get MIDI access:', error);
      return { inputs: [], outputs: [] };
    }
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
        if (this.selectedOutput) {
          this.selectedOutput.send([0x80 + channel, note, 0]);
        }
      }, 100);
    }
  }

  async reset(): Promise<void> {
    try {
      const midiInfo = await this.getInfo();
      console.log('MIDI devices found:', midiInfo);

      // Get the current MIDI output port from the store
      const { midiOutPort } = useStore.getState();
      if (midiOutPort) {
        await this.changeOutputPort(midiOutPort);
      }
    } catch (error) {
      console.error('Error initializing MIDI:', error);
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

        // Update the store with the selected port
        useStore.getState().setMidiOutPort(portName);
        return;
      }
    }

    console.warn(`MIDI output port "${portName}" not found`);
  }
}
