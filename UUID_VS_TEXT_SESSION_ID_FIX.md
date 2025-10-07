# UUID vs TEXT Session ID Issue - Permanent Fix

## Problem
The `training_registrations.session_id` field is **TEXT** (e.g., "102501"), but the code sometimes tries to pass **UUID** values, causing:
```
"operator does not exist: uuid = text"
```

## Root Cause
- **Database Schema**: `training_registrations.session_id` = TEXT
- **Sessions Table**: `sessions.id` = UUID, `sessions.session_id` = TEXT  
- **Inconsistency**: Frontend sometimes passes UUID instead of TEXT

## Permanent Solution

### 1. Database Schema (FIXED ✅)
```sql
-- training_registrations.session_id is TEXT (human-readable like "102501")
-- sessions.id is UUID (internal primary key)
-- sessions.session_id is TEXT (human-readable like "102501")
```

### 2. Frontend Components (FIXED ✅)
```tsx
// TrainingRegistrationForm.tsx - CORRECT
<PaymentForm
  sessionId={selectedSession}  // TEXT session_id like "102501"
  // NOT: sessionId={selectedSessionUuid}  // UUID - WRONG!
/>
```

### 3. Backend Edge Function (FIXED ✅)
```typescript
// confirm-payment/index.ts - CORRECT
// Store session_id directly as TEXT
session_id: registrationData.sessionId,  // TEXT like "102501"
```

### 4. Database Triggers (FIXED ✅)
```sql
-- Compare TEXT with TEXT, not UUID with TEXT
WHERE sessions.session_id = NEW.session_id  -- TEXT = TEXT ✅
-- NOT: WHERE sessions.id = NEW.session_id   -- UUID = TEXT ❌
```

## Validation Rules

### Frontend Validation
- ✅ Always pass `selectedSession` (TEXT) to PaymentForm
- ❌ Never pass `selectedSessionUuid` (UUID) to PaymentForm
- ✅ Session selection should store both: `selectedSession` (TEXT) and `selectedSessionUuid` (UUID)

### Backend Validation  
- ✅ confirm-payment expects TEXT session_id
- ✅ Database insert uses TEXT session_id
- ✅ Triggers compare TEXT with TEXT

### Database Validation
- ✅ training_registrations.session_id = TEXT
- ✅ sessions.session_id = TEXT  
- ✅ sessions.id = UUID

## Testing Checklist
- [ ] Registration form passes TEXT session_id to PaymentForm
- [ ] PaymentForm sends TEXT session_id to confirm-payment
- [ ] confirm-payment inserts TEXT session_id to database
- [ ] Database triggers work with TEXT session_id
- [ ] No UUID/text comparison errors in logs

## Prevention
1. **Always use `selectedSession` (TEXT) for PaymentForm**
2. **Never use `selectedSessionUuid` (UUID) for PaymentForm**
3. **Document this in code comments**
4. **Add validation in confirm-payment function**

## Files Modified
- ✅ `supabase/functions/confirm-payment/index.ts`
- ✅ `supabase/migrations/20250122000001_fix_session_id_type_mismatch.sql`
- ✅ `supabase/migrations/20250122000002_fix_trigger_session_id_comparison.sql`
- ✅ `src/components/TrainingRegistrationForm.tsx`

## Last Fixed
- Date: 2025-01-22
- Issue: UUID vs TEXT session_id mismatch
- Status: RESOLVED ✅
