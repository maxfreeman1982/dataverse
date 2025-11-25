'use client';

import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_USERS = gql`
  query GetUsers($search: String, $status: String, $role: String) {
    users(search: $search, status: $status, role: $role) {
      id
      email
      firstName
      lastName
      role
      status
      kycStatus
      investorType
      totalInvested
      totalReturns
      activeInvestments
      createdAt
      lastLoginAt
    }
  }
`;

const UPDATE_USER_STATUS = gql`
  mutation UpdateUserStatus($userId: ID!, $status: String!) {
    updateUserStatus(userId: $userId, status: $status) {
      id
      status
    }
  }
`;

const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: ID!, $role: String!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      role
    }
  }
`;

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data, loading, refetch } = useQuery(GET_USERS, {
    variables: {
      search: searchTerm || null,
      status: statusFilter !== 'all' ? statusFilter : null,
      role: roleFilter !== 'all' ? roleFilter : null,
    },
  });

  const [updateUserStatus] = useMutation(UPDATE_USER_STATUS);
  const [updateUserRole] = useMutation(UPDATE_USER_ROLE);

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await updateUserStatus({ variables: { userId, status: newStatus } });
      refetch();
      alert('Statut mis à jour avec succès');
    } catch (error) {
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole({ variables: { userId, role: newRole } });
      refetch();
      alert('Rôle mis à jour avec succès');
    } catch (error) {
      alert('Erreur lors de la mise à jour du rôle');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 mt-2">
            Gérez les comptes utilisateurs, rôles et statuts
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <input
                type="text"
                placeholder="Email, nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous</option>
                <option value="ACTIVE">Actif</option>
                <option value="PENDING">En attente</option>
                <option value="SUSPENDED">Suspendu</option>
                <option value="BLOCKED">Bloqué</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôle
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous</option>
                <option value="INVESTOR">Investisseur</option>
                <option value="PROJECT_OWNER">Porteur de projet</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => refetch()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Filtrer
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Utilisateurs"
            value={data?.users?.length || 0}
            icon="👥"
            color="blue"
          />
          <StatCard
            title="Actifs"
            value={data?.users?.filter((u: any) => u.status === 'ACTIVE').length || 0}
            icon="✅"
            color="green"
          />
          <StatCard
            title="KYC Approuvés"
            value={data?.users?.filter((u: any) => u.kycStatus === 'APPROVED').length || 0}
            icon="🎯"
            color="purple"
          />
          <StatCard
            title="En attente"
            value={data?.users?.filter((u: any) => u.status === 'PENDING').length || 0}
            icon="⏳"
            color="orange"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      KYC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Investissements
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Investi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Inscrit le
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.users?.map((user: any) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="INVESTOR">Investisseur</option>
                          <option value="PROJECT_OWNER">Porteur</option>
                          <option value="ADMIN">Admin</option>
                          <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.status}
                          onChange={(e) => handleStatusChange(user.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="ACTIVE">Actif</option>
                          <option value="PENDING">En attente</option>
                          <option value="SUSPENDED">Suspendu</option>
                          <option value="BLOCKED">Bloqué</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <KYCBadge status={user.kycStatus} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.activeInvestments || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        €{user.totalInvested?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Détails
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`text-3xl p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function KYCBadge({ status }: { status: string }) {
  const colors = {
    APPROVED: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    REJECTED: 'bg-red-100 text-red-800',
    NOT_SUBMITTED: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${colors[status as keyof typeof colors]}`}>
      {status}
    </span>
  );
}

function UserDetailsModal({ user, onClose }: { user: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold">Détails de l'utilisateur</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Nom complet</label>
              <p className="font-medium">{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Type d'investisseur</label>
              <p className="font-medium">{user.investorType}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Statut KYC</label>
              <p className="font-medium">{user.kycStatus}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Statistiques d'investissement</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-gray-600">Total investi</p>
                <p className="text-xl font-bold text-blue-600">
                  €{user.totalInvested?.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <p className="text-sm text-gray-600">Rendements</p>
                <p className="text-xl font-bold text-green-600">
                  €{user.totalReturns?.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <p className="text-sm text-gray-600">Investissements actifs</p>
                <p className="text-xl font-bold text-purple-600">
                  {user.activeInvestments}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Actions rapides</h3>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Envoyer un email
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                Voir les investissements
              </button>
              <button className="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50">
                Suspendre le compte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
