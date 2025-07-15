import { Page, Document, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 30,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A45D1',
    marginBottom: 8,
  },
  taalInfo: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  structure: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9B2335',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    padding: 8,
    fontSize: 12,
    width: 60,
    textAlign: 'center',
    minHeight: 30,
  },
  headerCell: {
    padding: 8,
    fontSize: 12,
    width: 60,
    textAlign: 'center',
    fontWeight: 'bold',
    backgroundColor: '#F5F5F5',
  },
  thickBorderRight: {
    borderRightWidth: 2,
    borderRightColor: '#000000',
  },
});

const CompositionPDF = ({ composition }) => {
  // Calculate division points
  const divisionBoundaries = [];
  let cumulative = 0;
  composition.taal.structure.forEach((count, index) => {
    cumulative += count;
    if (index < composition.taal.structure.length - 1) {
      divisionBoundaries.push(cumulative - 1);
    }
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{composition.name}</Text>
          <Text style={styles.taalInfo}>Taal: {composition.taal.name}</Text>
          <Text style={styles.structure}>
            Structure: {composition.taal.structure.join(' + ')}
          </Text>
        </View>

        {/* Header Row */}
        <View style={[styles.row, { marginBottom: 10 }]}>
          {Array.from({ length: composition.taal.numberOfColumns }).map((_, colIndex) => (
            <View
              key={`header-${colIndex}`}
              style={[
                styles.headerCell,
                divisionBoundaries.includes(colIndex) && styles.thickBorderRight,
              ]}
            >
              <Text>{colIndex + 1}</Text>
            </View>
          ))}
        </View>

        {/* Data Rows */}
        {composition.grid.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((cell, colIndex) => (
              <View
                key={`cell-${rowIndex}-${colIndex}`}
                style={[
                  styles.cell,
                  divisionBoundaries.includes(colIndex) && styles.thickBorderRight,
                ]}
              >
                <Text>{cell || ' '}</Text>
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default CompositionPDF;
