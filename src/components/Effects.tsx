import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useStateContext } from "../context/StateContext";
import { MidiService } from "../services/MidiService";

export const Effects: React.FC = () => {
  const state = useStateContext();
  const [midiService] = useState(() => new MidiService());

  // Create a grid of effect buttons for channels 1-15
  const renderEffects = () => {
    const effects: React.ReactNode[] = [];
    // MIDI channels 1-15 (channel 0 is used for scenes)
    for (let channel = 1; channel <= 15; channel++) {
      effects.push(
        <View key={`channel-${channel}`} style={styles.channelRow}>
          <Text style={styles.channelLabel}>Ch {channel}</Text>
          <View style={styles.effectsRow}>
            {/* Create 8 effect buttons per channel */}
            {Array.from({ length: 8 }, (_, i) => {
              const note = channel * 10 + i; // Simple mapping for demo purposes
              return (
                <TouchableOpacity
                  key={`effect-${channel}-${i}`}
                  style={styles.effectButton}
                  onPress={() => midiService.playNote(note, channel)}
                >
                  <Text style={styles.effectText}>{i + 1}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      );
    }
    return effects;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Effects</Text>
      <ScrollView style={styles.effectsContainer}>{renderEffects()}</ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  effectsContainer: {
    maxHeight: 300,
  },
  channelRow: {
    marginBottom: 12,
  },
  channelLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  effectsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  effectButton: {
    width: 40,
    height: 40,
    margin: 2,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  effectText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
