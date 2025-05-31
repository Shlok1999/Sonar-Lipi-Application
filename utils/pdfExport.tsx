import { Platform } from 'react-native';
import { pdf, Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#D4AF37',
  },
  cell: {
    padding: 8,
    fontSize: 12,
    borderRightWidth: 1,
    borderRightColor: '#D4AF37',
    width: 60,
    textAlign: 'center',
  },
  divisionBorder: {
    borderRightWidth: 2,
    borderRightColor: '#9B2335',
  },
});

const CompositionPDF = ({ composition }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{composition.name}</Text>
      <View style={styles.table}>
        {composition.grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => {
              const isLastInDivision = composition.taal.structure
                .reduce((acc, val) => [...acc, (acc[acc.length - 1] || 0) + val], [])
                .slice(0, -1)
                .includes(colIndex + 1);

              return (
                <Text
                  key={colIndex}
                  style={[
                    styles.cell,
                    isLastInDivision && styles.divisionBorder,
                  ]}
                >
                  {cell || ' '}
                </Text>
              );
            })}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export const exportToPDF = async (composition) => {
  try {
    const pdfDoc = await pdf(<CompositionPDF composition={composition} />).toBlob();

    if (Platform.OS === 'web') {
      // For web, create a download link
      const url = URL.createObjectURL(pdfDoc);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${composition.name}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // For mobile platforms
      const pdfBase64 = await pdf(<CompositionPDF composition={composition} />).toBase64();
      const filePath = `${FileSystem.documentDirectory}${composition.name}.pdf`;
      
      await FileSystem.writeAsStringAsync(filePath, pdfBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/pdf',
        dialogTitle: 'Export Composition',
      });
    }
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
};