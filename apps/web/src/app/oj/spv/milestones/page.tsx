'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Save,
  X,
} from 'lucide-react';
import { GET_SPV_PROJECT_MILESTONES, SPV_UPDATE_MILESTONE } from '@/graphql/oj-spv';

export default function SpvMilestonesPage() {
  const projectId = 'project-1'; // TODO: Get from auth/context
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    status: '',
    progress: 0,
    notes: '',
  });

  const { data, loading, refetch } = useQuery(GET_SPV_PROJECT_MILESTONES, {
    variables: { projectId },
  });

  const [updateMilestone, { loading: updating }] = useMutation(SPV_UPDATE_MILESTONE, {
    onCompleted: () => {
      setEditingId(null);
      refetch();
    },
  });

  const milestones = data?.spvProjectMilestones || [];

  const getStatusIcon = (status: string) => {
    const icons: Record<string, { icon: any; color: string }> = {
      COMPLETED: { icon: CheckCircle, color: 'text-emerald-500' },
      IN_PROGRESS: { icon: Clock, color: 'text-blue-500' },
      PENDING: { icon: AlertCircle, color: 'text-yellow-500' },
      DELAYED: { icon: AlertCircle, color: 'text-red-500' },
    };
    return icons[status] || icons.PENDING;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      COMPLETED: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Complété' },
      IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'En cours' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En attente' },
      DELAYED: { bg: 'bg-red-100', text: 'text-red-700', label: 'En retard' },
    };
    return badges[status] || badges.PENDING;
  };

  const handleEdit = (milestone: any) => {
    setEditingId(milestone.id);
    setEditForm({
      status: milestone.status,
      progress: milestone.progress,
      notes: milestone.notes || '',
    });
  };

  const handleSave = (milestoneId: string) => {
    updateMilestone({
      variables: {
        projectId,
        milestoneId,
        ...editForm,
      },
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ status: '', progress: 0, notes: '' });
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  const completedCount = milestones.filter((m: any) => m.status === 'COMPLETED').length;
  const inProgressCount = milestones.filter((m: any) => m.status === 'IN_PROGRESS').length;
  const totalProgress = milestones.reduce((sum: number, m: any) => sum + m.progress, 0) / (milestones.length || 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Milestones du projet</h1>
        <p className="text-gray-500">{milestones.length} milestone(s) au total</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">{milestones.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Complétés</p>
              <p className="text-xl font-bold text-gray-900">{completedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En cours</p>
              <p className="text-xl font-bold text-gray-900">{inProgressCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Progression globale</p>
              <p className="text-xl font-bold text-gray-900">{totalProgress.toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {milestones.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun milestone défini</p>
          </div>
        ) : (
          milestones.map((milestone: any) => {
            const statusIcon = getStatusIcon(milestone.status);
            const statusBadge = getStatusBadge(milestone.status);
            const StatusIcon = statusIcon.icon;
            const isEditing = editingId === milestone.id;

            return (
              <div
                key={milestone.id}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusIcon className={`w-6 h-6 ${statusIcon.color}`} />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {milestone.title}
                      </h3>
                      {isEditing ? (
                        <select
                          value={editForm.status}
                          onChange={(e) =>
                            setEditForm({ ...editForm, status: e.target.value })
                          }
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="PENDING">En attente</option>
                          <option value="IN_PROGRESS">En cours</option>
                          <option value="COMPLETED">Complété</option>
                          <option value="DELAYED">En retard</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
                        >
                          {statusBadge.label}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4">{milestone.description}</p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500">Progression</span>
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editForm.progress}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                progress: parseInt(e.target.value),
                              })
                            }
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                          />
                        ) : (
                          <span className="font-medium">{milestone.progress}%</span>
                        )}
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{
                            width: `${isEditing ? editForm.progress : milestone.progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                      <div>
                        <span className="font-medium">Date cible:</span>{' '}
                        {formatDate(milestone.targetDate)}
                      </div>
                      {milestone.completedDate && (
                        <div>
                          <span className="font-medium">Complété le:</span>{' '}
                          {formatDate(milestone.completedDate)}
                        </div>
                      )}
                      {milestone.updatedAt && (
                        <div>
                          <span className="font-medium">Mis à jour:</span>{' '}
                          {formatDate(milestone.updatedAt)}
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {isEditing ? (
                      <textarea
                        value={editForm.notes}
                        onChange={(e) =>
                          setEditForm({ ...editForm, notes: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Notes et commentaires..."
                      />
                    ) : (
                      milestone.notes && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">{milestone.notes}</p>
                        </div>
                      )
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSave(milestone.id)}
                          disabled={updating}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg disabled:opacity-50"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={updating}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEdit(milestone)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
