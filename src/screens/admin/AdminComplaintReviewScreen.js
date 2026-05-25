import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const C = {
  primary: '#0e3243',
  accent: '#1a9e6e',
  white: '#FFFFFF',
  text: '#0e3243',
  muted: '#7a93a0',
  bg: '#f4f6f9',
};

const complaints = [
  { id: '1', product: 'Wireless Headphones', issue: 'Poor condition', description: 'The product arrived damaged and is not working.' },
  { id: '2', product: 'Smart Watch', issue: 'Delivery issue', description: 'The product was delivered late and was missing accessories.' },
];

export default function AdminComplaintReviewScreen({ navigation }) {
  const handleResolveComplaint = (complaintId) => {
    Alert.alert('Resolve Complaint', 'Mark this complaint as resolved?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Resolve',
        onPress: () => {
          // Logic to resolve the complaint
          Alert.alert('Complaint Resolved', 'The complaint has been resolved and the seller has been informed.');
        },
      },
    ]);
  };

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complaints</Text>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={22} color={C.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        {complaints.map((complaint) => (
          <View key={complaint.id} style={styles.complaintCard}>
            <Text style={styles.productName}>Product: {complaint.product}</Text>
            <Text style={styles.issue}>Issue: {complaint.issue}</Text>
            <Text style={styles.description}>Description: {complaint.description}</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.resolveBtn}
                onPress={() => handleResolveComplaint(complaint.id)}
              >
                <Text style={styles.resolveText}>Resolve</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: C.primary,
  },
  headerTitle: { color: C.white, fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1, backgroundColor: C.bg, padding: 16 },
  complaintCard: {
    backgroundColor: C.white,
    padding: 14,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  productName: { fontSize: 16, fontWeight: '700', color: C.text },
  issue: { fontSize: 14, color: C.muted },
  description: { fontSize: 14, color: C.muted, marginTop: 8 },
  actionRow: { flexDirection: 'row', gap: 8 },
  resolveBtn: {
    backgroundColor: C.accent,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  resolveText: { color: C.white, fontSize: 14, fontWeight: '700' },
});