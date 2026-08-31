type NormalizedStatus = 'Aktif' | 'Hasta' | 'Satildi' | 'Oldu';

const STATUS_META: Record<NormalizedStatus, { label: string; color: string }> = {
    Aktif: { label: 'Aktif', color: 'var(--chart-1)' },
    Hasta: { label: 'Hasta', color: 'var(--chart-2)' },
    Satildi: { label: 'Satıldı', color: 'var(--chart-4)' },
    Oldu: { label: 'Öldü', color: 'var(--muted-foreground)' },
};

// Handles both ASCII ("Satildi") and diacritic ("Satıldı") status spellings
// found in the data, since animal records aren't consistently written.
function normalizeStatus(status: string | null): NormalizedStatus {
    const s = (status ?? 'Aktif').toLowerCase();
    if (s.startsWith('hast')) return 'Hasta';
    if (s.startsWith('sat')) return 'Satildi';
    if (s.startsWith('öld') || s.startsWith('old')) return 'Oldu';
    return 'Aktif';
}

const MAX_TICKS = 200;

interface HerdStripProps {
    animals: { status: string | null }[];
}

/**
 * One tick per animal, colored by status — dense herds fall back to
 * majority-vote buckets so the strip always reads as a single row.
 */
export function HerdStrip({ animals }: HerdStripProps) {
    if (animals.length === 0) return null;

    const statuses = animals.map((a) => normalizeStatus(a.status));
    const counts = statuses.reduce(
        (acc, s) => {
            acc[s] += 1;
            return acc;
        },
        { Aktif: 0, Hasta: 0, Satildi: 0, Oldu: 0 } as Record<NormalizedStatus, number>
    );

    const bucketSize = Math.max(1, Math.ceil(statuses.length / MAX_TICKS));
    const ticks: NormalizedStatus[] = [];
    for (let i = 0; i < statuses.length; i += bucketSize) {
        const bucket = statuses.slice(i, i + bucketSize);
        const bucketCounts = new Map<NormalizedStatus, number>();
        for (const s of bucket) bucketCounts.set(s, (bucketCounts.get(s) ?? 0) + 1);
        const [dominant] = [...bucketCounts.entries()].sort((a, b) => b[1] - a[1])[0];
        ticks.push(dominant);
    }

    return (
        <div className="flex flex-col gap-2.5 rounded-lg border px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Sürü Durumu</span>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {(Object.keys(STATUS_META) as NormalizedStatus[])
                        .filter((key) => counts[key] > 0)
                        .map((key) => (
                            <span key={key} className="flex items-center gap-1.5">
                                <span className="size-1.5 rounded-[1px]" style={{ background: STATUS_META[key].color }} />
                                {STATUS_META[key].label} {counts[key]}
                            </span>
                        ))}
                </div>
            </div>
            <div className="flex flex-wrap gap-[3px]" role="img" aria-label={`${animals.length} hayvanlık sürü durumu`}>
                {ticks.map((status, i) => (
                    <span key={i} className="size-1.5 rounded-[1px]" style={{ background: STATUS_META[status].color }} />
                ))}
            </div>
        </div>
    );
}
