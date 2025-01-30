import { View, Text, TouchableOpacity, TextInput, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  category?: 'Personal' | 'Academic' | 'Work' | 'Others';
}

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    total: 25, // GB
  });

  const loadNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const savedNotesString = await AsyncStorage.getItem('notes');
      const savedNotes = savedNotesString ? JSON.parse(savedNotesString) : [];
      setNotes(savedNotes);
      setFilteredNotes(savedNotes);

      // Calculate storage used (mock calculation)
      const storageUsed = (savedNotes.length * 0.01); // Assume each note takes 0.01 GB
      setStorageInfo(prev => ({ ...prev, used: Number(storageUsed.toFixed(3)) }));
    } catch (error) {
      console.error('Error loading notes:', error);
      Alert.alert('Error', 'Failed to load notes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes])
  );

  const handleAddNote = () => {
    router.push('/add');
  };

  const handleDeleteNote = async (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              const updatedNotes = notes.filter(note => note.id !== noteId);
              await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
              setNotes(updatedNotes);
              setFilteredNotes(updatedNotes);
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredNotes(notes);
    } else {
      const filtered = notes.filter(
        note =>
          note.title.toLowerCase().includes(text.toLowerCase()) ||
          note.content.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredNotes(filtered);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      );
    }

    if (searchQuery && filteredNotes.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#CBD5E1" />
          <Text style={styles.emptyText}>No matching notes found</Text>
          <Text style={styles.emptySubText}>Try a different search term</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
        <Text style={styles.emptyText}>No notes yet</Text>
        <Text style={styles.emptySubText}>Tap the + button to create a note</Text>
      </View>
    );
  };

  const renderNoteItem = ({ item }: { item: Note }) => (
    <View style={styles.noteItem}>
      <TouchableOpacity 
        style={styles.noteContent}
        onPress={() => {
          // Add view/edit functionality later
          console.log('Note pressed:', item.id);
        }}
      >
        <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.notePreview} numberOfLines={2}>{item.content}</Text>
        <Text style={styles.noteDate}>{formatDate(item.date)}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.deleteButton,
          isDeleting && styles.deleteButtonDisabled
        ]}
        onPress={() => handleDeleteNote(item.id)}
        disabled={isDeleting}
      >
        <Ionicons 
          name="trash-outline" 
          size={20} 
          color={isDeleting ? "#94A3B8" : "#EF4444"} 
        />
      </TouchableOpacity>
    </View>
  );

  const getCategoryStats = (category: string) => {
    const categoryNotes = notes.filter(note => note.category === category);
    const size = (categoryNotes.length * 0.01).toFixed(2);
    return {
      count: categoryNotes.length,
      size: `${size} GB`
    };
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome, User!</Text>
          <Text style={styles.title}>Note-Taking App</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Image 
            source={{ uri: 'https://placekitten.com/100/100' }} 
            style={styles.avatar}
          />
        </View>
      </View>

      {/* Storage Card */}
      <View style={styles.storageCard}>
        <View style={styles.storageIconContainer}>
          <Ionicons name="pie-chart" size={32} color="#FFFFFF" />
        </View>
        <View style={styles.storageInfo}>
          <Text style={styles.storageTitle}>Available Space</Text>
          <Text style={styles.storageText}>
            {storageInfo.used.toFixed(3)} GB of {storageInfo.total} GB Used
          </Text>
        </View>
      </View>

      {/* Category Grid */}
      <View style={styles.categoryGrid}>
        {/* Personal */}
        <TouchableOpacity style={styles.categoryCard}>
          <View style={[styles.categoryIcon, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="document-text" size={24} color="#6366F1" />
          </View>
          <Text style={styles.categoryTitle}>Personal</Text>
          <Text style={styles.categoryCount}>{getCategoryStats('Personal').count} Files</Text>
          <Text style={styles.categorySize}>Size: {getCategoryStats('Personal').size}</Text>
        </TouchableOpacity>

        {/* Academic */}
        <TouchableOpacity style={styles.categoryCard}>
          <View style={[styles.categoryIcon, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="school" size={24} color="#22C55E" />
          </View>
          <Text style={styles.categoryTitle}>Academic</Text>
          <Text style={styles.categoryCount}>{getCategoryStats('Academic').count} Files</Text>
          <Text style={styles.categorySize}>Size: {getCategoryStats('Academic').size}</Text>
        </TouchableOpacity>

        {/* Work */}
        <TouchableOpacity style={styles.categoryCard}>
          <View style={[styles.categoryIcon, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="briefcase" size={24} color="#EF4444" />
          </View>
          <Text style={styles.categoryTitle}>Work</Text>
          <Text style={styles.categoryCount}>{getCategoryStats('Work').count} Files</Text>
          <Text style={styles.categorySize}>Size: {getCategoryStats('Work').size}</Text>
        </TouchableOpacity>

        {/* Others */}
        <TouchableOpacity style={styles.categoryCard}>
          <View style={[styles.categoryIcon, { backgroundColor: '#F0F9FF' }]}>
            <Ionicons name="folder" size={24} color="#3B82F6" />
          </View>
          <Text style={styles.categoryTitle}>Others</Text>
          <Text style={styles.categoryCount}>{getCategoryStats('Others').count} Files</Text>
          <Text style={styles.categorySize}>Size: {getCategoryStats('Others').size}</Text>
        </TouchableOpacity>
      </View>

      {/* Add Note Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddNote}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="document-text" size={24} color="#1E293B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="chatbubble-outline" size={24} color="#94A3B8" />
        </TouchableOpacity>
        <View style={styles.navItem} /> {/* Placeholder for FAB */}
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="bulb-outline" size={24} color="#94A3B8" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="settings-outline" size={24} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#94A3B8"
        />
      </View>

      <FlatList
        data={filteredNotes}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.notesList,
          filteredNotes.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 24,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  notificationButton: {
    padding: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  storageCard: {
    backgroundColor: '#7C3AED',
    margin: 16,
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  storageIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storageInfo: {
    flex: 1,
  },
  storageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  storageText: {
    fontSize: 16,
    color: '#E9D5FF',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  categorySize: {
    fontSize: 14,
    color: '#64748B',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 16,
  },
  navItem: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  notesList: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  noteItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteContent: {
    flex: 1,
    marginRight: 12,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  notePreview: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  deleteButtonDisabled: {
    backgroundColor: '#F1F5F9',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
}); 