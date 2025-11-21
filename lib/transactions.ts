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
        type: 'expense',
        category: 'animal_purchase',
        amount: purchasePrice,
        description: `Purchased ${species} - ${tagNumber}`,
        date: purchaseDate,
        animal_id: animalId,
        is_automatic: true,
    });

    if (error) {
        console.error('Error creating animal purchase transaction:', error);
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
            description: `Purchased ${species} - ${tagNumber}`,
            date: purchaseDate,
        })
        .eq('animal_id', animalId)
        .eq('type', 'expense')
        .eq('category', 'animal_purchase');

    if (error) {
        console.error('Error updating animal purchase transaction:', error);
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
        type: 'income',
        category: 'animal_sale',
        amount: soldPrice,
        description: `Sold ${species} - ${tagNumber}`,
        date: soldDate,
        animal_id: animalId,
        is_automatic: true,
    });

    if (error) {
        console.error('Error creating animal sale transaction:', error);
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
        type: 'expense',
        category: feedType.toLowerCase(),
        amount: purchasePrice,
        description: `Purchased ${feedName} (${feedType})`,
        date: purchaseDate,
        feed_id: feedId,
        is_automatic: true,
    });

    if (error) {
        console.error('Error creating inventory purchase transaction:', error);
        throw error;
    }
}
