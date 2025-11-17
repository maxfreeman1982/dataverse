/**
 * Lab Notes & Testing Journal System
 * Track experiments, trials, and formula modifications
 */

export interface LabNote {
  id: string;
  title: string;
  formulaId?: string;
  formulaName?: string;
  date: Date;
  trialNumber: number;
  status: 'planned' | 'in-progress' | 'completed' | 'failed' | 'archived';
  category: 'modification' | 'new-creation' | 'testing' | 'analysis' | 'research';

  // Testing details
  objective: string;
  hypothesis?: string;
  methodology: string;

  // Modifications
  modifications?: {
    ingredient: string;
    change: string;
    reason: string;
  }[];

  // Results
  observations: string;
  longevity?: {
    top: number;    // hours
    heart: number;  // hours
    base: number;   // hours
  };
  sillage?: 'weak' | 'moderate' | 'strong' | 'powerful';
  rating?: number;  // 1-10

  // Sensory evaluation
  olfactiveNotes?: {
    phase: 'initial' | 'dry-down' | 'final';
    notes: string[];
    impression: string;
  }[];

  // Technical data
  temperature?: number; // °C
  humidity?: number;    // %
  maceration?: number;  // days

  // Conclusions
  conclusions: string;
  nextSteps?: string;

  // Metadata
  tags: string[];
  attachments?: {
    type: 'image' | 'document';
    url: string;
    name: string;
  }[];
  collaborators?: string[];

  createdAt: Date;
  updatedAt: Date;
}

export interface LabNoteStats {
  totalNotes: number;
  byStatus: Record<LabNote['status'], number>;
  byCategory: Record<LabNote['category'], number>;
  averageRating: number;
  successRate: number;
  recentActivity: number;
}

/**
 * Generate mock lab notes for demo purposes
 */
export function generateMockLabNotes(count: number = 10): LabNote[] {
  const titles = [
    'Citrus Opening Enhancement',
    'Base Note Longevity Test',
    'Floral Heart Rebalancing',
    'Woody Amber Exploration',
    'Gourmand Accord Development',
    'Fresh Aquatic Modification',
    'Oriental Spice Intensity',
    'Green Tea Top Note',
    'Vanilla Base Sweetness',
    'Musk Fixative Testing',
    'Rose-Oud Combination',
    'Bergamot Concentration Study',
    'Sandalwood Quality Comparison',
    'Jasmine Natural vs Synthetic',
    'Patchouli Dilution Effects',
  ];

  const statuses: LabNote['status'][] = ['planned', 'in-progress', 'completed', 'failed', 'archived'];
  const categories: LabNote['category'][] = ['modification', 'new-creation', 'testing', 'analysis', 'research'];
  const sillages: LabNote['sillage'][] = ['weak', 'moderate', 'strong', 'powerful'];

  return Array.from({ length: count }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const rating = status === 'completed' ? Math.floor(Math.random() * 5) + 5 : undefined;

    return {
      id: `note-${i + 1}`,
      title: titles[i % titles.length],
      formulaId: Math.random() > 0.3 ? `formula-${Math.floor(Math.random() * 5) + 1}` : undefined,
      formulaName: Math.random() > 0.3 ? `Formula ${Math.floor(Math.random() * 5) + 1}` : undefined,
      date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      trialNumber: Math.floor(Math.random() * 10) + 1,
      status,
      category,
      objective: 'Test the impact of increased citrus notes in the top accord to enhance freshness and longevity.',
      hypothesis: status !== 'planned' ? 'Increasing bergamot from 5% to 8% will improve initial impact without affecting dry-down.' : undefined,
      methodology: 'Prepare two 50ml batches: control and test. Apply equal amounts to blotter strips. Evaluate at 0h, 2h, 4h, 8h, and 24h.',
      modifications: category === 'modification' ? [
        { ingredient: 'Bergamot', change: '+3%', reason: 'Enhance top note brightness' },
        { ingredient: 'Ambergris', change: '-1%', reason: 'Compensate for increased citrus' },
      ] : undefined,
      observations: status !== 'planned'
        ? 'Initial spray shows significantly brighter opening. Top notes last approximately 30 minutes longer than control. No negative impact on heart transition.'
        : '',
      longevity: status === 'completed' ? {
        top: 0.5 + Math.random() * 2,
        heart: 2 + Math.random() * 4,
        base: 6 + Math.random() * 12,
      } : undefined,
      sillage: status === 'completed' ? sillages[Math.floor(Math.random() * sillages.length)] : undefined,
      rating,
      olfactiveNotes: status !== 'planned' ? [
        {
          phase: 'initial',
          notes: ['bright citrus', 'fresh bergamot', 'slight green'],
          impression: 'Clean, vibrant, uplifting opening',
        },
        {
          phase: 'dry-down',
          notes: ['floral heart', 'soft musk', 'warm amber'],
          impression: 'Smooth transition, well-balanced',
        },
      ] : undefined,
      temperature: 20 + Math.random() * 5,
      humidity: 40 + Math.random() * 20,
      maceration: Math.floor(Math.random() * 30),
      conclusions: status === 'completed'
        ? 'Modification successful. The 3% increase in bergamot significantly improved top note performance without compromising the overall balance. Recommend implementing in final formula.'
        : status === 'failed'
        ? 'Test unsuccessful. The increased concentration caused the opening to become too sharp and acidic. Need to explore alternative approaches.'
        : '',
      nextSteps: status === 'completed'
        ? 'Validate with panel testing. Prepare larger batch for stability testing.'
        : status === 'failed'
        ? 'Try 1.5% increase instead. Consider adding sweet orange for roundness.'
        : 'Prepare materials and set up testing station.',
      tags: ['citrus', 'modification', 'top-note', 'bergamot'].filter(() => Math.random() > 0.3),
      collaborators: Math.random() > 0.7 ? ['Lab Assistant', 'Senior Perfumer'] : undefined,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    };
  });
}

