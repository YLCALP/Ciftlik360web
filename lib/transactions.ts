// Transaction helper functions
import { createClient } from '@/lib/supabase/client';
import { Transaction } from '@/lib/types';
import { formatDate } from '@/lib/format';

export interface MonthlyTotals {
    name: string;
    rawDate: Date;
    Gelir: number;
    Gider: number;
    [key: string]: unknown;
}

/** Groups transactions into per-month income/expense totals, sorted chronologically. */
export function groupTransactionsByMonth(transactions: Transaction[]): MonthlyTotals[] {
    const byMonth = transactions.reduce((acc, t) => {
        const date = new Date(t.date);
        const monthYear = formatDate(date, 'monthYear');

        const existing = acc.find((item) => item.name === monthYear);
        if (existing) {
            if (t.type === 'Gelir') existing.Gelir += t.amount;
            else existing.Gider += t.amount;
        } else {
            acc.push({
                name: monthYear,
                rawDate: date,
                Gelir: t.type === 'Gelir' ? t.amount : 0,
                Gider: t.type === 'Gider' ? t.amount : 0,
            });
        }
        return acc;
    }, [] as MonthlyTotals[]);

    return byMonth.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
}

export async function createAnimalPurchaseTransaction(
    userId: string,
    animalId: string,
    tagNumber: string,
    species: string,
    purchasePrice: number,
    purchaseDate: string
) {
    const supabase = createClient();

    const { error } = await supabase.from('transactions').insert({
        user_id: userId,
        type: 'Gider',
        category: 'hayvan_alimi',
        amount: purchasePrice,
        description: `Satın Alındı ${species} - ${tagNumber}`,
        date: purchaseDate,
        animal_id: animalId,
        is_automatic: true,
    });

    if (error) {
        console.error('Hayvan Alımı Yaparken Hata:', error);
        throw error;
    }
}

export async function updateAnimalPurchaseTransaction(
    animalId: string,
    tagNumber: string,
    species: string,
    purchasePrice: number,
    purchaseDate: string
) {
    const supabase = createClient();

    const { error } = await supabase
        .from('transactions')
        .update({
            amount: purchasePrice,
            description: `Hayvan alımı ${species} - ${tagNumber}`,
            date: purchaseDate,
        })
        .eq('animal_id', animalId)
        .eq('type', 'Gider')
        .eq('category', 'hayvan_alimi');

    if (error) {
        console.error('Hayvan Alımı Güncellemekde Hata:', error);
        throw error;
    }
}

export async function createAnimalSaleTransaction(
    userId: string,
    animalId: string,
    tagNumber: string,
    species: string,
    soldPrice: number,
    soldDate: string
) {
    const supabase = createClient();

    const { error } = await supabase.from('transactions').insert({
        user_id: userId,
        type: 'Gelir',
        category: 'hayvan_satisi',
        amount: soldPrice,
        description: `Satıldı ${species} - ${tagNumber}`,
        date: soldDate,
        animal_id: animalId,
        is_automatic: true,
    });

    if (error) {
        console.error('Hayvan Satışı Yaparken Hata:', error);
        throw error;
    }
}

export async function createInventoryPurchaseTransaction(
    userId: string,
    feedId: string,
    feedName: string,
    feedType: string,
    purchasePrice: number,
    purchaseDate: string
) {
    const supabase = createClient();

    const { error } = await supabase.from('transactions').insert({
        user_id: userId,
        type: 'Gider',
        category: feedType.toLowerCase(),
        amount: purchasePrice,
        description: `${feedName} (${feedType} Alımı)`,
        date: purchaseDate,
        feed_id: feedId,
        is_automatic: true,
    });

    if (error) {
        console.error('Envanter Alımı Yaparken Hata:', error);
        throw error;
    }
}
