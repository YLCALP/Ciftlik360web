export type AnimalStatus = 'Healthy' | 'Sick' | 'Pregnant' | 'Sold' | 'Deceased';
export type AnimalType = 'Cow' | 'Sheep' | 'Goat' | 'Chicken';

export interface Animal {
  id: string;
  user_id: string;
  tag_number: string;
  name: string | null;
  species: string;
  breed: string | null;
  gender: string;
  birth_date: string | null;
  weight: number | null;
  purchase_price: number;
  purchase_date: string;
  photo_url: string | null;
  status: string | null;
  sold_price: number | null;
  sold_date: string | null;
  notes: string | null;
  created_at: string;
}

export type StockType = 'Feed' | 'Medicine' | 'Equipment';
export type UnitType = 'kg' | 'liters' | 'units' | 'bags';

export interface InventoryItem {
  id: string;
  user_id: string;
  feed_name: string;
  feed_type: string;
  brand?: string | null;
  quantity: number;
  unit: string;
  purchase_price: number;
  price_per_unit?: number | null;
  purchase_date: string;
  expiry_date?: string | null;
  supplier?: string | null;
  storage_location?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: string;
  animal_id?: string | null;
  feed_id?: string | null;
  is_automatic?: boolean;
  invoice_url?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface DashboardStats {
  totalAnimals: number;
  sickAnimals: number;
  lowStockItems: number;
  monthlyIncome: number;
  monthlyExpense: number;
}
