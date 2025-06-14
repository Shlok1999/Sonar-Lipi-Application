import React, { useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;
const minColWidth = screenWidth / 8;
const avgCharWidth = 8.5;

const TaalGrid = forwardRef(({ taal, grid, onChange }, ref) => {
  const { structure, numberOfColumns } = taal;

  const [columnWidths, setColumnWidths] = useState(
    Array(numberOfColumns).fill(minColWidth)
  );

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

  return (
    <ScrollView horizontal>
      <ScrollView>
        <View ref={ref}>
          {/* Header Row */}
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

          {/* Data Grid */}
          {grid.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((cell, colIndex) => {
                const isLastInDivision = divisionBoundaries.includes(colIndex);
                return (
                  <View
                    key={`cell-${rowIndex}-${colIndex}`}
                    style={[
                      styles.cellContainer,
                      { width: columnWidths[colIndex] },
                      isLastInDivision && styles.divisionBorder,
                      rowIndex === grid.length - 1 && styles.lastRow, // Add border to last row
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
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1, // Horizontal line between rows
    borderBottomColor: '#e0e0e0', // Light gray
  },
  headerCellContainer: {
    backgroundColor: '#f5f5f5',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRightWidth: 2, // Division markers
    borderRightColor: 'black', // Purple accent color
  },
  lastRow: {
    borderBottomWidth: 1, // Ensure last row has bottom border
    borderBottomColor: '#e0e0e0',
  },
});

export default TaalGrid;