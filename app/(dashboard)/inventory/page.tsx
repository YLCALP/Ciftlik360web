'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { StockAdjustmentModal } from '@/components/inventory/StockAdjustmentModal';
import { InventoryForm, InventoryFormValues } from '@/components/inventory/InventoryForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { InventoryItem } from '@/lib/types';
import { createInventoryPurchaseTransaction } from '@/lib/transactions';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [modalType, setModalType] = useState<'in' | 'out'>('in');
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        fetchInventory();
    }, []);

    async function fetchInventory() {
        try {
            const { data, error } = await supabase
                .from('feed_inventory')
                .select('*')
                .order('feed_name');

            if (error) throw error;
            setItems(data || []);
        } catch (error: any) {
            console.error('Error fetching inventory:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const filteredItems = items.filter((item) =>
        item.feed_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleStockIn = (item: InventoryItem) => {
        setSelectedItem(item);
        setModalType('in');
        setIsModalOpen(true);
    };

    const handleStockOut = (item: InventoryItem) => {
        setSelectedItem(item);
        setModalType('out');
        setIsModalOpen(true);
    };

    const handleConfirmAdjustment = async (quantity: number, type: 'in' | 'out') => {
        if (!selectedItem) return;

        const newQuantity = type === 'in'
            ? selectedItem.quantity + quantity
            : Math.max(0, selectedItem.quantity - quantity);

        try {
            const { error } = await supabase
                .from('feed_inventory')
                .update({
                    quantity: newQuantity,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedItem.id);

            if (error) throw error;

            setItems(items.map(item =>
                item.id === selectedItem.id
                    ? { ...item, quantity: newQuantity, updated_at: new Date().toISOString() }
                    : item
            ));
        } catch (error) {
            console.error('Error updating stock:', error);
        }
    };

    const handleCreate = async (data: InventoryFormValues) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('User not authenticated');
                return;
            }

            const newItem = {
                user_id: user.id,
                feed_name: data.feed_name,
                feed_type: data.feed_type,
                brand: data.brand || null,
                quantity: parseFloat(data.quantity),
                unit: data.unit,
                purchase_price: parseFloat(data.purchase_price.replace(/\./g, '').replace(',', '.')),
                purchase_date: data.purchase_date.toISOString().split('T')[0],
                expiry_date: data.expiry_date ? data.expiry_date.toISOString().split('T')[0] : null,
                supplier: data.supplier || null,
                storage_location: data.storage_location || null,
                notes: data.notes || null,
            };

            const { data: insertedData, error } = await supabase
                .from('feed_inventory')
                .insert([newItem])
                .select()
                .single();

            if (error) throw error;

            // Create purchase transaction
            const purchasePrice = parseFloat(data.purchase_price.replace(/\./g, '').replace(',', '.'));
            await createInventoryPurchaseTransaction(
                user.id,
                insertedData.id,
                data.feed_name,
                data.feed_type,
                purchasePrice,
                data.purchase_date.toISOString().split('T')[0]
            );

            setItems([...items, insertedData]);
            setIsAddDialogOpen(false);
        } catch (error) {
            console.error('Error creating item:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search inventory..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
                    Error: {error}
                </div>
            )}

            {loading ? (
                <div>Loading...</div>
            ) : (
                <InventoryTable
                    items={filteredItems}
                    onStockIn={handleStockIn}
                    onStockOut={handleStockOut}
                />
            )}

            <StockAdjustmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmAdjustment}
                item={selectedItem}
                type={modalType}
            />

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Inventory Item</DialogTitle>
                    </DialogHeader>
                    <InventoryForm
                        onSubmit={handleCreate}
                        onCancel={() => setIsAddDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
