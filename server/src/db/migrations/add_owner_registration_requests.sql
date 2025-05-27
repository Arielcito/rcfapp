-- Migration: Add owner registration requests table
-- Created: 2024-01-XX

CREATE TABLE IF NOT EXISTS owner_registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  property_name TEXT NOT NULL,
  property_location TEXT NOT NULL,
  additional_info TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  processed_at TIMESTAMP,
  processed_by UUID REFERENCES users(id),
  notes TEXT
);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_owner_registration_requests_email ON owner_registration_requests(email);

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_owner_registration_requests_status ON owner_registration_requests(status);

-- Add index for created_at ordering
CREATE INDEX IF NOT EXISTS idx_owner_registration_requests_created_at ON owner_registration_requests(created_at DESC); 