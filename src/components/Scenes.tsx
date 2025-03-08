import type React from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MidiService, buildNoteList } from '../services/MidiService';
import { useStore } from '../store/useStore';

export const Scenes: React.FC = () => {
  const state = useStore();
  const [midiService] = useState(() => new MidiService());
  const notesArray = buildNoteList();

  const renderScenes = () => {
    const scenes: React.ReactNode[] = [];
    for (let i = state.minNote; i <= state.maxNote; i++) {
      scenes.push(
        <TouchableOpacity
          key={i}
          style={[styles.sceneButton, state.activeScene === i ? styles.activeScene : null]}
          onPress={() => {
            state.setActiveScene(i);
            midiService.playNote(i, 0);
          }}
        >
          <Text style={styles.sceneText}>{i}</Text>
          <Text style={styles.noteText}>{notesArray[i]}</Text>
        </TouchableOpacity>
      );
    }
    return scenes;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scenes</Text>
      <ScrollView style={styles.scenesContainer}>
        <View style={styles.scenesGrid}>{renderScenes()}</View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scenesContainer: {
    maxHeight: 300,
  },
  scenesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  sceneButton: {
    width: 60,
    height: 60,
    margin: 4,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  activeScene: {
    backgroundColor: '#4CAF50',
  },
  sceneText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteText: {
    fontSize: 12,
  },
});
