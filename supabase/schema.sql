-- ============================================================================
-- CHANDRESH KUMAR PORTFOLIO — SUPABASE SCHEMA & RLS POLICIES
-- Run this script in the Supabase SQL Editor to initialize all tables,
-- storage buckets, triggers, and Row Level Security (RLS) policies.
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. PROJECTS TABLE
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_order int2 not null default 1,
  is_featured boolean not null default true,
  title text not null,
  category text not null,
  summary text not null,
  key_tech text[] not null default '{}',
  live_url text not null default '',
  browser_label text not null default '',
  image_url text not null default '/images/work/cinematic-portfolio.svg',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. EDUCATION TABLE (MY LEARNING JOURNEY — 2 PHASES)
create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  badge_text text not null,
  title text not null,
  year_or_duration text not null,
  institution_or_board text not null,
  location_or_qualification text not null,
  score_or_completion text not null,
  status text not null default 'Completed',
  description text not null default '',
  display_order int2 not null default 1,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.education add column if not exists description text not null default '';

-- 3. ACHIEVEMENTS TABLE
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  metric_value text not null,
  metric_suffix text not null default '',
  label text not null,
  description text not null default '',
  category text not null default 'Highlight',
  display_order int2 not null default 1,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. CERTIFICATES, ACHIEVEMENTS & MEMORIES SHOWCASE TABLE
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  issuer text not null,
  role_or_domain text not null,
  subtitle_or_skills text not null,
  category text not null default 'Certificates' check (
    category in (
      'Certificates',
      'Achievements',
      'Hackathon Memories',
      'Academic Milestones',
      'Web & Cloud',
      'CS & AI Labs'
    )
  ),
  credential_url text not null default '',
  image_url text not null default '',
  issue_date text not null default '2025',
  display_order int2 not null default 1,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure existing databases upgrade the category constraint cleanly
alter table public.certificates drop constraint if exists certificates_category_check;
alter table public.certificates add constraint certificates_category_check check (
  category in (
    'Certificates',
    'Achievements',
    'Hackathon Memories',
    'Academic Milestones',
    'Web & Cloud',
    'CS & AI Labs'
  )
);

-- 5. CONTACT MESSAGES TABLE
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  email text not null check (char_length(trim(email)) between 5 and 180),
  subject text not null default 'Project / Collaboration Inquiry' check (char_length(subject) <= 200),
  message text not null check (char_length(trim(message)) between 5 and 4000),
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  created_at timestamptz not null default now()
);

-- 6. SKILLS / TECH STACK TABLE
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  role text not null,
  category_id text not null default 'frontend' check (category_id in ('frontend', 'styling-motion', 'backend-data', 'workflow')),
  icon_key text not null default 'code',
  accent_color text not null default '#ff8c59',
  display_order int2 not null default 1,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Updated_at trigger helper
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

drop trigger if exists set_education_updated_at on public.education;
create trigger set_education_updated_at
  before update on public.education
  for each row execute function public.handle_updated_at();

drop trigger if exists set_achievements_updated_at on public.achievements;
create trigger set_achievements_updated_at
  before update on public.achievements
  for each row execute function public.handle_updated_at();

drop trigger if exists set_certificates_updated_at on public.certificates;
create trigger set_certificates_updated_at
  before update on public.certificates
  for each row execute function public.handle_updated_at();

drop trigger if exists set_skills_updated_at on public.skills;
create trigger set_skills_updated_at
  before update on public.skills
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- ADMIN AUTHORIZATION ALLOWLIST & ROW LEVEL SECURITY (RLS) POLICIES
-- Authorized Administrator: chandreshme01@gmail.com
-- ============================================================================

