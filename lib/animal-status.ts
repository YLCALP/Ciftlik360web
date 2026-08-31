export type AnimalStatusKey = 'Aktif' | 'Hasta' | 'Gebe' | 'Satildi' | 'Oldu';

const STATUS_META: Record<AnimalStatusKey, { label: string; badgeClass: string }> = {
    Aktif: { label: 'Aktif', badgeClass: 'bg-chart-1/15 text-chart-1' },
    Hasta: { label: 'Hasta', badgeClass: 'bg-chart-2/15 text-chart-2' },
    Gebe: { label: 'Gebe', badgeClass: 'bg-chart-3/15 text-chart-3' },
    Satildi: { label: 'Satıldı', badgeClass: 'bg-chart-5/15 text-chart-5' },
    Oldu: { label: 'Öldü', badgeClass: 'bg-muted text-muted-foreground' },
};

// Handles both ASCII ("Satildi") and diacritic ("Satıldı") spellings found
// in the data, since animal records aren't consistently written.
export function normalizeAnimalStatus(status: string | null): AnimalStatusKey {
    const s = (status ?? 'Aktif').toLowerCase();
    if (s.startsWith('hast')) return 'Hasta';
    if (s.startsWith('geb')) return 'Gebe';
    if (s.startsWith('sat')) return 'Satildi';
    if (s.startsWith('öld') || s.startsWith('old')) return 'Oldu';
    return 'Aktif';
}

/** Badge label + Tailwind class for an animal's status, drawn from the chart palette. */
export function animalStatusBadge(status: string | null) {
    return STATUS_META[normalizeAnimalStatus(status)];
}
