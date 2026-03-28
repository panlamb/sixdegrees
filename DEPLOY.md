# Six° — Deploy Guide

Ακολούθησε αυτά τα βήματα με τη σειρά.
Κάθε βήμα έχει ακριβείς οδηγίες.

---

## ΒΗΜΑ 1 — Supabase (η database)

1. Πήγαινε στο https://supabase.com
2. Κάνε "Start your project" → Sign up με GitHub
3. Κάνε "New Project"
   - Name: `sixdegrees`
   - Password: (διάλεξε κάτι και κράτησέ το)
   - Region: `West EU (Ireland)`
4. Περίμενε ~2 λεπτά να φτιαχτεί
5. Πήγαινε στο **SQL Editor** (αριστερά μενού)
6. Κάνε paste το αρχείο `supabase-schema.sql` και πάτα **Run**
7. Πήγαινε **Settings → API** και αντέγραψε:
   - `Project URL` → θα το βάλεις στο `.env.local`
   - `anon public key` → θα το βάλεις στο `.env.local`

---

## ΒΗΜΑ 2 — GitHub (ο κώδικας)

1. Πήγαινε στο https://github.com/new
2. Repository name: `sixdegrees`
3. Private ✓
4. Κάνε "Create repository"
5. Άνοιξε terminal στον υπολογιστή σου
6. Τρέξε:
   ```
   cd sixdegrees
   cp .env.local.example .env.local
   ```
7. Άνοιξε `.env.local` και βάλε τις τιμές από το Supabase
8. Τρέξε:
   ```
   git init
   git add .
   git commit -m "initial"
   git remote add origin https://github.com/YOURUSERNAME/sixdegrees.git
   git push -u origin main
   ```

---

## ΒΗΜΑ 3 — Vercel (το hosting)

1. Πήγαινε στο https://vercel.com
2. Sign up με GitHub
3. Κάνε "Add New Project"
4. Import το `sixdegrees` repository
5. Πρόσθεσε Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = (το Project URL από Supabase)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (το anon key από Supabase)
   - `NEXT_PUBLIC_APP_URL` = (το URL που θα σου δώσει το Vercel)
6. Κάνε "Deploy"

Σε ~2 λεπτά το app είναι online.

---

## ΒΗΜΑ 4 — Supabase Auth redirect

Μετά το deploy:
1. Πήγαινε Supabase → Authentication → URL Configuration
2. Βάλε το Vercel URL σου στο "Site URL"
3. Πρόσθεσε `https://yourapp.vercel.app/**` στα "Redirect URLs"

---

## Αν κολλήσεις

Στείλε το error message ακριβώς όπως εμφανίζεται
και θα το λύσουμε μαζί.
