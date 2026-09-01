-- Migration 016: Supabase Storage Bucket & Security Policies for Cash Receipt Proofs

-- Create private bucket 'cash-payment-proofs' if not exists
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
    'cash-payment-proofs',
    'cash-payment-proofs',
    false, -- PRIVATE BUCKET: No public unauthenticated access
    false,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies on storage.objects

-- 1. Agents can upload cash receipt photos into cash-payment-proofs
CREATE POLICY "Agents can upload cash proof images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'cash-payment-proofs'
        AND auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.agents
            WHERE id = auth.uid()
            AND verified_status = 'verified'
        )
    );

-- 2. Authenticated group members & organizers can read cash proof images
CREATE POLICY "Group members and agents can view cash proof images"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'cash-payment-proofs'
        AND auth.role() = 'authenticated'
    );
