import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";
import { Transport } from "./src/components/Transport";
import { Scenes } from "./src/components/Scenes";
import { Effects } from "./src/components/Effects";
import { Settings } from "./src/components/Settings";
import { MidiService } from "./src/services/MidiService";

export default function App() {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [midiService] = useState(() => new MidiService());

  const handlePanic = () => {
    midiService.reset();
    // Additional panic actions can be added here
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>VJ MIDI Sequencer</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={handlePanic}>
            <Text style={styles.iconText}>!</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setSettingsVisible(true)}
          >
            <Text style={styles.iconText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Transport />

        <View style={styles.row}>
          <Scenes />
        </View>

        <View style={styles.row}>
          <Effects />
        </View>
      </ScrollView>

      <Settings
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerButtons: {
    flexDirection: "row",
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    backgroundColor: "#eee",
    borderRadius: 20,
  },
  iconText: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  row: {
    marginBottom: 16,
  },
});
