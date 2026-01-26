# Database Schema

CLARP uses Supabase (PostgreSQL) for persistent data storage.

## Project Details

- **Project**: clarp
- **Region**: us-east-2
- **Project ID**: `nthfsdvmpdoljpqbxzoi`

## Tables

### `xintel_reports`

Caches X Intel scan reports to avoid redundant API calls to Grok.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `handle` | `TEXT` | `PRIMARY KEY` | X handle (lowercase, without @) |
| `report` | `JSONB` | `NOT NULL` | Full scan report data |
| `scanned_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | When the scan was performed |
| `expires_at` | `TIMESTAMPTZ` | `NOT NULL` | When the cache entry expires |

**Indexes:**
- `idx_xintel_reports_expires_at` on `expires_at` - For efficient cleanup queries

**RLS Policy:**
- `Allow all operations on xintel_reports` - Permits all CRUD operations (cache table, no sensitive data)

## Cache Behavior

- **TTL**: 6 hours (`CACHE_TTL_MS = 6 * 60 * 60 * 1000`)
- **Strategy**: Write-through (saves to both Supabase and in-memory)
- **Fallback**: If Supabase is unavailable, falls back to in-memory cache only

## Data Flow

```
submitScan()
    |
    v
Check Supabase cache (by handle, where expires_at > now)
    |
    +--> Cache hit: Return cached report
    |
    +--> Cache miss: Run Grok scan
                        |
                        v
                   processRealScan()
                        |
                        v
                   Save to Supabase (upsert on handle)
                   Save to in-memory cache
                        |
                        v
                   Return new report
```

## Environment Variables

```bash
SUPABASE_URL=https://nthfsdvmpdoljpqbxzoi.supabase.co
SUPABASE_ANON_KEY=<anon-key>
```

## Client Usage

```typescript
import { getSupabaseClient } from '@/lib/supabase/client';

const client = getSupabaseClient();
if (client) {
  // Supabase is available
}
```

## Migrations

Migrations are stored in `supabase/migrations/`:

- `20260126_create_xintel_reports.sql` - Initial table creation
