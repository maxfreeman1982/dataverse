import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { gql, useQuery } from '@apollo/client';

const PROJECTS_QUERY = gql`
  query Projects($category: ProjectCategory, $search: String) {
    projects(category: $category, search: $search, status: ACTIVE) {
      id
      name
      shortDescription
      category
      targetAmount
      raisedAmount
      progressPercent
      expectedReturn
      durationMonths
      minimumInvestment
    }
  }
`;

export default function ProjectsScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const { data, loading, refetch } = useQuery(PROJECTS_QUERY, {
    variables: { search: search || undefined },
  });

  const projects = data?.projects || [];

  const renderProject = ({ item }: any) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => navigation.navigate('ProjectDetails', { projectId: item.id })}
    >
      <View style={styles.projectHeader}>
        <Text style={styles.projectName}>{item.name}</Text>
        <Text style={styles.categoryBadge}>{item.category.replace('_', ' ')}</Text>
      </View>

      <Text style={styles.projectDescription}>{item.shortDescription}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Target</Text>
          <Text style={styles.statValue}>€{item.targetAmount.toLocaleString()}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Return</Text>
          <Text style={styles.statValue}>{item.expectedReturn}%</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>{item.durationMonths}mo</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${item.progressPercent}%` }]} />
        </View>
        <Text style={styles.progressText}>{item.progressPercent}% funded</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.minInvestment}>
          Min. Investment: €{item.minimumInvestment.toLocaleString()}
        </Text>
        <TouchableOpacity style={styles.investButton}>
          <Text style={styles.investButtonText}>Invest Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search projects..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onRefresh={refetch}
        refreshing={loading}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No projects available</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  list: {
    padding: 15,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  projectName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  categoryBadge: {
    backgroundColor: '#0066CC',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
  },
  projectDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00CC66',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  minInvestment: {
    fontSize: 12,
    color: '#666',
  },
  investButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  investButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
});
