'use client';

import { Shield, LineChart, Users, Award, CheckCircle } from 'lucide-react';

export default function PublicAboutPage() {
  const features = [
    {
      icon: Shield,
      title: 'Sécurité maximale',
      description: 'KYC vérifié, fonds en séquestre bancaire, et conformité réglementaire complète',
      color: 'text-blue-600',
    },
    {
      icon: LineChart,
      title: 'Transparence totale',
      description: 'Toutes les transactions enregistrées sur la blockchain pour une traçabilité parfaite',
      color: 'text-emerald-600',
    },
    {
      icon: Users,
      title: 'Accessible à tous',
      description: 'Interface simple et investissement minimum accessible',
      color: 'text-purple-600',
    },
    {
      icon: Award,
      title: 'Projets sélectionnés',
      description: 'Due diligence rigoureuse sur tous les projets proposés',
      color: 'text-orange-600',
    },
  ];

  const processSteps = [
    'Sélection rigoureuse des projets',
    'Vérification KYC des investisseurs',
    'Fonds sécurisés en séquestre',
    'Suivi transparent via blockchain',
    'Distribution automatique des rendements',
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">À propos d'OJ Investment</h1>
          <p className="text-xl text-gray-600">
            Plateforme d'investissement transparente et sécurisée
          </p>
        </div>

        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-gray-700 mb-4">
            OJ Investment est une plateforme innovante qui combine la transparence de la
            blockchain avec la sécurité des institutions financières traditionnelles. Notre
            mission est de démocratiser l'accès aux opportunités d'investissement tout en
            garantissant une traçabilité complète.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="bg-white p-6 rounded-xl border">
                <Icon className={`w-12 h-12 ${feature.color} mb-4`} />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-indigo-50 p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Notre processus</h2>
          <div className="space-y-4">
            {processSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <p className="text-lg">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