/**
 * Get lab notes statistics
 */
export function getLabNoteStats(notes: LabNote[]): LabNoteStats {
  const byStatus: Record<LabNote['status'], number> = {
    'planned': 0,
    'in-progress': 0,
    'completed': 0,
    'failed': 0,
    'archived': 0,
  };

  const byCategory: Record<LabNote['category'], number> = {
    'modification': 0,
    'new-creation': 0,
    'testing': 0,
    'analysis': 0,
    'research': 0,
  };

  let totalRating = 0;
  let ratedCount = 0;
  let completedCount = 0;
  let failedCount = 0;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  let recentCount = 0;

  notes.forEach((note) => {
    byStatus[note.status]++;
    byCategory[note.category]++;

    if (note.rating) {
      totalRating += note.rating;
      ratedCount++;
    }

    if (note.status === 'completed') completedCount++;
    if (note.status === 'failed') failedCount++;

    if (note.updatedAt > thirtyDaysAgo) recentCount++;
  });

  const averageRating = ratedCount > 0 ? totalRating / ratedCount : 0;
  const successRate = (completedCount + failedCount) > 0
    ? (completedCount / (completedCount + failedCount)) * 100
    : 0;

  return {
    totalNotes: notes.length,
    byStatus,
    byCategory,
    averageRating,
    successRate,
    recentActivity: recentCount,
  };
}

/**
 * Filter lab notes
 */
export function filterLabNotes(
  notes: LabNote[],
  filters: {
    status?: LabNote['status'][];
    category?: LabNote['category'][];
    formulaId?: string;
    searchQuery?: string;
    minRating?: number;
    tags?: string[];
  }
): LabNote[] {
  return notes.filter((note) => {
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(note.status)) return false;
    }

    // Category filter
    if (filters.category && filters.category.length > 0) {
      if (!filters.category.includes(note.category)) return false;
    }

    // Formula filter
    if (filters.formulaId && note.formulaId !== filters.formulaId) {
      return false;
    }

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchText = [
        note.title,
        note.objective,
        note.observations,
        note.conclusions,
      ].join(' ').toLowerCase();

      if (!searchText.includes(query)) return false;
    }

    // Rating filter
    if (filters.minRating && note.rating) {
      if (note.rating < filters.minRating) return false;
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasAllTags = filters.tags.every((tag) => note.tags.includes(tag));
      if (!hasAllTags) return false;
    }

    return true;
  });
}

