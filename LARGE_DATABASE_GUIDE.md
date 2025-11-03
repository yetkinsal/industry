# Handling Large Database Files (6GB+)

## Problem
Web upload is limited to 100MB. Your 6GB file exceeds this limit.

## Solution 1: Direct Database Restore via Command Line (Best)

### For .bak files (SQL Server backup):
1. First convert to PostgreSQL format using tools like:
   - pgloader
   - AWS DMS
   - Ora2Pg (if from Oracle)

### For .sql files:

**Step 1: Get your Render Database credentials**
```bash
# From Render Dashboard > Your Database > Connection String
# Example format:
postgresql://user:password@host:port/database
```

**Step 2: Restore directly to Render**
```bash
# If you have psql installed locally:
psql "postgresql://user:password@host:port/database" < your-large-file.sql

# Or using pg_restore for compressed backups:
pg_restore -d "postgresql://user:password@host:port/database" your-large-file.dump

# For very large files, compress and stream:
cat your-large-file.sql | gzip | \
  psql "postgresql://user:password@host:port/database"
```

---

## Solution 2: Cloud Storage + Import (Medium Files)

### Step 1: Upload to cloud storage
```bash
# Option A: AWS S3
aws s3 cp your-file.sql s3://your-bucket/

# Option B: Google Cloud Storage
gsutil cp your-file.sql gs://your-bucket/

# Option C: Dropbox/Google Drive (generate public link)
```

### Step 2: Download and import on server
```bash
# SSH into Render or use Render Shell
curl "https://your-cloud-url/file.sql" | \
  psql $DATABASE_URL
```

---

## Solution 3: Split File into Chunks

### For .sql files:
```bash
# Split into 100MB chunks
split -b 100M your-large-file.sql chunk_

# This creates: chunk_aa, chunk_ab, chunk_ac, etc.
```

Then upload each chunk separately through the web interface.

### Merge on server:
```bash
cat chunk_* | psql $DATABASE_URL
```

---

## Solution 4: Use Render Database Import (If Available)

Some Render plans support direct imports:

1. Go to Render Dashboard
2. Select your PostgreSQL database
3. Look for "Import" or "Restore" option
4. Follow their import process

---

## Solution 5: Incremental Schema Migration

Instead of importing everything:

### Step 1: Export just the schema
```bash
# From your source database:
pg_dump --schema-only your_db > schema.sql

# Upload schema.sql (small file)
```

### Step 2: Export data in batches
```bash
# Export specific tables:
pg_dump --data-only --table=users your_db > users.sql
pg_dump --data-only --table=orders your_db > orders.sql

# Upload each table separately
```

---

## Recommended Approach for Your Use Case

Since you have a 6GB file, I recommend:

### Option A: Direct psql restore (fastest)
```bash
# 1. Get Render database URL from dashboard
RENDER_DB_URL="postgresql://user:password@host:port/database"

# 2. Restore directly (will take ~10-30 minutes)
psql "$RENDER_DB_URL" < your-6gb-file.sql
```

### Option B: Use pgAdmin (GUI)
1. Download pgAdmin (https://www.pgadmin.org/)
2. Connect to your Render PostgreSQL
3. Right-click database → Restore
4. Select your file
5. Click Restore (handles large files well)

---

## Update Web App to Handle Large Files

If you want to allow larger uploads through the web app, we'd need to:

1. **Increase upload limit** (requires server changes)
2. **Add chunked upload** (resume-able uploads)
3. **Add background processing** (queue system)

Let me know which approach you'd like to take!
