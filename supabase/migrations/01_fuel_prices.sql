-- Create table for fuel prices
create table if not exists public.fuel_prices (
  id uuid default gen_random_uuid() primary key,
  region text not null,
  city text not null,
  station text not null,
  fuel_type text not null,
  price numeric not null,
  last_updated timestamptz default now() not null,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.fuel_prices enable row level security;

-- Policy: Everyone can read prices
create policy "Fuel prices are public" 
  on public.fuel_prices for select 
  using (true);

-- Policy: Only authenticated users can insert/update (for now, maybe restrict to admin later)
create policy "Authenticated users can manage prices"
  on public.fuel_prices for all
  using (auth.role() = 'authenticated');
