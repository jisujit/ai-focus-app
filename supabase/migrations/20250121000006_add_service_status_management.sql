-- Add service status management
ALTER TABLE public.services
ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'coming_soon', 'active', 'archived')),
ADD COLUMN show_pricing BOOLEAN DEFAULT false,
ADD COLUMN allow_registration BOOLEAN DEFAULT false,
ADD COLUMN coming_soon_message TEXT DEFAULT 'Coming Soon! Stay tuned for registration details.';

-- Add session deletion tracking
ALTER TABLE public.sessions
ADD COLUMN is_deleted BOOLEAN DEFAULT false,
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN deletion_reason TEXT,
ADD COLUMN deleted_by TEXT;

-- Add cancellation email tracking
CREATE TABLE IF NOT EXISTS public.session_cancellations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  cancellation_reason TEXT NOT NULL,
  cancellation_message TEXT,
  refund_processed BOOLEAN DEFAULT false,
  emails_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_services_status ON public.services(status);
CREATE INDEX IF NOT EXISTS idx_services_visible ON public.services(status, available) WHERE status IN ('coming_soon', 'active');
CREATE INDEX IF NOT EXISTS idx_sessions_deleted ON public.sessions(is_deleted);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON public.sessions(is_deleted, status) WHERE is_deleted = false AND status = 'active';

-- Update existing services to be 'active' if they were previously available
UPDATE public.services 
SET status = 'active', show_pricing = true, allow_registration = true 
WHERE available = true;

-- Update existing services to be 'coming_soon' if they were not available
UPDATE public.services 
SET status = 'coming_soon', show_pricing = true, allow_registration = false 
WHERE available = false;
