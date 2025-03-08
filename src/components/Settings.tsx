import type React from 'react';
import { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MidiService } from '../services/MidiService';
import { useStore } from '../store/useStore';

interface SettingsProps {
  visible: boolean;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ visible, onClose }) => {
  const state = useStore();
  const [midiService] = useState(() => new MidiService());
  const [midiInPort, setMidiInPort] = useState(state.midiInPort);
  const [midiOutPort, setMidiOutPort] = useState(state.midiOutPort);

  const handleSave = () => {
    state.setMidiInPort(midiInPort);
    state.setMidiOutPort(midiOutPort);
    midiService.changeOutputPort(midiOutPort);
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Settings</Text>

          <ScrollView style={styles.scrollView}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>MIDI Input Port:</Text>
              <TextInput
                style={styles.input}
                value={midiInPort}
                onChangeText={setMidiInPort}
                placeholder="Enter MIDI input port"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>MIDI Output Port:</Text>
              <TextInput
                style={styles.input}
                value={midiOutPort}
                onChangeText={setMidiOutPort}
                placeholder="Enter MIDI output port"
              />
            </View>

            {/* Additional settings can be added here */}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.buttonCancel]} onPress={onClose}>
              <Text style={styles.textStyle}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonSave]} onPress={handleSave}>
              <Text style={styles.textStyle}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    marginHorizontal: 5,
  },
  buttonCancel: {
    backgroundColor: '#9e9e9e',
  },
  buttonSave: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
