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
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';




import TaalGrid from '@/components/TaalGrid';
import { loadComposition, saveComposition } from '@/utils/storage';

export default function CompositionScreen() {
  const { id } = useLocalSearchParams();
  const [composition, setComposition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const gridRef = useRef(null);
  const horizontalScrollRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);


  const handleScrollLeft = () => {
    horizontalScrollRef.current?.scrollTo({ x: 0, animated: true });
  };

  const handleScrollRight = () => {
    horizontalScrollRef.current?.scrollToEnd({ animated: true });
  };


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

    const { taal } = composition;
    const emptyRow = Array(taal.numberOfColumns).fill('');

    const updatedGrid = [...composition.grid, emptyRow];
    handleGridChange(updatedGrid);
  };

  const handleRemoveRow = () => {
    if (!composition || composition.grid.length === 0) return;

    const updatedGrid = composition.grid.slice(0, -1);
    handleGridChange(updatedGrid);
  };


  const handleSavePDF = async () => {
  if (!composition) return;

  setIsSaving(true);

  try {
    const { taal, grid, name } = composition;
    const numberOfColumns = taal.numberOfColumns;

    // Generate HTML table
    const tableHeaders = Array.from({ length: numberOfColumns }, (_, i) => `<th>${i + 1}</th>`).join('');
    const tableRows = grid
      .map(row => {
        const cells = row.map(cell => `<td>${cell || ''}</td>`).join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
            }
            th, td {
              border: 1px solid #000;
              padding: 6px;
              text-align: center;
            }
            th {
              background-color: #f0f0f0;
            }
          </style>
        </head>
        <body>
          <h2>${name}</h2>
          <h4>Taal: ${taal.name}</h4>
          <table>
            <thead><tr>${tableHeaders}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `;

    // Generate PDF from HTML
    const { uri } = await Print.printToFileAsync({ html });

    // Share the PDF
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
  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9B2335" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: composition?.name || 'Composition',
          headerStyle: {
            backgroundColor: '#FFF8E7',
          },
          headerTitleStyle: {
            color: '#5E3023',
            fontWeight: '600',
          },
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="#5E3023" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSavePDF}
              style={styles.saveButton}
              disabled={isSaving}
            >
              <Feather name="save" size={24} color="#5E3023" />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Move the header here — above ScrollView */}
        <View style={styles.headerContainer}>
          <Text style={styles.taalName}>{composition?.taal.name}</Text>
          <Text style={styles.taalInfo}>
            Structure: {composition?.taal.structure.join(' + ')}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {composition && (
            <ViewShot ref={gridRef} options={{ format: 'png', quality: 1 }}>
              {isCapturing ? (
                // Render full grid without ScrollView to show full width
                <TaalGrid
                  taal={composition.taal}
                  grid={composition.grid}
                  onChange={handleGridChange}
                />
              ) : (
                // Normal scrollable view
                <ScrollView horizontal ref={horizontalScrollRef}>
                  <TaalGrid
                    taal={composition.taal}
                    grid={composition.grid}
                    onChange={handleGridChange}
                  />
                </ScrollView>
              )}
            </ViewShot>

          )}

          <View style={styles.scrollButtonContainer}>
            <TouchableOpacity style={styles.controlButton} onPress={handleScrollLeft}>
              <Feather name="arrow-left" size={18} color="#FFF8E7" />
              <Text style={styles.controlText}>Left</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, { marginLeft: 12 }]}
              onPress={handleScrollRight}
            >
              <Feather name="arrow-right" size={18} color="#FFF8E7" />
              <Text style={styles.controlText}>Right</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rowControls}>
            <TouchableOpacity style={styles.controlButton} onPress={handleAddRow}>
              <Feather name="plus" size={18} color="#FFF8E7" />
              <Text style={styles.controlText}>Add Row</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.removeButton]}
              onPress={handleRemoveRow}
            >
              <Feather name="trash-2" size={18} color="#FFF8E7" />
              <Text style={styles.controlText}>Remove Row</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.spacer} />
        </ScrollView>
      </KeyboardAvoidingView>

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
  },
  headerContainer: {
    marginBottom: 16,
    marginTop: 30
  },
  taalName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#5E3023',
    marginBottom: 4,
  },
  taalInfo: {
    fontSize: 16,
    color: '#9B2335',
    marginBottom: 16,
  },
  addRowButton: {
    backgroundColor: '#9B2335',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addRowText: {
    color: '#FFF8E7',
    fontWeight: '600',
    marginLeft: 8,
  },
  backButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
    marginRight: 8,
  },
  spacer: {
    height: 40,
  },
  rowControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
  },
  controlButton: {
    backgroundColor: '#9B2335',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#A30000',
  },
  controlText: {
    color: '#FFF8E7',
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
});