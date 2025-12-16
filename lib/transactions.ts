// Transaction helper functions
import { createClient } from '@/lib/supabase/client';

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
