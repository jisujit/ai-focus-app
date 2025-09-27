-- Add location fields to sessions table
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS location_name TEXT,
ADD COLUMN IF NOT EXISTS location_address TEXT,
ADD COLUMN IF NOT EXISTS location_city TEXT,
ADD COLUMN IF NOT EXISTS location_state TEXT,
ADD COLUMN IF NOT EXISTS location_zip TEXT,
ADD COLUMN IF NOT EXISTS location_phone TEXT,
ADD COLUMN IF NOT EXISTS location_notes TEXT,
ADD COLUMN IF NOT EXISTS is_virtual BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS virtual_link TEXT,
ADD COLUMN IF NOT EXISTS location_confirmed_by DATE,
ADD COLUMN IF NOT EXISTS parking_info TEXT,
ADD COLUMN IF NOT EXISTS driving_directions TEXT;

-- Add index for location searches
CREATE INDEX IF NOT EXISTS idx_sessions_location_city 
ON public.sessions(location_city);

CREATE INDEX IF NOT EXISTS idx_sessions_is_virtual 
ON public.sessions(is_virtual);
