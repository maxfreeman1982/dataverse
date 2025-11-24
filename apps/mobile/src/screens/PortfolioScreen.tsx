import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { gql, useQuery } from '@apollo/client';

const PORTFOLIO_QUERY = gql`
  query Portfolio {
    me {
      id
      wallet {
        balance
        totalInvested
        totalReturns
      }
      investments {
        id
        amount
        currentValue
        accruedReturns
        paidReturns
        status
        investmentDate
        maturityDate
        project {
          name
          category
          expectedReturn
        }
      }
    }
  }
`;

export default function PortfolioScreen({ navigation }: any) {
  const { data, loading, refetch } = useQuery(PORTFOLIO_QUERY);

  const wallet = data?.me?.wallet;
  const investments = data?.me?.investments || [];

  const totalGain = wallet ? wallet.totalReturns + (wallet.balance - wallet.totalInvested) : 0;
  const performancePercent = wallet && wallet.totalInvested > 0
    ? (totalGain / wallet.totalInvested) * 100
    : 0;

  const renderInvestment = ({ item }: any) => {
    const gain = item.currentValue - item.amount + item.paidReturns;
    const gainPercent = (gain / item.amount) * 100;

    return (
      <TouchableOpacity
        style={styles.investmentCard}
        onPress={() => navigation.navigate('InvestmentDetails', { investmentId: item.id })}
      >
        <View style={styles.investmentHeader}>
          <Text style={styles.projectName}>{item.project.name}</Text>
          <View style={[
            styles.statusBadge,
            item.status === 'ACTIVE' ? styles.statusActive : styles.statusOther
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.category}>{item.project.category.replace('_', ' ')}</Text>

        <View style={styles.amountsRow}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Invested</Text>
            <Text style={styles.amountValue}>€{item.amount.toLocaleString()}</Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Current Value</Text>
            <Text style={styles.amountValue}>€{item.currentValue.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.returnsRow}>
          <View>
            <Text style={styles.returnLabel}>Accrued Returns</Text>
            <Text style={styles.returnValue}>€{item.accruedReturns.toLocaleString()}</Text>
          </View>
          <View>
            <Text style={styles.returnLabel}>Paid Returns</Text>
            <Text style={styles.returnValue}>€{item.paidReturns.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.gainRow}>
          <Text style={styles.gainLabel}>Total Gain</Text>
          <Text style={[styles.gainValue, gain >= 0 ? styles.positive : styles.negative]}>
            {gain >= 0 ? '+' : ''}€{gain.toLocaleString()} ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Portfolio Summary</Text>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Invested</Text>
            <Text style={styles.summaryValue}>€{wallet?.totalInvested?.toLocaleString() || '0'}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Returns</Text>
            <Text style={styles.summaryValue}>€{wallet?.totalReturns?.toLocaleString() || '0'}</Text>
          </View>
        </View>

        <View style={styles.performanceRow}>
          <Text style={styles.performanceLabel}>Overall Performance</Text>
          <Text style={[
            styles.performanceValue,
            performancePercent >= 0 ? styles.positive : styles.negative
          ]}>
            {performancePercent >= 0 ? '+' : ''}{performancePercent.toFixed(2)}%
          </Text>
        </View>

        <Text style={styles.investmentCount}>
          {investments.length} Active Investment{investments.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Investments List */}
      <FlatList
        data={investments}
        renderItem={renderInvestment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No investments yet</Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Projects')}
            >
              <Text style={styles.exploreButtonText}>Explore Projects</Text>
            </TouchableOpacity>
          </View>
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
  summaryCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  performanceLabel: {
    fontSize: 15,
    color: '#333',
  },
  performanceValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  positive: {
    color: '#00CC66',
  },
  negative: {
    color: '#CC0000',
  },
  investmentCount: {
    fontSize: 13,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  list: {
    padding: 15,
  },
  investmentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#E6F7EF',
  },
  statusOther: {
    backgroundColor: '#F0F0F0',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  category: {
    fontSize: 13,
    color: '#0066CC',
    marginBottom: 12,
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  amountItem: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  returnsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  returnLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  returnValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00CC66',
  },
  gainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  gainLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  gainValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
