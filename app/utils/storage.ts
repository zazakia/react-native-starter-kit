import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@notes_app_storage';

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

export const saveNote = async (note: Note): Promise<void> => {
  try {
    console.log('Getting existing notes...');
    const existingNotes = await getNotes();
    console.log('Current notes count:', existingNotes.length);
    
    const updatedNotes = [note, ...existingNotes];
    console.log('New notes count:', updatedNotes.length);
    
    const notesString = JSON.stringify(updatedNotes);
    await AsyncStorage.setItem(STORAGE_KEY, notesString);
    console.log('Notes saved successfully');
  } catch (error) {
    console.error('Error saving note:', error);
    throw new Error('Failed to save note: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const getNotes = async (): Promise<Note[]> => {
  try {
    console.log('Fetching notes from storage...');
    const notesString = await AsyncStorage.getItem(STORAGE_KEY);
    console.log('Notes string from storage:', notesString ? 'Found' : 'Not found');
    
    if (!notesString) {
      console.log('No notes found, returning empty array');
      return [];
    }
    
    const notes = JSON.parse(notesString);
    console.log('Notes parsed successfully, count:', notes.length);
    return notes;
  } catch (error) {
    console.error('Error getting notes:', error);
    return [];
  }
};

export const deleteNote = async (noteId: string): Promise<void> => {
  try {
    console.log('Starting to delete note with ID:', noteId);
    const existingNotes = await getNotes();
    console.log('Current notes count:', existingNotes.length);
    
    const updatedNotes = existingNotes.filter(note => note.id !== noteId);
    console.log('Notes count after filtering:', updatedNotes.length);
    
    if (existingNotes.length === updatedNotes.length) {
      console.warn('Note not found for deletion:', noteId);
      throw new Error('Note not found');
    }
    
    const notesString = JSON.stringify(updatedNotes);
    await AsyncStorage.setItem(STORAGE_KEY, notesString);
    console.log('Note deleted successfully');
  } catch (error) {
    console.error('Error deleting note:', error);
    throw new Error('Failed to delete note: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const updateNote = async (updatedNote: Note): Promise<void> => {
  try {
    const existingNotes = await getNotes();
    const updatedNotes = existingNotes.map(note =>
      note.id === updatedNote.id ? updatedNote : note
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

// Default export containing all storage utilities
const StorageUtils = {
  saveNote,
  getNotes,
  deleteNote,
  updateNote,
  STORAGE_KEY,
};

export default StorageUtils;