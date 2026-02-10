# Portofolio 2026
Bun, Vite + react Supabase

## Instalasi Dependensi
```
bun install
```

### Konfigurasi Environment
.env

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

//Mode Json
VITE_USE_JSON_MODE=false
```
---

#### SUPABASE
SQL Editor

1.
```
DROP TABLE IF EXISTS landing_settings;

CREATE TABLE landing_settings (
    id INT PRIMARY KEY DEFAULT 1,
    title TEXT,
    description TEXT,
    logo_url TEXT,
    default_theme TEXT DEFAULT 'dark',
    socials JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    -- Constraint agar ID selalu 1 (hanya satu baris pengaturan)
    CONSTRAINT only_one_row CHECK (id = 1)
);

-- Aktifkan RLS
ALTER TABLE landing_settings ENABLE ROW LEVEL SECURITY;

-- Kebijakan akses
CREATE POLICY "Allow public read" ON landing_settings FOR SELECT USING (true);
CREATE POLICY "Allow auth admin to update" ON landing_settings FOR ALL USING (auth.role() = 'authenticated');

-- Data default
INSERT INTO landing_settings (id, title, description)
VALUES (1, 'Creative Designer', 'Designing intuitive digital products')
ON CONFLICT (id) DO NOTHING;
```

2.
```
-- Izinkan user terautentikasi untuk mengunggah file ke bucket 'assets'
CREATE POLICY "Admin Upload" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'assets');

-- Izinkan user terautentikasi untuk memperbarui file di bucket 'assets'
CREATE POLICY "Admin Update" ON storage.objects 
FOR UPDATE TO authenticated 
USING (bucket_id = 'assets');

-- Izinkan semua orang melihat file di bucket 'assets' (Publik)
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT TO public 
USING (bucket_id = 'assets');
```

3.
```
CREATE TABLE portfolios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    tags TEXT[], -- Array of strings
    image_url TEXT,
    project_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Aktifkan RLS
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- Kebijakan akses
CREATE POLICY "Public can view portfolios" ON portfolios FOR SELECT USING (true);
CREATE POLICY "Admin can manage portfolios" ON portfolios FOR ALL USING (auth.role() = 'authenticated');
```

4.
```
CREATE TABLE blogs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT, -- HTML dari Editor
    banner_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read blogs" ON blogs FOR SELECT USING (true);
CREATE POLICY "Admin manage blogs" ON blogs FOR ALL USING (auth.role() = 'authenticated');
```

5.
```
CREATE TABLE about_me (
    id INT PRIMARY KEY DEFAULT 1,
    full_name TEXT,
    description TEXT,
    contact_email TEXT,
    photo_url TEXT,
    socials JSONB DEFAULT '[]'::jsonb,
    CONSTRAINT only_one_about CHECK (id = 1)
);

INSERT INTO about_me (id, full_name) VALUES (1, 'Your Name') ON CONFLICT DO NOTHING;
```

6.
```
-- Pastikan kebijakan ini ada agar folder otomatis bisa dibuat saat upload
CREATE POLICY "Public Access Assets" ON storage.objects FOR SELECT USING (bucket_id = 'assets');
CREATE POLICY "Admin Insert Assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'assets');
CREATE POLICY "Admin Update Assets" ON storage.objects FOR UPDATE USING (bucket_id = 'assets');
```

7.
```
-- Aktifkan RLS pada tabel sensitif
ALTER TABLE landing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa melihat (Public Read)
CREATE POLICY "Public Read" ON landing_settings FOR SELECT USING (true);

-- Policy: Hanya Admin yang login bisa mengubah (Authenticated Update)
CREATE POLICY "Admin Update" ON landing_settings 
FOR ALL 
TO authenticated 
USING (auth.role() = 'authenticated');
```

8.
```
-- Hapus Policy lama jika sudah ada agar tidak bentrok
DROP POLICY IF EXISTS "Public Access Assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert Assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Assets" ON storage.objects;

-- Buat ulang Policy: Izinkan Publik untuk Melihat (SELECT)
CREATE POLICY "Public Access Assets" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'assets' );

-- Buat ulang Policy: Izinkan Admin untuk Upload (INSERT)
CREATE POLICY "Admin Insert Assets" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'assets' );

-- Buat ulang Policy: Izinkan Admin untuk Update (UPDATE)
CREATE POLICY "Admin Update Assets" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING ( bucket_id = 'assets' );

-- Buat ulang Policy: Izinkan Admin untuk Hapus (DELETE)
CREATE POLICY "Admin Delete Assets" 
ON storage.objects FOR DELETE 
TO authenticated 
USING ( bucket_id = 'assets' );
```

9.
```
-- Membuat tabel jika belum ada
CREATE TABLE IF NOT EXISTS landing_settings (
  id MININT PRIMARY KEY DEFAULT 1,
  banner_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memastikan kolom banner_url ada (jika tabel sudah ada tapi kolom belum)
ALTER TABLE landing_settings 
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Tambahkan satu baris default jika kosong agar fungsi .single() tidak error
INSERT INTO landing_settings (id, banner_url)
VALUES (1, NULL)
ON CONFLICT (id) DO NOTHING;
```

10.
```
ALTER TABLE landing_settings ADD COLUMN IF NOT EXISTS blog_banner_url TEXT;
```

11.
```
-- Menambahkan kolom untuk judul dan deskripsi banner
ALTER TABLE landing_settings 
ADD COLUMN IF NOT EXISTS banner_title TEXT,
ADD COLUMN IF NOT EXISTS banner_description TEXT;

-- (Opsional) Memberikan nilai default agar tidak kosong saat pertama kali tampil
UPDATE landing_settings 
SET banner_title = 'Our Portfolio', 
    banner_description = 'Explore our latest works and digital experiences.'
WHERE id = 1;
```

12.
```
-- Adding columns for Blog Banner Title and Description
ALTER TABLE landing_settings 
ADD COLUMN IF NOT EXISTS blog_banner_title TEXT,
ADD COLUMN IF NOT EXISTS blog_banner_description TEXT;

-- (Optional) Update with default values
UPDATE landing_settings 
SET blog_banner_title = 'The Journal', 
    blog_banner_description = 'Thoughts, stories, and ideas about the digital world.'
WHERE id = 1;
```
13. Greeting text
```
ALTER TABLE landing_settings ADD COLUMN greeting TEXT DEFAULT 'Hello';
UPDATE landing_settings SET greeting = 'Hello' WHERE id = 1;
```
14. Favicon
```
ALTER TABLE landing_settings 
ADD COLUMN site_title TEXT DEFAULT 'Portfolio',
ADD COLUMN favicon_url TEXT;
```
15. 
```
-- Menambahkan kolom portfolio_url ke tabel about_me
ALTER TABLE about_me 
ADD COLUMN IF NOT EXISTS portfolio_url TEXT;

-- Memberikan komentar pada kolom untuk dokumentasi (opsional)
COMMENT ON COLUMN about_me.portfolio_url IS 'URL untuk link portofolio eksternal';
```