create table if not exists public.admin_users (
  email text primary key check (email = lower(trim(email))),
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

-- Seed the authorized portfolio administrator
insert into public.admin_users (email, role)
values ('chandreshme01@gmail.com', 'admin')
on conflict (email) do update set role = 'admin';

-- Assign app_metadata role='admin' to chandreshme01@gmail.com if already registered in auth.users
do $$
begin
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
  where lower(email) = 'chandreshme01@gmail.com';
exception
  when insufficient_privilege or undefined_table then
    null;
end;
$$;

alter table public.admin_users enable row level security;
alter table public.projects enable row level security;
alter table public.education enable row level security;
alter table public.achievements enable row level security;
alter table public.certificates enable row level security;
alter table public.contact_messages enable row level security;
alter table public.skills enable row level security;

-- Helper function: strictly verifies authenticated administrator session
-- Only permits chandreshme01@gmail.com, app_metadata.role = 'admin', or allowlisted emails in public.admin_users
create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.role() = 'authenticated'
    and (
      lower(coalesce(auth.jwt() ->> 'email', '')) = 'chandreshme01@gmail.com'
      or lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin'
      or exists (
        select 1
        from public.admin_users a
        where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
          and a.role = 'admin'
      )
    );
$$;

-- ADMIN_USERS POLICIES
drop policy if exists "Admin can view admin allowlist" on public.admin_users;
create policy "Admin can view admin allowlist"
  on public.admin_users for select
  to authenticated
  using (public.is_portfolio_admin());

drop policy if exists "Admin can manage admin allowlist" on public.admin_users;
create policy "Admin can manage admin allowlist"
  on public.admin_users for all
  to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

-- PROJECTS POLICIES
drop policy if exists "Public can view published projects" on public.projects;
create policy "Public can view published projects"
  on public.projects for select
  to anon, authenticated
  using (published = true or public.is_portfolio_admin());

drop policy if exists "Admin full access to projects" on public.projects;
create policy "Admin full access to projects"
  on public.projects for all
  to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

-- EDUCATION POLICIES
drop policy if exists "Public can view published education" on public.education;
create policy "Public can view published education"
  on public.education for select
  to anon, authenticated
  using (published = true or public.is_portfolio_admin());

drop policy if exists "Admin full access to education" on public.education;
create policy "Admin full access to education"
  on public.education for all
  to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

-- ACHIEVEMENTS POLICIES
drop policy if exists "Public can view published achievements" on public.achievements;
create policy "Public can view published achievements"
  on public.achievements for select
  to anon, authenticated
  using (published = true or public.is_portfolio_admin());

drop policy if exists "Admin full access to achievements" on public.achievements;
create policy "Admin full access to achievements"
  on public.achievements for all
  to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

-- CERTIFICATES POLICIES
drop policy if exists "Public can view published certificates" on public.certificates;
create policy "Public can view published certificates"
  on public.certificates for select
  to anon, authenticated
  using (published = true or public.is_portfolio_admin());

drop policy if exists "Admin full access to certificates" on public.certificates;
create policy "Admin full access to certificates"
  on public.certificates for all
  to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

-- SKILLS POLICIES
drop policy if exists "Public can view published skills" on public.skills;
create policy "Public can view published skills"
  on public.skills for select
  to anon, authenticated
  using (published = true or public.is_portfolio_admin());

drop policy if exists "Admin full access to skills" on public.skills;
create policy "Admin full access to skills"
  on public.skills for all
  to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

-- NON-DESTRUCTIVE BASELINE PROJECTS SEED (SYNCHRONIZED WITH SECTION#CONTENT & /WORK)
insert into public.projects (slug, display_order, is_featured, title, category, summary, key_tech, live_url, browser_label, image_url, published)
values
  ('cinematic-portfolio', 1, true, 'Cinematic Interactive Portfolio', '[Web & Cloud] Chandresh Kumar / Creative Web Development & CMS', 'Full-stack portfolio website and content management system with interactive project cards, custom micro-interactions, and Core Web Vitals optimization.', array['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase'], 'https://moon-rocks.github.io/PORTFOLIO/', 'moon-rocks.github.io/PORTFOLIO', '/images/work/cinematic-portfolio.svg', true),
  ('jal-setu', 2, true, 'Jal-Setu Platform', '[Web & Cloud] Chandresh Kumar / Infrastructure & Cloud Web App', 'Web application for public utility monitoring and water resource management, containerized and deployed across Render and GitHub Pages.', array['Full-Stack Web', 'Render', 'Cloud Hosting', 'GitHub Actions'], 'https://github.com/moon-rocks/Jal_setu', 'github.com/moon-rocks/Jal_setu', '/images/work/jal-setu.svg', true),
  ('campus-book', 3, true, 'Campus-Book Platform', '[Web & Cloud] Chandresh Kumar / Academic Portal & Repository', 'Centralized academic repository and collaborative documentation hub designed to organize CS notes, study material, and technical resources.', array['Static Web Architecture', 'GitHub Pages', 'Markdown', 'CSS'], 'https://github.com/moon-rocks/campus-book', 'github.com/moon-rocks/campus-book', '/images/work/campus-book.svg', true),
  ('algorithmic-practice-suite', 4, false, 'Algorithmic Practice Suite', '[CS & AI Labs] LeetCode & GeeksforGeeks / Core CS & Problem Solving', 'Implementations of fundamental data structures, algorithms, and complexity analysis across LeetCode and GeeksforGeeks.', array['C++', 'Python', 'Data Structures & Algorithms'], 'https://github.com/moon-rocks', 'github.com/moon-rocks', '/images/work/cinematic-portfolio.svg', true),
  ('ai-hardware-labs', 5, false, 'AI & Hardware Engineering Labs', '[CS & AI Labs] Polytechnic Expert CSE / Polytechnic Academic Work', 'Hands-on experiments covering Artificial Intelligence algorithms and circuit foundations in Digital Electronics.', array['Artificial Intelligence', 'Digital Electronics'], 'https://github.com/moon-rocks', 'github.com/moon-rocks', '/images/work/jal-setu.svg', true),
  ('emerging-tech-skilling', 6, false, 'Emerging Tech & Skilling', '[CS & AI Labs] FutureSkills Prime & Udemy / Continuous Skilling & Certifications', 'Continuous technical skilling and certified emerging technology specializations across FutureSkills Prime and Udemy.', array['FutureSkills Prime & Udemy Technical Specializations'], 'https://moon-rocks.github.io/PORTFOLIO/', 'moon-rocks.github.io/PORTFOLIO', '/images/work/campus-book.svg', true)
on conflict (slug) do nothing;

-- NON-DESTRUCTIVE BASELINE SKILLS SEED
insert into public.skills (slug, name, role, category_id, icon_key, accent_color, display_order, published)
values
  ('react', 'React', 'UI Architecture', 'frontend', 'react', '#61DAFB', 1, true),
  ('next-js', 'Next.js', 'Full-Stack SSR', 'frontend', 'nextjs', '#FFFFFF', 2, true),
  ('typescript', 'TypeScript', 'Type System', 'frontend', 'typescript', '#3178C6', 3, true),
  ('javascript', 'JavaScript', 'Core Runtime', 'frontend', 'javascript', '#F7DF1E', 4, true),
  ('html5', 'HTML5', 'Semantic Web', 'frontend', 'html5', '#E34F26', 5, true),
  ('css3', 'CSS3', 'Modern Layout', 'frontend', 'css3', '#1572B6', 6, true),
  ('tailwind-css', 'Tailwind CSS', 'Design Tokens', 'styling-motion', 'tailwindcss', '#06B6D4', 1, true),
  ('gsap', 'GSAP', 'Motion Engine', 'styling-motion', 'gsap', '#28d765', 2, true),
  ('figma', 'Figma', 'Interface Design', 'styling-motion', 'figma', '#F24E1E', 3, true),
  ('node-js', 'Node.js', 'Server Runtime', 'backend-data', 'nodejs', '#5FA04E', 1, true),
  ('express-js', 'Express.js', 'REST API Layer', 'backend-data', 'express', '#E2E8F0', 2, true),
  ('supabase', 'Supabase', 'Cloud Auth & DB', 'backend-data', 'supabase', '#3ECF8E', 3, true),
  ('postgresql', 'PostgreSQL', 'Relational DB', 'backend-data', 'postgresql', '#4169E1', 4, true),
  ('git', 'Git', 'Source Control', 'workflow', 'git', '#F05032', 1, true),
  ('github', 'GitHub', 'Repos & CI/CD', 'workflow', 'github', '#FFFFFF', 2, true)
on conflict (slug) do nothing;

-- NON-DESTRUCTIVE BASELINE EDUCATION / LEARNING JOURNEY SEED (2 PHASES)
insert into public.education (badge_text, title, year_or_duration, institution_or_board, location_or_qualification, score_or_completion, status, description, display_order, published)
select
  'PHASE 01 · 2025 · COMPLETED',
  'PHASE 01 — Academic Foundation (2025)',
  '2025',
  'Bihar School Examination Board (BSEB)',
  'Class 10 · Secondary Education',
  '89.4%',
  'Completed',
  'Completed Class 10 under the Bihar School Examination Board (BSEB) in 2025 with an academic achievement of 89.4%, building a strong foundation in mathematics, science, and core secondary education fundamentals.',
  1,
  true
where not exists (select 1 from public.education where display_order = 1);

insert into public.education (badge_text, title, year_or_duration, institution_or_board, location_or_qualification, score_or_completion, status, description, display_order, published)
select
  'PHASE 02 · 2025–PRESENT · IN PROGRESS',
  'PHASE 02 — Diploma in Computer Science & Engineering (2025–Present)',
  '2025 - 2028',
  'Government Polytechnic Muzaffarpur, Bihar',
  'Diploma in Computer Science & Engineering',
  '2025–Present (Expected 2028)',
  'Current / In Progress',
  'Currently pursuing a Diploma in Computer Science & Engineering at Government Polytechnic Muzaffarpur, Bihar (2025–Present, expected completion 2028). Academic coursework and practical builds focus on computer science education, programming fundamentals in C and Python, web development with React, Next.js, TypeScript, and Tailwind CSS, relational databases with PostgreSQL and Supabase, and real-world software projects including JalSetu, Campus Book, Digital Library, and my interactive portfolio.',
  2,
  true
where not exists (select 1 from public.education where display_order = 2);

-- CONTACT MESSAGES POLICIES
drop policy if exists "Anyone can submit a contact message" on public.contact_messages;
create policy "Anyone can submit a contact message"
  on public.contact_messages for insert
  to anon, authenticated
  with check (
    status = 'unread'
    and char_length(trim(name)) between 2 and 120
    and char_length(trim(email)) between 5 and 180
    and char_length(trim(message)) between 5 and 4000
  );

drop policy if exists "Admin can read contact messages" on public.contact_messages;
create policy "Admin can read contact messages"
  on public.contact_messages for select
  to authenticated
  using (public.is_portfolio_admin());

drop policy if exists "Admin can update contact messages" on public.contact_messages;
create policy "Admin can update contact messages"
  on public.contact_messages for update
  to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

drop policy if exists "Admin can delete contact messages" on public.contact_messages;
create policy "Admin can delete contact messages"
  on public.contact_messages for delete
  to authenticated
  using (public.is_portfolio_admin());

-- STORAGE BUCKET & RLS POLICIES (portfolio-media)
insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do nothing;

drop policy if exists "Public can view portfolio media" on storage.objects;
create policy "Public can view portfolio media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'portfolio-media');

drop policy if exists "Admin can upload portfolio media" on storage.objects;
create policy "Admin can upload portfolio media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio-media' and public.is_portfolio_admin());

drop policy if exists "Admin can update portfolio media" on storage.objects;
create policy "Admin can update portfolio media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio-media' and public.is_portfolio_admin());

drop policy if exists "Admin can delete portfolio media" on storage.objects;
create policy "Admin can delete portfolio media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio-media' and public.is_portfolio_admin());
