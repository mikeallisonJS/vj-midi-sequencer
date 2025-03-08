import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface AppState {
  loading: boolean
  activeScene: number
  bars: number
  bpm: number
  direction: number
  loop: boolean
  maxNote: number
  midiInPort: string | null
  midiOutPort: string | null
  minNote: number
  playing: boolean
  repeat: boolean

  setActiveScene: (value: number) => void
  setBars: (value: number) => void
  setBpm: (value: number) => void
  setDirection: (value: number) => void
  setLoop: (value: boolean) => void
  setMaxNote: (value: number) => void
  setMidiInPort: (value: string) => void
  setMidiOutPort: (value: string) => void
  setMinNote: (value: number) => void
  setPlaying: (value: boolean) => void
  setRepeat: (value: boolean) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      loading: true,
      activeScene: 30, // Default to minNote
      bars: 32,
      bpm: 174,
      direction: 0,
      loop: false,
      maxNote: 80,
      midiInPort: null,
      midiOutPort: null,
      minNote: 30,
      playing: false,
      repeat: true,

      setActiveScene: (value) => set({ activeScene: value }),
      setBars: (value) => set({ bars: value }),
      setBpm: (value) => set({ bpm: value }),
      setDirection: (value) => set({ direction: value }),
      setLoop: (value) => set({ loop: value }),
      setMaxNote: (value) => set({ maxNote: Math.max(value, 31) }), // Ensure maxNote is at least minNote + 1
      setMidiInPort: (value) => set({ midiInPort: value }),
      setMidiOutPort: (value) => set({ midiOutPort: value }),
      setMinNote: (value) =>
        set((state) => ({
          minNote: value,
          // Ensure maxNote is at least minNote + 1
          maxNote: state.maxNote <= value ? value + 1 : state.maxNote,
        })),
      setPlaying: (value) => set({ playing: value }),
      setRepeat: (value) => set({ repeat: value }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
