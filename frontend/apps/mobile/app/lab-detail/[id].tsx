import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLabResult } from '../../hooks/use-lab-results';

export default function LabDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: lab, isLoading } = useLabResult(id);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Lab Result</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading lab result...</Text>
        </View>
      </View>
    );
  }

  if (!lab) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Lab Result</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Lab result not found</Text>
        </View>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'processing': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'processing': return '⟳';
      case 'failed': return '✗';
      default: return '○';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Lab Result</Text>
      </View>

      {/* Lab Info Card */}
      <View style={styles.card}>
        <Text style={styles.fileName}>{lab.fileName}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(lab.processingStatus) }]}>
            <Text style={styles.statusText}>
              {getStatusIcon(lab.processingStatus)} {lab.processingStatus}
            </Text>
          </View>
        </View>
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Uploaded:</Text>
          <Text style={styles.dateValue}>{formatDate(lab.uploadedAt)}</Text>
        </View>
        {lab.processedAt && (
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Processed:</Text>
            <Text style={styles.dateValue}>{formatDate(lab.processedAt)}</Text>
          </View>
        )}
      </View>

      {/* Biomarkers Section (Mock Data) */}
      {lab.processingStatus === 'completed' && (
        <>
          <Text style={styles.sectionTitle}>Biomarkers</Text>
          <View style={styles.card}>
            <View style={styles.biomarkerRow}>
              <View style={styles.biomarkerInfo}>
                <Text style={styles.biomarkerName}>Hemoglobin</Text>
                <Text style={styles.biomarkerValue}>14.5 g/dL</Text>
              </View>
              <View style={styles.biomarkerRange}>
                <Text style={styles.rangeText}>Normal</Text>
                <Text style={styles.rangeValue}>13.5-17.5</Text>
              </View>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.biomarkerRow}>
              <View style={styles.biomarkerInfo}>
                <Text style={styles.biomarkerName}>White Blood Cells</Text>
                <Text style={styles.biomarkerValue}>7.2 K/µL</Text>
              </View>
              <View style={styles.biomarkerRange}>
                <Text style={styles.rangeText}>Normal</Text>
                <Text style={styles.rangeValue}>4.5-11.0</Text>
              </View>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.biomarkerRow}>
              <View style={styles.biomarkerInfo}>
                <Text style={styles.biomarkerName}>Platelets</Text>
                <Text style={styles.biomarkerValue}>245 K/µL</Text>
              </View>
              <View style={styles.biomarkerRange}>
                <Text style={styles.rangeText}>Normal</Text>
                <Text style={styles.rangeValue}>150-400</Text>
              </View>
            </View>
          </View>

          {/* Insights Section */}
          <Text style={styles.sectionTitle}>AI Insights</Text>
          <View style={styles.card}>
            <Text style={styles.insightText}>
              Your blood count results are within normal ranges. Hemoglobin levels indicate good oxygen-carrying capacity. White blood cell count suggests healthy immune function.
            </Text>
          </View>
        </>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>📤 Share Result</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.viewPdfButton}>
          <Text style={styles.viewPdfButtonText}>📄 View PDF</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  backText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 20,
    marginTop: 12,
    marginBottom: 8,
  },
  biomarkerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  biomarkerInfo: {
    flex: 1,
  },
  biomarkerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  biomarkerValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#667eea',
  },
  biomarkerRange: {
    alignItems: 'flex-end',
  },
  rangeText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: 2,
  },
  rangeValue: {
    fontSize: 12,
    color: '#6b7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  insightText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  actions: {
    padding: 20,
    gap: 12,
  },
  shareButton: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewPdfButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  viewPdfButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
});

