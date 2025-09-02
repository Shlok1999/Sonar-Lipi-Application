import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { useHeaderHeight } from '@react-navigation/elements';

import TaalGrid from '@/components/TaalGrid';
import { loadComposition, saveComposition } from '@/utils/storage';

export default function CompositionScreen() {
  const { id } = useLocalSearchParams();
  const [composition, setComposition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const gridRef = useRef(null);
  const horizontalScrollRef = useRef(null);
  const scrollViewRef = useRef(null);

  const headerHeight = useHeaderHeight();

  // Keyboard handling
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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

    const divisionIndices = [];
    let sum = 0;
    for (let i = 0; i < taal.structure.length - 1; i++) {
      sum += taal.structure[i];
      divisionIndices.push(sum - 1);
    }

    const tableHeaders = Array.from({ length: taal.numberOfColumns }, (_, i) => {
      const style = divisionIndices.includes(i)
        ? 'border-right: 2px solid #388E3C;'
        : 'border-right: none;';
      return `<th style="${style}">${i + 1}</th>`;
    }).join('');

    const nonEmptyRows = grid.filter((row) => row.some((cell) => (cell || '').trim() !== ''));

    const tableRows = nonEmptyRows
      .map((row) => {
        return (
          `<tr>` +
          row
            .map((cell, i) => {
              const style = divisionIndices.includes(i)
                ? 'border-right: 2px solid #388E3C;'
                : 'border-right: none;';
              return `<td style="${style}">${cell || ''}</td>`;
            })
            .join('') +
          `</tr>`
        );
      })
      .join('');

    return `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              background-color: #fff;
            }
            h2 { color: black; }
            h4 { color: black; text-decoration: underline; }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
              border: 2px solid gray;
            }

            th, td {
              padding: 8px;
              text-align: center;
              border-top: 1px solid #ccc;
              border-bottom: 1px solid #ccc;
            }

            th {
              background-color: white;
            }
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#388E3C" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: composition?.name || 'Composition',
          headerStyle: {
            backgroundColor: '#E8F5E9',
            shadowColor: '#388E3C',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            marginTop: 12,
          },
          headerShown: true,
          headerTitleStyle: {
            color: '#2E7D32',
            fontWeight: '700',
            fontSize: 18,
          },
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="chevron-left" size={22} color="#388E3C" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSavePDF}
              style={styles.saveButton}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#388E3C" size="small" />
              ) : (
                <>
                  <Feather name="download" size={20} color="#2E7D32" />
                  <Text style={styles.saveButtonText}>Save</Text>
                </>
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 20 : 20 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FFF9',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  gridContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 1,
    shadowColor: '#388E3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 16,
    marginBottom: 16,
  },
  horizontalScrollContent: {
    paddingRight: 0,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 142, 60, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#2E7D32',
    fontSize: 15,
    marginLeft: 4,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 142, 60, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 142, 60, 0.2)',
  },
  saveButtonText: {
    color: '#2E7D32',
    fontSize: 15,
    marginLeft: 6,
    fontWeight: '600',
  },
});
