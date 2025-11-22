-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.animals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tag_number text NOT NULL,
  name text,
  species text NOT NULL,
  breed text,
  gender text NOT NULL,
  birth_date date,
  weight numeric,
  purchase_price numeric NOT NULL DEFAULT 0,
  purchase_date date NOT NULL DEFAULT CURRENT_DATE,
  photo_url text,
  status text DEFAULT 'active'::text,
  sold_price numeric,
  sold_date date,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT animals_pkey PRIMARY KEY (id),
  CONSTRAINT animals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.farm_info (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  farm_name text NOT NULL,
  owner_name text,
  address text,
  city text,
  province text,
  postal_code text,
  phone text,
  email text,
  established_date date,
  farm_type text,
  total_area numeric,
  livestock_capacity integer,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT farm_info_pkey PRIMARY KEY (id),
  CONSTRAINT farm_info_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.feed_inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  feed_name text NOT NULL,
  feed_type text NOT NULL,
  brand text,
  quantity numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'kg'::text,
  purchase_price numeric NOT NULL DEFAULT 0,
  price_per_unit numeric,
  purchase_date date NOT NULL DEFAULT CURRENT_DATE,
  expiry_date date,
  supplier text,
  storage_location text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT feed_inventory_pkey PRIMARY KEY (id),
  CONSTRAINT feed_inventory_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['income'::text, 'expense'::text])),
  category text NOT NULL,
  amount numeric NOT NULL,
  description text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  animal_id uuid,
  feed_id uuid,
  is_automatic boolean DEFAULT false,
  invoice_url text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES public.animals(id),
  CONSTRAINT transactions_feed_id_fkey FOREIGN KEY (feed_id) REFERENCES public.feed_inventory(id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);