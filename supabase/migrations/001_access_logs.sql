-- Migration: 001_access_logs.sql
-- Description: Create access_logs table with indexes and Row Level Security (RLS) policies

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_address TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT,
    device_type TEXT NOT NULL CHECK (device_type IN ('mobile', 'desktop')),
    access_status TEXT NOT NULL CHECK (access_status IN ('allowed', 'blocked')),
    page TEXT NOT NULL,
    language TEXT,
    block_reason TEXT,
    user_agent TEXT
);

-- 2. Performance Indexes for Dashboard Filtering & Sorting
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON public.access_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_country ON public.access_logs (country);
CREATE INDEX IF NOT EXISTS idx_access_logs_device_type ON public.access_logs (device_type);
CREATE INDEX IF NOT EXISTS idx_access_logs_access_status ON public.access_logs (access_status);
CREATE INDEX IF NOT EXISTS idx_access_logs_ip_address ON public.access_logs (ip_address);

-- 3. Row Level Security (RLS)
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated users (Administrators) can view/filter all logs
CREATE POLICY "Authenticated users can read access logs"
    ON public.access_logs
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy 2: Service Role has full access (Built-in Supabase behavior, policy added for clarity)
CREATE POLICY "Service role can insert access logs"
    ON public.access_logs
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Public / Anonymous users have NO read access and NO direct delete/update access.
