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
  Animated,
  Easing,
  SafeAreaView,
  Keyboard
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
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [scale, setScale] = useState(1);
  const scaleValue = useRef(new Animated.Value(1)).current;
  const gridRef = useRef(null);
  const horizontalScrollRef = useRef(null);
  const scrollViewRef = useRef(null);

  const headerHeight = useHeaderHeight();

  // Add keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
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
        ? 'border-right: 3px solid black;'
        : 'border-right: none;';
      return `<th style="${style}">${i + 1}</th>`;
    }).join('');

    const nonEmptyRows = grid.filter(row =>
      row.some(cell => (cell || '').trim() !== '')
    );

    const tableRows = nonEmptyRows.map(row => {
      return (
        `<tr>` +
        row.map((cell, i) => {
          const style = divisionIndices.includes(i)
            ? 'border-right: 3px solid black;'
            : 'border-right: none;';
          return `<td style="${style}">${cell || ''}</td>`;
        }).join('') +
        `</tr>`
      );
    }).join('');

    return `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
            }
            h2 { color: #6A45D1; }
            h4 { color: #9B2335; }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
              border: 2px solid black;
            }

            th, td {
              padding: 8px;
              text-align: center;
              border-top: 1px solid #ccc;
              border-bottom: 1px solid #ccc;
            }

            th {
              background-color: #f5f5f5;
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
        <ActivityIndicator size="large" color="#6A45D1" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: composition?.name || 'Composition',
          headerStyle: {
            backgroundColor: '#F5F7FF',
            shadowColor: '#6A45D1',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            // elevation: 3,
          },
          headerShown: true,
          headerTitleStyle: {
            color: '#1E1E2E',
            fontWeight: '700',
            fontSize: 18,
          },
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="chevron-left" size={24} color="#6A45D1" />
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
                <ActivityIndicator color="#6A45D1" size="small" />
              ) : (
                <>
                  <Feather name="download" size={20} color="#6A45D1" />
                  <Text style={styles.saveButtonText}>Save</Text>
                </>
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidContainer}
          keyboardVerticalOffset={headerHeight}
        > */}
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 20 : 100 }
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
        {/* </KeyboardAvoidingView> */}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FF',
  },
  keyboardAvoidContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  scrollContent: {
    paddingRight: 20,
    paddingBottom: 0,
  },
  headerContainer: {
    marginBottom: 0,
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
    paddingRight: 0,
  },
  headerLeftContainer: {
    marginLeft: 8,
  },
  headerRightContainer: {
    marginRight: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    color: '#6A45D1',
    fontSize: 16,
    marginLeft: 4,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 69, 209, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(106, 69, 209, 0.2)',
  },
  saveButtonText: {
    color: '#6A45D1',
    fontSize: 16,
    marginLeft: 6,
    fontWeight: '600',
  },
  fixedButtons: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    gap: 10,
    zIndex: 10,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6A45D1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  removeButton: {
    backgroundColor: '#FF6B6B',
  },
});