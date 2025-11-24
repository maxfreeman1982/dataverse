'use client';

export default function SpvSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Paramètres</h1>
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Configuration du projet</h2>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nom</label><input type="text" className="w-full px-4 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea rows={4} className="w-full px-4 py-2 border rounded-lg" /></div>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg">Sauvegarder</button>
        </div>
      </div>
    </div>
  );
}
