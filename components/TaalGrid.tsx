import React, { useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;
const minColWidth = screenWidth / 8;
const avgCharWidth = 8.5;

const TaalGrid = forwardRef(({ taal, grid, onChange }, ref) => {
  const { structure, numberOfColumns } = taal;
  const [columnWidths, setColumnWidths] = useState(
    Array(numberOfColumns).fill(minColWidth)
  );
  const [activeRow, setActiveRow] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const divisionBoundaries = [];
  let currentSum = 0;
  for (let i = 0; i < structure.length; i++) {
    currentSum += structure[i];
    if (i < structure.length - 1) {
      divisionBoundaries.push(currentSum - 1);
    }
  }

  const handleCellChange = (rowIndex, colIndex, text) => {
    const newGrid = [...grid];
    newGrid[rowIndex][colIndex] = text;
    onChange(newGrid);

    setColumnWidths((prev) => {
      const newWidths = [...prev];
      const maxWidth = newGrid.reduce((max, row) => {
        const cellText = row[colIndex] || '';
        const width = cellText.length * avgCharWidth + 16;
        return Math.max(max, Math.max(minColWidth, width));
      }, minColWidth);
      newWidths[colIndex] = maxWidth;
      return newWidths;
    });
  };

  const handleAddRow = (index) => {
    const emptyRow = Array(numberOfColumns).fill('');
    const newGrid = [...grid];
    newGrid.splice(index + 1, 0, emptyRow);
    onChange(newGrid);
  };

  const handleRemoveRow = (index) => {
    if (grid.length <= 1) return;
    const newGrid = [...grid];
    newGrid.splice(index, 1);
    onChange(newGrid);
  };

  const handleClearRow = (index) => {
    const newGrid = [...grid];
    newGrid[index] = Array(numberOfColumns).fill('');
    onChange(newGrid);
  };
  
  const handleInsertRow = (rowIndex) => {
    const newRow = Array(numberOfColumns).fill('');
    const newGrid = [...grid.slice(0, rowIndex + 1), newRow, ...grid.slice(rowIndex + 1)];
    onChange(newGrid);
  };

  const handleDeleteRow = (rowIndex) => {
    if (grid.length <= 1) return;
    const newGrid = grid.filter((_, i) => i !== rowIndex);
    onChange(newGrid);
  };

  const handleRowActionPress = (rowIndex) => {
    setActiveRow(rowIndex);
    setShowActionModal(true);
  };

  const handleAction = (action) => {
    if (activeRow === null) return;
    
    switch(action) {
      case 'add':
        handleAddRow(activeRow);
        break;
      case 'remove':
        handleRemoveRow(activeRow);
        break;
      case 'clear':
        handleClearRow(activeRow);
        break;
      default:
        break;
    }
    
    setShowActionModal(false);
    setActiveRow(null);
  };

  return (
    <View style={styles.mainContainer}>
      {/* Action Modal */}
      <Modal
        visible={showActionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable 
              style={styles.modalButton} 
              onPress={() => handleAction('add')}
            >
              <Text style={styles.modalButtonText}>Add Row Below</Text>
            </Pressable>
            <Pressable 
              style={styles.modalButton} 
              onPress={() => handleAction('remove')}
              disabled={grid.length <= 1}
            >
              <Text style={[styles.modalButtonText, grid.length <= 1 && styles.disabledButton]}>
                Remove Row
              </Text>
            </Pressable>
            <Pressable 
              style={styles.modalButton} 
              onPress={() => handleAction('clear')}
            >
              <Text style={styles.modalButtonText}>Clear Row</Text>
            </Pressable>
            <Pressable 
              style={[styles.modalButton, styles.cancelButton]} 
              onPress={() => setShowActionModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Scrollable Grid */}
      <View style={styles.tableContainer}>
        <ScrollView horizontal>
          <ScrollView>
            <View ref={ref}>
              {/* Header Row */}
              <View style={styles.row}>
                <View style={[styles.rowActionCell, styles.headerCellContainer]}>
                  <Text style={styles.headerText}>#</Text>
                </View>
                {Array.from({ length: numberOfColumns }).map((_, colIndex) => {
                  const isLastInDivision = divisionBoundaries.includes(colIndex);
                  return (
                    <View
                      key={`header-${colIndex}`}
                      style={[
                        styles.headerCellContainer,
                        { width: columnWidths[colIndex] },
                        isLastInDivision && styles.divisionBorder,
                      ]}
                    >
                      <Text style={styles.headerText}>{colIndex + 1}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Data Rows */}
              {grid.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.row}>
                  <TouchableOpacity 
                    style={styles.rowActionCell}
                    onPress={() => handleRowActionPress(rowIndex)}
                  >
                    <Text style={styles.rowNumber}>{rowIndex + 1}</Text>
                  </TouchableOpacity>
                  
                  {row.map((cell, colIndex) => {
                    const isLastInDivision = divisionBoundaries.includes(colIndex);
                    return (
                      <View
                        key={`cell-${rowIndex}-${colIndex}`}
                        style={[
                          styles.cellContainer,
                          { width: columnWidths[colIndex] },
                          isLastInDivision && styles.divisionBorder,
                        ]}
                      >
                        <TextInput
                          style={styles.cell}
                          value={cell}
                          onChangeText={(text) => handleCellChange(rowIndex, colIndex, text)}
                          placeholder=""
                          placeholderTextColor="#999"
                          multiline={false}
                        />
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  tableContainer: {
    flex: 1,
    marginBottom: 40,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  rowActionCell: {
    width: 40,
    backgroundColor: '#e0e0e0',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowNumber: {
    fontWeight: 'bold',
    color: '#333',
  },
  headerCellContainer: {
    backgroundColor: '#f5f5f5',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowActionHeader: {
    width: 70,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  cellContainer: {
    backgroundColor: 'white',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cell: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    color: '#000',
    fontSize: 16,
    paddingHorizontal: 8,
  },
  divisionBorder: {
    borderRightWidth: 2,
    borderRightColor: 'black',
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 70,
    justifyContent: 'center',
  },
  inlineButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6A45D1',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  removeInlineButton: {
    backgroundColor: '#FF6B6B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: 200,
    padding: 16,
  },
  modalButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  cancelButton: {
    borderBottomWidth: 0,
    marginTop: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  disabledButton: {
    color: '#ccc',
  },
});

export default TaalGrid;