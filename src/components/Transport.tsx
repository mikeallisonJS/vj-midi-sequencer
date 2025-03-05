import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TextInput,
} from "react-native";
import { useStateContext } from "../context/StateContext";
import { MidiService } from "../services/MidiService";
import { TransportService } from "../services/TransportService";

export const Transport: React.FC = () => {
  const state = useStateContext();
  const [midiService] = useState(() => new MidiService());
  const [transportService] = useState(() => new TransportService(midiService));
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [isBlinking, setIsBlinking] = useState(false);
  const [currentBar, setCurrentBar] = useState(0);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  // Input field states
  const [bpmInput, setBpmInput] = useState(state.bpm.toString());
  const [barsInput, setBarsInput] = useState(state.bars.toString());
  const [minNoteInput, setMinNoteInput] = useState(state.minNote.toString());
  const [maxNoteInput, setMaxNoteInput] = useState(state.maxNote.toString());

  // Update input fields when state changes
  useEffect(() => {
    setBpmInput(state.bpm.toString());
    setBarsInput(state.bars.toString());
    setMinNoteInput(state.minNote.toString());
    setMaxNoteInput(state.maxNote.toString());
  }, [state.bpm, state.bars, state.minNote, state.maxNote]);

  // Calculate progress percentage based on current bar and beat
  useEffect(() => {
    if (state.playing) {
      // Calculate progress within the current set of bars
      // Each beat is 1/4 of a bar, so we have (currentBar * 4 + currentBeat) steps
      // out of (state.bars * 4) total steps
      const totalSteps = state.bars * 4;
      const currentStep = currentBar * 4 + currentBeat;
      const percent = (currentStep / totalSteps) * 100;
      setProgressPercent(percent);
    }
  }, [currentBar, currentBeat, state.bars, state.playing]);

  // Set up the bar and beat change listeners
  useEffect(() => {
    transportService.setBarChangeListener((bar) => {
      console.log("Bar changed to:", bar);
      setCurrentBar(bar);
    });

    transportService.setBeatChangeListener((beat) => {
      console.log("Beat changed to:", beat);
      setCurrentBeat(beat);
    });

    return () => {
      transportService.removeBarChangeListener();
      transportService.removeBeatChangeListener();
    };
  }, [transportService]);

  // Log when active scene changes
  useEffect(() => {
    console.log("Active scene changed to:", state.activeScene);
  }, [state.activeScene]);

  // Log when bars setting changes
  useEffect(() => {
    console.log("Bars setting changed to:", state.bars);
  }, [state.bars]);

  // Set up the blinking animation based on BPM
  useEffect(() => {
    let blinkInterval: NodeJS.Timeout | null = null;

    if (state.playing) {
      // Calculate beat duration in milliseconds (60000ms / BPM = ms per beat)
      const beatDuration = 60000 / state.bpm;

      // Start the blinking animation
      setIsBlinking(true);

      // Create a repeating animation
      const startPulseAnimation = () => {
        Animated.sequence([
          // Pulse in
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: beatDuration / 4,
            useNativeDriver: true,
          }),
          // Pulse out
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: beatDuration / 4,
            useNativeDriver: true,
          }),
        ]).start();
      };

      // Initial animation
      startPulseAnimation();
    } else {
      // Stop blinking when not playing
      setIsBlinking(false);
      pulseAnim.setValue(1);
    }

    // Clean up interval on unmount or when dependencies change
    return () => {
      if (blinkInterval) {
        clearInterval(blinkInterval);
      }
    };
  }, [state.playing, state.bpm, pulseAnim]);

  // Handle input validation and update
  const handleInputChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    stateSetter: (value: number) => void,
    min: number,
    max: number,
  ) => {
    // Allow empty string during typing
    if (value === "") {
      setter(value);
      return;
    }

    // Only allow numeric input
    if (!/^\d+$/.test(value)) {
      return;
    }

    setter(value);

    // Convert to number and validate range
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      stateSetter(numValue);
    }
  };

  // Handle input blur (when user finishes editing)
  const handleInputBlur = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    stateSetter: (value: number) => void,
    currentValue: number,
    min: number,
    max: number,
  ) => {
    // If empty or invalid, reset to current value
    if (value === "" || !/^\d+$/.test(value)) {
      setter(currentValue.toString());
      return;
    }

    // Parse and validate the value
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      setter(currentValue.toString());
    } else {
      // Clamp value to valid range
      const clampedValue = Math.max(min, Math.min(max, numValue));
      setter(clampedValue.toString());
      stateSetter(clampedValue);
    }
  };

  // Generate bar indicators
  const renderBarIndicators = () => {
    const indicators = [];
    for (let i = 0; i < state.bars; i++) {
      // Create a container for each bar with its beat indicators
      indicators.push(
        <View key={`bar-${i}`} style={styles.barContainer}>
          {/* Bar label */}
          <Text style={styles.barLabel}>{i + 1}</Text>

          {/* Beat indicators */}
          <View style={styles.beatContainer}>
            {[0, 1, 2, 3].map((beat) => {
              const isCurrentBar = i === currentBar;
              const isActiveBeat = isCurrentBar && beat <= currentBeat;
              const isCurrentBeat = isCurrentBar && beat === currentBeat;
              const isPastBar = i < currentBar && state.playing;

              // Use Animated.View for the current beat to apply the pulse animation
              if (isCurrentBeat && state.playing) {
                return (
                  <Animated.View
                    key={`beat-${beat}`}
                    style={[
                      styles.beatIndicator,
                      styles.activeBeatIndicator,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  />
                );
              }

              // Regular View for other beats
              return (
                <View
                  key={`beat-${beat}`}
                  style={[
                    styles.beatIndicator,
                    (isActiveBeat || isPastBar) && state.playing
                      ? styles.activeBeatIndicator
                      : {},
                  ]}
                />
              );
            })}
          </View>
        </View>,
      );
    }
    return indicators;
  };

  // Get note name from MIDI note number
  const getNoteNameFromNumber = (noteNumber: number): string => {
    const noteNames = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ];
    const octave = Math.floor(noteNumber / 12) - 1;
    const noteName = noteNames[noteNumber % 12];
    return `${noteName}${octave}`;
  };

  // Calculate next scene
  const getNextScene = (): number => {
    if (state.activeScene >= state.maxNote) {
      return state.repeat ? state.minNote : state.activeScene;
    }
    return state.activeScene + 1;
  };

  return (
    <View style={styles.container}>
      {/* Current Scene Display */}
      <View style={styles.sceneContainer}>
        <View>
          <Text style={styles.sceneLabel}>Current Scene:</Text>
          <View style={styles.sceneValueContainer}>
            <Text style={styles.sceneValue}>{state.activeScene}</Text>
            <Text style={styles.sceneNoteName}>
              {getNoteNameFromNumber(state.activeScene)}
            </Text>
          </View>
        </View>

        <View>
          <Text style={styles.sceneLabel}>Next Scene:</Text>
          <View style={styles.sceneValueContainer}>
            <Text style={[styles.sceneValue, styles.nextSceneValue]}>
              {getNextScene()}
            </Text>
            <Text style={styles.sceneNoteName}>
              {getNoteNameFromNumber(getNextScene())}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
        <Text style={styles.progressText}>
          Bar {currentBar + 1}/{state.bars}, Beat {currentBeat + 1}/4
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>BPM:</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => state.setBpm(Math.max(1, state.bpm - 1))}
        >
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={bpmInput}
          onChangeText={(value) =>
            handleInputChange(value, setBpmInput, state.setBpm, 1, 300)
          }
          onBlur={() =>
            handleInputBlur(
              bpmInput,
              setBpmInput,
              state.setBpm,
              state.bpm,
              1,
              300,
            )
          }
          keyboardType="numeric"
          maxLength={3}
          selectTextOnFocus
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => state.setBpm(state.bpm + 1)}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Bars:</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => state.setBars(Math.max(1, state.bars - 1))}
        >
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={barsInput}
          onChangeText={(value) =>
            handleInputChange(value, setBarsInput, state.setBars, 1, 64)
          }
          onBlur={() =>
            handleInputBlur(
              barsInput,
              setBarsInput,
              state.setBars,
              state.bars,
              1,
              64,
            )
          }
          keyboardType="numeric"
          maxLength={2}
          selectTextOnFocus
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => state.setBars(state.bars + 1)}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Bar and Beat Indicators */}
      <View style={styles.barIndicatorsContainer}>{renderBarIndicators()}</View>

      <View style={styles.row}>
        <Text style={styles.label}>Min Note:</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => state.setMinNote(Math.max(0, state.minNote - 1))}
        >
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={minNoteInput}
          onChangeText={(value) =>
            handleInputChange(
              value,
              setMinNoteInput,
              state.setMinNote,
              0,
              state.maxNote - 1,
            )
          }
          onBlur={() =>
            handleInputBlur(
              minNoteInput,
              setMinNoteInput,
              state.setMinNote,
              state.minNote,
              0,
              state.maxNote - 1,
            )
          }
          keyboardType="numeric"
          maxLength={3}
          selectTextOnFocus
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            state.setMinNote(Math.min(state.maxNote - 1, state.minNote + 1))
          }
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Max Note:</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            state.setMaxNote(Math.max(state.minNote + 1, state.maxNote - 1))
          }
        >
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={maxNoteInput}
          onChangeText={(value) =>
            handleInputChange(
              value,
              setMaxNoteInput,
              state.setMaxNote,
              state.minNote + 1,
              127,
            )
          }
          onBlur={() =>
            handleInputBlur(
              maxNoteInput,
              setMaxNoteInput,
              state.setMaxNote,
              state.maxNote,
              state.minNote + 1,
              127,
            )
          }
          keyboardType="numeric"
          maxLength={3}
          selectTextOnFocus
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => state.setMaxNote(Math.min(127, state.maxNote + 1))}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlRow}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            state.playing ? styles.activeButton : {},
          ]}
          onPress={() => transportService.playToggle(state)}
        >
          <Text style={styles.controlButtonText}>
            {state.playing ? "Stop" : "Play"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            state.setActiveScene(state.minNote);
            if (state.playing) {
              transportService.restart(state);
            }
          }}
        >
          <Text style={styles.controlButtonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            state.repeat ? styles.activeButton : {},
          ]}
          onPress={() => state.setRepeat(!state.repeat)}
        >
          <Text style={styles.controlButtonText}>Repeat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 16,
  },
  sceneContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#e0e0e0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  sceneLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  sceneValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sceneValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginRight: 8,
  },
  nextSceneValue: {
    color: "#FF9800", // Orange color for next scene
  },
  sceneNoteName: {
    fontSize: 16,
    color: "#666",
  },
  progressBarContainer: {
    height: 24,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    position: "absolute",
    left: 0,
    top: 0,
  },
  progressText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    lineHeight: 24,
    color: "#333",
    fontWeight: "bold",
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    width: 80,
    fontSize: 16,
    fontWeight: "bold",
  },
  value: {
    width: 50,
    textAlign: "center",
    fontSize: 16,
  },
  input: {
    width: 50,
    height: 40,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    textAlign: "center",
    fontSize: 16,
    paddingHorizontal: 4,
  },
  button: {
    width: 40,
    height: 40,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginHorizontal: 8,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  controlButton: {
    flex: 1,
    backgroundColor: "#ddd",
    padding: 12,
    borderRadius: 4,
    marginHorizontal: 4,
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#4CAF50",
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  barIndicatorsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  barContainer: {
    margin: 4,
    alignItems: "center",
  },
  barLabel: {
    fontSize: 10,
    marginBottom: 2,
    color: "#666",
  },
  beatContainer: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    padding: 2,
  },
  beatIndicator: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: "#ccc",
    margin: 2,
  },
  activeBeatIndicator: {
    backgroundColor: "#4CAF50",
  },
});