/**
 * Sort lab notes
 */
export function sortLabNotes(
  notes: LabNote[],
  sortBy: 'date' | 'rating' | 'trial' | 'title',
  order: 'asc' | 'desc' = 'desc'
): LabNote[] {
  const sorted = [...notes].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'date':
        comparison = a.date.getTime() - b.date.getTime();
        break;
      case 'rating':
        comparison = (a.rating || 0) - (b.rating || 0);
        break;
      case 'trial':
        comparison = a.trialNumber - b.trialNumber;
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Export lab note to markdown format
 */
export function exportLabNoteToMarkdown(note: LabNote): string {
  const sections: string[] = [];

  sections.push(`# ${note.title}`);
  sections.push(`\n**Trial #${note.trialNumber}** | ${note.date.toLocaleDateString()} | Status: ${note.status} | Category: ${note.category}`);

  if (note.formulaName) {
    sections.push(`\n**Formula:** ${note.formulaName}`);
  }

  sections.push(`\n## Objective\n${note.objective}`);

  if (note.hypothesis) {
    sections.push(`\n## Hypothesis\n${note.hypothesis}`);
  }

  sections.push(`\n## Methodology\n${note.methodology}`);

  if (note.modifications && note.modifications.length > 0) {
    sections.push('\n## Modifications');
    note.modifications.forEach((mod) => {
      sections.push(`\n- **${mod.ingredient}**: ${mod.change} - ${mod.reason}`);
    });
  }

  if (note.observations) {
    sections.push(`\n## Observations\n${note.observations}`);
  }

  if (note.longevity) {
    sections.push('\n## Longevity');
    sections.push(`\n- Top notes: ${note.longevity.top.toFixed(1)}h`);
    sections.push(`\n- Heart notes: ${note.longevity.heart.toFixed(1)}h`);
    sections.push(`\n- Base notes: ${note.longevity.base.toFixed(1)}h`);
  }

  if (note.sillage) {
    sections.push(`\n**Sillage:** ${note.sillage}`);
  }

  if (note.rating) {
    sections.push(`\n**Rating:** ${note.rating}/10`);
  }

  if (note.olfactiveNotes && note.olfactiveNotes.length > 0) {
    sections.push('\n## Olfactive Evaluation');
    note.olfactiveNotes.forEach((eval) => {
      sections.push(`\n### ${eval.phase}`);
      sections.push(`\n**Notes:** ${eval.notes.join(', ')}`);
      sections.push(`\n**Impression:** ${eval.impression}`);
    });
  }

  if (note.conclusions) {
    sections.push(`\n## Conclusions\n${note.conclusions}`);
  }

  if (note.nextSteps) {
    sections.push(`\n## Next Steps\n${note.nextSteps}`);
  }

  if (note.tags.length > 0) {
    sections.push(`\n\n**Tags:** ${note.tags.map(t => `#${t}`).join(' ')}`);
  }

  return sections.join('\n');
}

/**
 * Save lab note to localStorage
 */
export function saveLabNote(note: LabNote): void {
  const notes = getStoredLabNotes();
  const existingIndex = notes.findIndex((n) => n.id === note.id);

  if (existingIndex >= 0) {
    notes[existingIndex] = { ...note, updatedAt: new Date() };
  } else {
    notes.push({ ...note, createdAt: new Date(), updatedAt: new Date() });
  }

  localStorage.setItem('lab-notes', JSON.stringify(notes));
}

/**
 * Get lab notes from localStorage
 */
export function getStoredLabNotes(): LabNote[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem('lab-notes');
  if (!stored) return [];

  try {
    return JSON.parse(stored).map((n: any) => ({
      ...n,
      date: new Date(n.date),
      createdAt: new Date(n.createdAt),
      updatedAt: new Date(n.updatedAt),
    }));
  } catch {
    return [];
  }
}

/**
 * Delete lab note from localStorage
 */
export function deleteLabNote(id: string): void {
  const notes = getStoredLabNotes();
  const filtered = notes.filter((n) => n.id !== id);
  localStorage.setItem('lab-notes', JSON.stringify(filtered));
}
