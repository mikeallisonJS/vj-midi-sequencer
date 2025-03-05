import React, { createContext, useContext, useState, ReactNode } from "react";

interface StateContextType {
  activeScene: number;
  bars: number;
  setBars: (value: number) => void;
  bpm: number;
  setBpm: (value: number) => void;
  direction: number;
  setDirection: (value: number) => void;
  loop: boolean;
  setLoop: (value: boolean) => void;
  maxNote: number;
  setMaxNote: (value: number) => void;
  midiInPort: string;
  setMidiInPort: (value: string) => void;
  midiOutPort: string;
  setMidiOutPort: (value: string) => void;
  minNote: number;
  setMinNote: (value: number) => void;
  playing: boolean;
  setPlaying: (value: boolean) => void;
  repeat: boolean;
  setRepeat: (value: boolean) => void;
  setActiveScene: (value: number) => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [activeScene, setActiveScene] = useState<number>(30); // Default to minNote
  const [bars, setBars] = useState<number>(32);
  const [bpm, setBpm] = useState<number>(174);
  const [direction, setDirection] = useState<number>(0);
  const [loop, setLoop] = useState<boolean>(false);
  const [maxNote, setMaxNote] = useState<number>(80);
  const [midiInPort, setMidiInPort] = useState<string>("Maschine jam - 1");
  const [midiOutPort, setMidiOutPort] = useState<string>("MIDI In");
  const [minNote, setMinNote] = useState<number>(30);
  const [playing, setPlaying] = useState<boolean>(false);
  const [repeat, setRepeat] = useState<boolean>(true);

  return (
    <StateContext.Provider
      value={{
        activeScene,
        setActiveScene,
        bars,
        setBars,
        bpm,
        setBpm,
        direction,
        setDirection,
        loop,
        setLoop,
        maxNote,
        setMaxNote,
        midiInPort,
        setMidiInPort,
        midiOutPort,
        setMidiOutPort,
        minNote,
        setMinNote,
        playing,
        setPlaying,
        repeat,
        setRepeat,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = (): StateContextType => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error("useStateContext must be used within a StateProvider");
  }
  return context;
};
