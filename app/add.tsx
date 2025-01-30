import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from './index';
import { analyzeNoteContent, improveNoteWriting } from '../src/lib/deepseek';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function AddNoteScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
        };

        recognition.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
          if (isListening && recognition) {
            try {
              recognition.start();
            } catch (error) {
              console.error('Error restarting recognition:', error);
            }
          }
        };

        recognition.onresult = (event: any) => {
          console.log('Speech result received:', event.results);
          const transcript = event.results[0][0].transcript;
          console.log('Transcript:', transcript);
          setContent(prev => prev + (prev ? '\n' : '') + transcript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          Alert.alert('Error', 'Failed to recognize speech. Please try again.');
        };

        setRecognition(recognition);
      }
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening]);

  const startListening = useCallback(async () => {
    try {
      if (isListening) {
        if (recognition) {
          recognition.stop();
        }
        setIsListening(false);
        return;
      }

      if (Platform.OS === 'web') {
        if (recognition) {
          await recognition.start();
          console.log('Recognition started');
        } else {
          Alert.alert('Error', 'Speech recognition is not supported in this browser.');
        }
      } else {
        Alert.alert('Coming Soon', 'Speech recognition on mobile will be available soon!');
      }
    } catch (error) {
      console.error('Error with speech recognition:', error);
      setIsListening(false);
      Alert.alert('Error', 'Failed to start speech recognition. Please try again.');
    }
  }, [isListening, recognition]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please enter both title and content for the note.');
      return;
    }
    
    try {
      setIsSaving(true);
      
      const newNote: Note = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        date: new Date().toISOString(),
      };

      const savedNotesString = await AsyncStorage.getItem('notes');
      const savedNotes = savedNotesString ? JSON.parse(savedNotesString) : [];
      const updatedNotes = [newNote, ...savedNotes];
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
      
      router.push('/');
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert(
        'Error',
        'Failed to save note. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyzeContent = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content to analyze.');
      return;
    }

    try {
      setIsAnalyzing(true);
      const analysis = await analyzeNoteContent(content);
      Alert.alert(
        'Content Analysis',
        analysis,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error analyzing content:', error);
      Alert.alert('Error', 'Failed to analyze content. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImproveContent = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content to improve.');
      return;
    }

    try {
      setIsImproving(true);
      const improvedContent = await improveNoteWriting(content);
      setContent(improvedContent);
    } catch (error) {
      console.error('Error improving content:', error);
      Alert.alert('Error', 'Failed to improve content. Please try again.');
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={handleAnalyzeContent}
            style={[styles.aiButton, isAnalyzing && styles.aiButtonDisabled]}
            disabled={isAnalyzing || isImproving || isSaving}
          >
            {isAnalyzing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="analytics-outline" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleImproveContent}
            style={[styles.aiButton, isImproving && styles.aiButtonDisabled]}
            disabled={isAnalyzing || isImproving || isSaving}
          >
            {isImproving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="sparkles-outline" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={startListening}
            style={[styles.recordButton, isListening && styles.recordingButton]}
            disabled={isSaving || isAnalyzing || isImproving}
          >
            <Ionicons 
              name={isListening ? "mic" : "mic-outline"} 
              size={24} 
              color={isListening ? "#FFFFFF" : "#1E293B"} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            style={[
              styles.saveButton,
              (!title.trim() || !content.trim() || isSaving || isAnalyzing || isImproving) && styles.saveButtonDisabled
            ]}
            disabled={!title.trim() || !content.trim() || isSaving || isAnalyzing || isImproving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.titleInput}
          placeholder="Note Title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#94A3B8"
          maxLength={100}
          editable={!isSaving}
        />
        <TextInput
          style={styles.contentInput}
          placeholder="Start typing... or tap the microphone to record"
          value={content}
          onChangeText={setContent}
          placeholderTextColor="#94A3B8"
          multiline
          textAlignVertical="top"
          editable={!isSaving && !isListening}
        />
        {isListening && (
          <View style={styles.recordingIndicator}>
            <Text style={styles.recordingText}>Listening...</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    padding: 8,
  },
  recordButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  recordingButton: {
    backgroundColor: '#EF4444',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  form: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    padding: 0,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
    padding: 0,
  },
  recordingIndicator: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  recordingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  aiButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    marginRight: 8,
  },
  aiButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
}); 