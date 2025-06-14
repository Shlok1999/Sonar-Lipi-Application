import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

const { width: screenWidth } = Dimensions.get('window');

import TaalGrid from '@/components/TaalGrid';
import { loadComposition, saveComposition } from '@/utils/storage';

export default function CompositionScreen() {
  const { id } = useLocalSearchParams();
  const [composition, setComposition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const gridRef = useRef(null);
  const horizontalScrollRef = useRef(null);

  useEffect(() => {
    fetchComposition();
  }, [id]);

  const fetchComposition = async () => {
    if (!id) return;

    setIsLoading(true);
    const data = await loadComposition(id);

    if (!data) {
      router.back();
      return;
    }

    setComposition(data);
    setIsLoading(false);
  };

  const handleGridChange = (newGrid) => {
    const updatedComposition = {
      ...composition,
      grid: newGrid,
      lastEdited: new Date().toISOString(),
    };

    setComposition(updatedComposition);
    saveComposition(updatedComposition);
  };

  const handleAddRow = () => {
    if (!composition) return;
    const emptyRow = Array(composition.taal.numberOfColumns).fill('');
    handleGridChange([...composition.grid, emptyRow]);
  };

  const handleRemoveRow = () => {
    if (!composition || composition.grid.length <= 1) return;
    handleGridChange(composition.grid.slice(0, -1));
  };

  const handleSavePDF = async () => {
    if (!composition) return;
    setIsSaving(true);
    
    try {
      const { uri } = await Print.printToFileAsync({
        html: generatePDFHTML(composition),
      });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Composition PDF',
      });
    } catch (error) {
      console.error('Failed to generate or share PDF:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const generatePDFHTML = (comp) => {
    const { taal, grid, name } = comp;
    const tableHeaders = Array.from({ length: taal.numberOfColumns }, (_, i) => 
      `<th>${i + 1}</th>`
    ).join('');
    
    const tableRows = grid.map(row => 
      `<tr>${row.map(cell => `<td>${cell || ''}</td>`).join('')}</tr>`
    ).join('');

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h2 { color: #6A45D1; }
            h4 { color: #9B2335; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <h2>${name}</h2>
          <h4>Taal: ${taal.name} (${taal.structure.join(' + ')})</h4>
          <table>
            <thead><tr>${tableHeaders}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `;
  };

  const handleScrollLeft = () => {
    horizontalScrollRef.current?.scrollTo({ x: 0, animated: true });
  };

  const handleScrollRight = () => {
    horizontalScrollRef.current?.scrollToEnd({ animated: true });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A45D1" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: composition?.name || 'Composition',
          headerStyle: { backgroundColor: '#F5F7FF' },
          headerTitleStyle: { color: '#1E1E2E', fontWeight: '700' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="chevron-left" size={24} color="#6A45D1" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSavePDF}
              style={styles.saveButton}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#6A45D1" size="small" />
              ) : (
                <Feather name="download" size={24} color="#6A45D1" />
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.taalName}>{composition?.taal.name}</Text>
            <Text style={styles.taalInfo}>
              Structure: {composition?.taal.structure.join(' + ')}
            </Text>
          </View>

          <View style={styles.gridContainer}>
            <ViewShot ref={gridRef} options={{ format: 'png', quality: 1 }}>
              <ScrollView 
                horizontal 
                ref={horizontalScrollRef}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContent}
              >
                <TaalGrid
                  taal={composition?.taal}
                  grid={composition?.grid}
                  onChange={handleGridChange}
                />
              </ScrollView>
            </ViewShot>
          </View>

          <View style={styles.scrollControls}>
            <ScrollControlButton 
              icon="chevron-left" 
              label="Scroll Left" 
              onPress={handleScrollLeft} 
            />
            <ScrollControlButton 
              icon="chevron-right" 
              label="Scroll Right" 
              onPress={handleScrollRight} 
              style={{ marginLeft: 12 }}
            />
          </View>

          <View style={styles.rowControls}>
            <ActionButton 
              icon="plus" 
              label="Add Row" 
              onPress={handleAddRow} 
              color="#6A45D1"
            />
            <ActionButton 
              icon="trash-2" 
              label="Remove Row" 
              onPress={handleRemoveRow} 
              color="#FF6B8B"
              disabled={!composition || composition.grid.length <= 1}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const ScrollControlButton = ({ icon, label, onPress, style }) => (
  <TouchableOpacity 
    style={[styles.scrollControlButton, style]} 
    onPress={onPress}
  >
    <Feather name={icon} size={20} color="#6A45D1" />
    <Text style={styles.scrollControlText}>{label}</Text>
  </TouchableOpacity>
);

const ActionButton = ({ icon, label, onPress, color, disabled = false }) => (
  <TouchableOpacity
    style={[styles.actionButton, { backgroundColor: color, opacity: disabled ? 0.6 : 1 }]}
    onPress={onPress}
    disabled={disabled}
  >
    <Feather name={icon} size={20} color="white" />
    <Text style={styles.actionButtonText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#6A45D1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  taalName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1E2E',
    marginBottom: 4,
  },
  taalInfo: {
    fontSize: 16,
    color: '#6D6D8A',
  },
  gridContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 1,
    shadowColor: '#6A45D1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  horizontalScrollContent: {
    paddingRight: 20,
  },
  scrollControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  scrollControlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E9FF',
    backgroundColor: 'white',
  },
  scrollControlText: {
    color: '#6A45D1',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  rowControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  saveButton: {
    padding: 8,
    marginRight: 8,
  },
});

