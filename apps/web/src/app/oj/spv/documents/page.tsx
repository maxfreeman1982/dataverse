'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  File,
  X,
} from 'lucide-react';
import { GET_SPV_DOCUMENTS, SPV_ADD_DOCUMENT } from '@/graphql/oj-spv';

export default function SpvDocumentsPage() {
  const projectId = 'project-1';
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    type: 'FINANCIAL',
    title: '',
    fileUrl: '',
    description: '',
  });

  const { data, loading, refetch } = useQuery(GET_SPV_DOCUMENTS, {
    variables: { projectId },
  });

  const [addDocument, { loading: uploading }] = useMutation(SPV_ADD_DOCUMENT, {
    onCompleted: () => {
      setShowUploadModal(false);
      setUploadForm({ type: 'FINANCIAL', title: '', fileUrl: '', description: '' });
      refetch();
    },
  });

  const documents = data?.spvDocuments || [];

  const handleUpload = () => {
    addDocument({
      variables: {
        projectId,
        ...uploadForm,
      },
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDocumentTypeIcon = (type: string) => {
    const icons: Record<string, { icon: any; color: string; bg: string }> = {
      FINANCIAL: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
      LEGAL: { icon: File, color: 'text-purple-600', bg: 'bg-purple-100' },
      TECHNICAL: { icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-100' },
      REPORT: { icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100' },
      OTHER: { icon: File, color: 'text-gray-600', bg: 'bg-gray-100' },
    };
    return icons[type] || icons.OTHER;
  };

  const getDocumentTypeBadge = (type: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      FINANCIAL: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Financier' },
      LEGAL: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Juridique' },
      TECHNICAL: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Technique' },
      REPORT: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Rapport' },
      OTHER: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Autre' },
    };
    return badges[type] || badges.OTHER;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  const documentsByType = documents.reduce((acc: any, doc: any) => {
    if (!acc[doc.type]) acc[doc.type] = [];
    acc[doc.type].push(doc);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500">{documents.length} document(s) disponible(s)</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Upload className="w-5 h-5" />
          Ajouter un document
        </button>
      </div>

      {/* Documents by Type */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucun document</h3>
          <p className="text-gray-500 mt-1">Ajoutez votre premier document</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(documentsByType).map(([type, docs]: [string, any]) => {
            const typeIcon = getDocumentTypeIcon(type);
            const typeBadge = getDocumentTypeBadge(type);
            const TypeIcon = typeIcon.icon;

            return (
              <div key={type} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 ${typeIcon.bg} rounded-lg flex items-center justify-center`}>
                    <TypeIcon className={`w-5 h-5 ${typeIcon.color}`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{typeBadge.label}</h2>
                    <p className="text-sm text-gray-500">{docs.length} document(s)</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {docs.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <File className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{doc.title}</h3>
                          {doc.description && (
                            <p className="text-sm text-gray-500">{doc.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Ajouté le {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 hover:bg-white rounded-lg"
                        >
                          <Eye className="w-5 h-5" />
                        </a>
                        <a
                          href={doc.fileUrl}
                          download
                          className="p-2 text-gray-600 hover:bg-white rounded-lg"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                        <button className="p-2 text-red-600 hover:bg-white rounded-lg">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg m-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Ajouter un document</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de document
                </label>
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="FINANCIAL">Financier</option>
                  <option value="LEGAL">Juridique</option>
                  <option value="TECHNICAL">Technique</option>
                  <option value="REPORT">Rapport</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ex: Rapport financier Q1 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL du fichier
                </label>
                <input
                  type="text"
                  value={uploadForm.fileUrl}
                  onChange={(e) => setUploadForm({ ...uploadForm, fileUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Note: Dans une vraie application, utilisez un service d'upload comme AWS S3
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optionnel)
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Description du document..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !uploadForm.title || !uploadForm.fileUrl}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {uploading ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
