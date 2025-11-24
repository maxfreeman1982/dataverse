import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { gql, useQuery } from '@apollo/client';

const DASHBOARD_QUERY = gql`
  query Dashboard {
    me {
      id
      firstName
      lastName
      wallet {
        balance
        totalInvested
        totalReturns
      }
      investments {
        id
        amount
        currentValue
        status
        project {
          name
          expectedReturn
        }
      }
    }
    projects(limit: 3, status: ACTIVE) {
      id
      name
      category
      targetAmount
      raisedAmount
      progressPercent
      expectedReturn
    }
  }
`;

export default function DashboardScreen({ navigation }: any) {
  const { data, loading, refetch } = useQuery(DASHBOARD_QUERY);

  const wallet = data?.me?.wallet;
  const investments = data?.me?.investments || [];
  const featuredProjects = data?.projects || [];

  const performance = wallet
    ? ((wallet.totalInvested + wallet.totalReturns - wallet.balance) / wallet.totalInvested) * 100
    : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {data?.me?.firstName}!</Text>
        <Text style={styles.subtitle}>Your Portfolio Overview</Text>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>€{wallet?.balance?.toLocaleString() || '0'}</Text>
        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.balanceSubLabel}>Total Invested</Text>
            <Text style={styles.balanceSubAmount}>€{wallet?.totalInvested?.toLocaleString() || '0'}</Text>
          </View>
          <View>
            <Text style={styles.balanceSubLabel}>Total Returns</Text>
            <Text style={styles.balanceSubAmount}>€{wallet?.totalReturns?.toLocaleString() || '0'}</Text>
          </View>
        </View>
      </View>

      {/* Performance */}
      <View style={styles.performanceCard}>
        <Text style={styles.performanceLabel}>Performance</Text>
        <Text style={[styles.performanceValue, performance >= 0 ? styles.positive : styles.negative]}>
          {performance >= 0 ? '+' : ''}{performance.toFixed(2)}%
        </Text>
      </View>

      {/* Active Investments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Investments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Portfolio')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {investments.slice(0, 3).map((inv: any) => (
          <TouchableOpacity
            key={inv.id}
            style={styles.investmentCard}
            onPress={() => navigation.navigate('InvestmentDetails', { investmentId: inv.id })}
          >
            <Text style={styles.investmentName}>{inv.project.name}</Text>
            <Text style={styles.investmentAmount}>€{inv.amount.toLocaleString()}</Text>
            <Text style={styles.investmentReturn}>
              Current: €{inv.currentValue.toLocaleString()} | {inv.project.expectedReturn}% exp. return
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Featured Projects */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Projects</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {featuredProjects.map((project: any) => (
          <TouchableOpacity
            key={project.id}
            style={styles.projectCard}
            onPress={() => navigation.navigate('ProjectDetails', { projectId: project.id })}
          >
            <Text style={styles.projectName}>{project.name}</Text>
            <Text style={styles.projectCategory}>{project.category.replace('_', ' ')}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${project.progressPercent}%` }]} />
            </View>
            <Text style={styles.projectProgress}>{project.progressPercent}% funded</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  balanceCard: {
    backgroundColor: '#0066CC',
    margin: 20,
    padding: 20,
    borderRadius: 15,
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  balanceSubLabel: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  balanceSubAmount: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  performanceCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: 16,
    color: '#333',
  },
  performanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  positive: {
    color: '#00CC66',
  },
  negative: {
    color: '#CC0000',
  },
  section: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    color: '#0066CC',
    fontSize: 14,
  },
  investmentCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  investmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  investmentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066CC',
    marginVertical: 5,
  },
  investmentReturn: {
    fontSize: 13,
    color: '#666',
  },
  projectCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  projectCategory: {
    fontSize: 13,
    color: '#0066CC',
    marginVertical: 5,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginVertical: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00CC66',
    borderRadius: 3,
  },
  projectProgress: {
    fontSize: 12,
    color: '#666',
  },
});
