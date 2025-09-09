import React, { useState, forwardRef, useRef, useEffect } from 'react';
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
  Keyboard,
} from 'react-native';

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
  const [focusedCell, setFocusedCell] = useState({ row: 0, col: 0 });
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const horizontalScrollRef = useRef(null);
  const verticalScrollRef = useRef(null);
  const topHeaderScrollRef = useRef(null);
  const leftColumnScrollRef = useRef(null);
  const textInputRefs = useRef({});

  const divisionBoundaries = [];
  let currentSum = 0;
  for (let i = 0; i < structure.length; i++) {
    currentSum += structure[i];
    if (i < structure.length - 1) {
      divisionBoundaries.push(currentSum - 1);
    }
  }
  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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

  const handleCellFocus = (rowIndex, colIndex) => {
    setFocusedCell({ row: rowIndex, col: colIndex });
  };

  const handleKeyPress = (event, rowIndex, colIndex) => {
    const key = event.nativeEvent.key;
    
    // Debug: log the key being pressed
    // console.log('Key pressed:', key, 'Cell content:', grid[rowIndex][colIndex]);
    
    if (key === ' ') {
      event.preventDefault(); 
      moveToNextCell(rowIndex, colIndex);
    }

    // If cell is empty and I press backspace, go to the previous cell
    if ((key === 'backspace' || key === 'Backspace' || key === 'BackSpace') && grid[rowIndex][colIndex] === '') {
      event.preventDefault();
      moveToPreviousCell(rowIndex, colIndex);
    }
  };

  const moveToPreviousCell = (currentRow, currentCol) => {
    let previousRow = currentRow;
    let previousCol = currentCol - 1;

    // If at the beginning of row, move to previous row
    if (previousCol < 0) {
      previousRow -= 1;
      previousCol = numberOfColumns - 1;
    }
    
    // If at the beginning of grid, stay at current cell
    if (previousRow < 0) {
      return;
    }

    // Focus the previous cell
    const previousCellRef = textInputRefs.current[`${previousRow}-${previousCol}`];

    if (previousCellRef) {
      previousCellRef.focus();
      setFocusedCell({ row: previousRow, col: previousCol });
      
      // Scroll to make the cell visible if needed
      scrollToCell(previousRow, previousCol);
    }
  };

  const moveToNextCell = (currentRow, currentCol) => {
    let nextRow = currentRow;
    let nextCol = currentCol + 1;

    // If at the end of row, move to next row
    if (nextCol >= numberOfColumns) {
      nextCol = 0;
      nextRow += 1;
    }

    // If at the end of grid, stay at current cell
    if (nextRow >= grid.length) {
      return;
    }

    // Focus the next cell
    const nextCellRef = textInputRefs.current[`${nextRow}-${nextCol}`];
    if (nextCellRef) {
      nextCellRef.focus();
      setFocusedCell({ row: nextRow, col: nextCol });
      
      // Scroll to make the cell visible if needed
      scrollToCell(nextRow, nextCol);
    }
  };

  const scrollToCell = (rowIndex, colIndex) => {
    // Calculate approximate position for scrolling
    const cellTop = rowIndex * 48;
    const cellLeft = columnWidths.slice(0, colIndex).reduce((sum, width) => sum + width, 0);

    // Scroll vertically if needed
    verticalScrollRef.current?.scrollTo({
      y: Math.max(0, cellTop - 100),
      animated: true
    });

    // Scroll horizontally if needed
    horizontalScrollRef.current?.scrollTo({
      x: Math.max(0, cellLeft - 100),
      animated: true
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

  const handleRowActionPress = (rowIndex) => {
    setActiveRow(rowIndex);
    setShowActionModal(true);
  };

  const handleAction = (action) => {
    if (activeRow === null) return;

    switch (action) {
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
            <Pressable style={styles.modalButton} onPress={() => handleAction('add')}>
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
            <Pressable style={styles.modalButton} onPress={() => handleAction('clear')}>
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

      {/* Layout */}
      <View style={{ flexDirection: 'row' }}>
        {/* Left Column */}
        <View>
          {/* Top-left corner cell */}
          <View style={styles.cornerCell}>
            <Text style={styles.headerText}>#</Text>
          </View>

          {/* Row numbers */}
          <ScrollView
            ref={leftColumnScrollRef}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          >
            {grid.map((_, rowIndex) => (
              <TouchableOpacity
                key={`row-label-${rowIndex}`}
                onPress={() => handleRowActionPress(rowIndex)}
                style={styles.rowNumberCell}
              >
                <Text style={styles.rowNumber}>{rowIndex + 1}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Right Section */}
        <View style={{ flex: 1 }}>
          {/* Top Header Row */}
          <ScrollView
            ref={topHeaderScrollRef}
            horizontal
            scrollEnabled={false}
            contentContainerStyle={{ width: totalWidth }}
          >
            <View style={styles.row}>
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
          </ScrollView>

          {/* Scrollable Grid */}
          <ScrollView
            ref={verticalScrollRef}
            onScroll={(e) => {
              leftColumnScrollRef.current?.scrollTo({ y: e.nativeEvent.contentOffset.y, animated: false });
            }}
            scrollEventThrottle={16}
          >
            <ScrollView
              ref={horizontalScrollRef}
              horizontal
              scrollEventThrottle={16}
              onScroll={(e) => {
                topHeaderScrollRef.current?.scrollTo({ x: e.nativeEvent.contentOffset.x, animated: false });
              }}
              contentContainerStyle={{ width: totalWidth }}
            >
              <View ref={ref}>
                {grid.map((row, rowIndex) => (
                  <View key={`row-${rowIndex}`} style={styles.row}>
                    {row.map((cell, colIndex) => {
                      const isLastInDivision = divisionBoundaries.includes(colIndex);
                      const isFocused = focusedCell.row === rowIndex && focusedCell.col === colIndex;
                      
                      return (
                        <View
                          key={`cell-${rowIndex}-${colIndex}`}
                          style={[
                            styles.cellContainer,
                            { width: columnWidths[colIndex] },
                            isLastInDivision && styles.divisionBorder,
                            isFocused && isKeyboardVisible && styles.focusedCell,
                          ]}
                        >
                          <TextInput
                            ref={(ref) => {
                              textInputRefs.current[`${rowIndex}-${colIndex}`] = ref;
                            }}
                            style={styles.cell}
                            value={cell}
                            onChangeText={(text) => handleCellChange(rowIndex, colIndex, text)}
                            onFocus={() => handleCellFocus(rowIndex, colIndex)}
                            onKeyPress={(e) => handleKeyPress(e, rowIndex, colIndex)}
                            placeholder=""
                            placeholderTextColor="#999"
                            multiline={false}
                            blurOnSubmit={false}
                            returnKeyType="next"
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
    </View>
  );
});

const styles = StyleSheet.create({
  mainContainer: {
    minHeight: 200,
    marginBottom: 10
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cornerCell: {
    width: 40,
    height: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  rowNumberCell: {
    width: 40,
    height: 48,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
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
    borderBottomWidth: 1,
    borderColor: '#ccc',
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
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
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