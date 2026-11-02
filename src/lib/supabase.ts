import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  AchievementRecord,
  AUTHORIZED_ADMIN_EMAIL,
  CertificateRecord,
  ContactMessageRecord,
  EducationRecord,
  encodeShowcaseRoleAndCategory,
  extractStorageObjectPath,
  INITIAL_ACHIEVEMENTS,
  INITIAL_CERTIFICATES,
  INITIAL_EDUCATION,
  INITIAL_PROJECTS,
  INITIAL_SKILLS,
  isAuthorizedAdminUser,
  normalizeCertificateRecord,
  normalizeEducationRecord,
  normalizeSupabaseUrl,
  ProjectRecord,
  SkillRecord,
} from '../data/portfolioData';

export const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseAnonKey.includes('MY_SUPABASE')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.'
    );
  }
  return supabase;
}

/**
 * Enforces strict administrator authorization before any administrative query or mutation.
 * Rejects unauthenticated callers and any authenticated user not on the admin allowlist.
 */
export async function requireAuthorizedAdmin(): Promise<{
  client: SupabaseClient;
  email: string;
}> {
  const client = requireSupabase();
  const {
    data: { session },
    error,
  } = await client.auth.getSession();

  if (error || !session || !session.user) {
    throw new Error(
      `Unauthorized: Active administrator session required (${AUTHORIZED_ADMIN_EMAIL}).`
    );
  }

  if (!isAuthorizedAdminUser(session.user)) {
    throw new Error(
      `Access denied: Account "${session.user.email || 'unknown'}" is not an authorized administrator. Only ${AUTHORIZED_ADMIN_EMAIL} is authorized.`
    );
  }

  return {
    client,
    email: (session.user.email || AUTHORIZED_ADMIN_EMAIL).toLowerCase(),
  };
}

export interface PortfolioSnapshot {
  projects: ProjectRecord[];
  education: EducationRecord[];
  achievements: AchievementRecord[];
  certificates: CertificateRecord[];
  skills: SkillRecord[];
}

const SKILLS_TABLE_READY_KEY = 'portfolio_skills_table_ready';
const DELETED_PROJECT_SLUGS_KEY = 'portfolio_deleted_project_slugs';

function getDeletedProjectSlugs(): string[] {
  try {
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(DELETED_PROJECT_SLUGS_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    }
  } catch {
    // ignore storage errors
  }
  return [];
}

function markProjectSlugDeleted(slug?: string, deleted = true): void {
  if (!slug) return;
  try {
    if (typeof window !== 'undefined') {
      const current = new Set(getDeletedProjectSlugs());
      if (deleted) {
        current.add(slug);
      } else {
        current.delete(slug);
      }
      window.localStorage.setItem(DELETED_PROJECT_SLUGS_KEY, JSON.stringify([...current]));
    }
  } catch {
    // ignore storage errors
  }
}

function mergeProjectsWithBaseline(
  dbProjects: ProjectRecord[],
  publishedOnly: boolean
): ProjectRecord[] {
  const deletedSlugs = new Set(getDeletedProjectSlugs());
  if (!dbProjects || dbProjects.length === 0) {
    return INITIAL_PROJECTS.filter(
      (p) => !deletedSlugs.has(p.slug) && (!publishedOnly || p.published)
    );
  }
  const existingSlugs = new Set(dbProjects.map((p) => p.slug));
  const merged = [...dbProjects];

  // Ensure all 6 baseline modules from the Projects section (#content) are synchronized
  // even if the remote public.projects table only had a subset of rows seeded previously.
  for (const base of INITIAL_PROJECTS) {
    if (!existingSlugs.has(base.slug) && !deletedSlugs.has(base.slug)) {
      if (!publishedOnly || base.published) {
        merged.push(base);
      }
    }
  }

  return merged.sort((a, b) => (Number(a.display_order) || 1) - (Number(b.display_order) || 1));
}

function isSkillsTableAvailable(): boolean {
  if (!supabase) return false;
  try {
    return (
      typeof window !== 'undefined' &&
      window.localStorage.getItem(SKILLS_TABLE_READY_KEY) === '1'
    );
  } catch {
    return false;
  }
}

function markSkillsTableReady(ready: boolean): void {
  try {
    if (typeof window !== 'undefined') {
      if (ready) {
        window.localStorage.setItem(SKILLS_TABLE_READY_KEY, '1');
      } else {
        window.localStorage.removeItem(SKILLS_TABLE_READY_KEY);
      }
    }
  } catch {
    // ignore storage errors
  }
}

export async function fetchPublicPortfolioSnapshot(): Promise<Partial<PortfolioSnapshot>> {
  if (!supabase) return {};
  const hasSkillsTable = isSkillsTableAvailable();

  const [projectsRes, educationRes, achievementsRes, certificatesRes, skillsRes] =
    await Promise.all([
      supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('display_order', { ascending: true }),
      supabase
        .from('education')
        .select('*')
        .eq('published', true)
        .order('display_order', { ascending: true }),
      supabase
        .from('achievements')
        .select('*')
        .eq('published', true)
        .order('display_order', { ascending: true }),
      supabase
        .from('certificates')
        .select('*')
        .eq('published', true)
        .order('display_order', { ascending: true }),
      hasSkillsTable
        ? supabase
            .from('skills')
            .select('*')
            .eq('published', true)
            .order('display_order', { ascending: true })
        : Promise.resolve({ data: null, error: null }),
    ]);

  const result: Partial<PortfolioSnapshot> = {};
  if (!projectsRes.error && projectsRes.data && projectsRes.data.length > 0) {
    result.projects = mergeProjectsWithBaseline(projectsRes.data as ProjectRecord[], true);
  }
  if (!educationRes.error && educationRes.data && educationRes.data.length > 0) {
    result.education = (educationRes.data as EducationRecord[]).map(normalizeEducationRecord);
  }
  if (!achievementsRes.error && achievementsRes.data && achievementsRes.data.length > 0) {
    result.achievements = achievementsRes.data as AchievementRecord[];
  }
  if (!certificatesRes.error && certificatesRes.data) {
    result.certificates = (certificatesRes.data as CertificateRecord[]).map(
      normalizeCertificateRecord
    );
  }
  if (!skillsRes.error && skillsRes.data && skillsRes.data.length > 0) {
    result.skills = skillsRes.data as SkillRecord[];
  }
  return result;
}

export async function fetchAdminAllRecords() {
  const { client } = await requireAuthorizedAdmin();

  const [projectsRes, educationRes, achievementsRes, certificatesRes, skillsRes, messagesRes] =
    await Promise.all([
      client.from('projects').select('*').order('display_order', { ascending: true }),
      client.from('education').select('*').order('display_order', { ascending: true }),
      client.from('achievements').select('*').order('display_order', { ascending: true }),
      client.from('certificates').select('*').order('display_order', { ascending: true }),
      client.from('skills').select('*').order('display_order', { ascending: true }),
      client.from('contact_messages').select('*').order('created_at', { ascending: false }),
    ]);

  if (!skillsRes.error && skillsRes.data) {
    markSkillsTableReady(true);
  }

  const firstError =
    projectsRes.error ||
    educationRes.error ||
    achievementsRes.error ||
    certificatesRes.error ||
    messagesRes.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const rawEducation = (educationRes.data || []) as EducationRecord[];
  const normalizedEducation =
    rawEducation.length > 0
      ? rawEducation.map(normalizeEducationRecord)
      : INITIAL_EDUCATION;

  return {
    projects: mergeProjectsWithBaseline((projectsRes.data || []) as ProjectRecord[], false),
    education: normalizedEducation,
    achievements: (achievementsRes.data || []) as AchievementRecord[],
    certificates: ((certificatesRes.data || []) as CertificateRecord[]).map(
      normalizeCertificateRecord
    ),
    skills: (!skillsRes.error && skillsRes.data ? skillsRes.data : INITIAL_SKILLS) as SkillRecord[],
    messages: (messagesRes.data || []) as ContactMessageRecord[],
  };
}

// --- PROJECTS CRUD ---
export async function upsertProject(
  payload: Omit<ProjectRecord, 'id'> & { id?: string }
): Promise<ProjectRecord> {
  const { client } = await requireAuthorizedAdmin();
  const row: Record<string, unknown> = {
    slug: payload.slug.trim(),
    display_order: Number(payload.display_order) || 1,
    is_featured: Boolean(payload.is_featured),
    title: payload.title.trim(),
    category: payload.category.trim(),
    summary: payload.summary.trim(),
    key_tech: payload.key_tech,
    live_url: payload.live_url.trim(),
    browser_label: payload.browser_label.trim(),
    image_url: payload.image_url.trim(),
    published: Boolean(payload.published),
  };
  if (payload.id && !payload.id.startsWith('proj-')) {
    row.id = payload.id;
  }
  const { data, error } = await client
    .from('projects')
    .upsert(row, { onConflict: 'slug' })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  markProjectSlugDeleted(payload.slug.trim(), false);
  return data as ProjectRecord;
}

export async function setProjectPublished(
  project: ProjectRecord,
  published: boolean
): Promise<ProjectRecord> {
  const { client } = await requireAuthorizedAdmin();
  if (project.id && !project.id.startsWith('proj-')) {
    const { data, error } = await client
      .from('projects')
      .update({ published: Boolean(published), updated_at: new Date().toISOString() })
      .eq('id', project.id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as ProjectRecord;
  }
  return upsertProject({ ...project, published: Boolean(published) });
}

export async function deleteProject(
  id: string,
  imageUrl?: string,
  slug?: string
): Promise<void> {
  const { client } = await requireAuthorizedAdmin();
  if (imageUrl) {
    const objectPath = extractStorageObjectPath(imageUrl, 'portfolio-media');
    if (objectPath) {
      await client.storage.from('portfolio-media').remove([objectPath]);
    }
  }
  markProjectSlugDeleted(slug, true);
  if (!id.startsWith('proj-')) {
    const { error } = await client.from('projects').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}

// --- EDUCATION CRUD ---
export async function saveEducation(
  payload: Omit<EducationRecord, 'id'> & { id?: string }
): Promise<EducationRecord> {
  const { client } = await requireAuthorizedAdmin();
  const baseRow: Record<string, unknown> = {
    badge_text: payload.badge_text,
    title: payload.title,
    year_or_duration: payload.year_or_duration,
    institution_or_board: payload.institution_or_board,
    location_or_qualification: payload.location_or_qualification,
    score_or_completion: payload.score_or_completion,
    status: payload.status,
    display_order: Number(payload.display_order) || 1,
    published: Boolean(payload.published),
  };
  const rowWithDesc: Record<string, unknown> = {
    ...baseRow,
    description: (payload.description || '').trim(),
  };

  if (payload.id && !payload.id.startsWith('edu-')) {
    const { data, error } = await client
      .from('education')
      .update(rowWithDesc)
      .eq('id', payload.id)
      .select('*')
      .single();
    if (error) {
      if (error.message.includes('description')) {
        const retry = await client
          .from('education')
          .update(baseRow)
          .eq('id', payload.id)
          .select('*')
          .single();
        if (retry.error) throw new Error(retry.error.message);
        return normalizeEducationRecord(retry.data as EducationRecord);
      }
      throw new Error(error.message);
    }
    return normalizeEducationRecord(data as EducationRecord);
  }

  const { data, error } = await client.from('education').insert(rowWithDesc).select('*').single();
  if (error) {
    if (error.message.includes('description')) {
      const retry = await client.from('education').insert(baseRow).select('*').single();
      if (retry.error) throw new Error(retry.error.message);
      return normalizeEducationRecord(retry.data as EducationRecord);
    }
    throw new Error(error.message);
  }
  return normalizeEducationRecord(data as EducationRecord);
}

export async function deleteEducation(id: string): Promise<void> {
  const { client } = await requireAuthorizedAdmin();
  if (!id.startsWith('edu-')) {
    const { error } = await client.from('education').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}

// --- ACHIEVEMENTS CRUD ---
export async function saveAchievement(
  payload: Omit<AchievementRecord, 'id'> & { id?: string }
): Promise<AchievementRecord> {
  const { client } = await requireAuthorizedAdmin();
  const row: Record<string, unknown> = {
    metric_value: payload.metric_value,
    metric_suffix: payload.metric_suffix,
    label: payload.label,
    description: payload.description,
    category: payload.category,
    display_order: Number(payload.display_order) || 1,
    published: Boolean(payload.published),
  };
  if (payload.id && !payload.id.startsWith('ach-')) {
    const { data, error } = await client
      .from('achievements')
      .update(row)
      .eq('id', payload.id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as AchievementRecord;
  }
  const { data, error } = await client.from('achievements').insert(row).select('*').single();
  if (error) throw new Error(error.message);
  return data as AchievementRecord;
}

export async function deleteAchievement(id: string): Promise<void> {
  const { client } = await requireAuthorizedAdmin();
  const { error } = await client.from('achievements').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// --- CERTIFICATES, ACHIEVEMENTS & MEMORIES SHOWCASE CRUD ---
export async function upsertCertificate(
  payload: Omit<CertificateRecord, 'id'> & { id?: string }
): Promise<CertificateRecord> {
  const { client } = await requireAuthorizedAdmin();
  const row: Record<string, unknown> = {
    slug: payload.slug,
    title: payload.title.trim(),
    issuer: payload.issuer.trim(),
    role_or_domain: payload.role_or_domain.trim(),
    subtitle_or_skills: payload.subtitle_or_skills.trim(),
    category: payload.category,
    credential_url: (payload.credential_url || '').trim(),
    image_url: payload.image_url.trim(),
    issue_date: (payload.issue_date || '2025').trim(),
    display_order: Number(payload.display_order) || 1,
    published: Boolean(payload.published),
  };
  if (payload.id && !payload.id.startsWith('cert-')) {
    row.id = payload.id;
  }

  const { data, error } = await client
    .from('certificates')
    .upsert(row, { onConflict: 'slug' })
    .select('*')
    .single();

  if (error) {
    // Fallback if the database still has the older certificates_category_check constraint
    if (error.message.includes('certificates_category_check')) {
      const encoded = encodeShowcaseRoleAndCategory(payload.category, payload.role_or_domain);
      const fallbackRow: Record<string, unknown> = {
        ...row,
        category: encoded.dbCategory,
        role_or_domain: encoded.dbRoleOrDomain,
      };
      const retry = await client
        .from('certificates')
        .upsert(fallbackRow, { onConflict: 'slug' })
        .select('*')
        .single();
      if (retry.error) throw new Error(retry.error.message);
      return normalizeCertificateRecord(retry.data as CertificateRecord);
    }
    throw new Error(error.message);
  }

  return normalizeCertificateRecord(data as CertificateRecord);
}

export async function setCertificatePublished(
  id: string,
  published: boolean
): Promise<CertificateRecord> {
  const { client } = await requireAuthorizedAdmin();
  const { data, error } = await client
    .from('certificates')
    .update({ published: Boolean(published), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return normalizeCertificateRecord(data as CertificateRecord);
}

export async function deleteCertificate(id: string, imageUrl?: string): Promise<void> {
  const { client } = await requireAuthorizedAdmin();
  if (imageUrl) {
    const objectPath = extractStorageObjectPath(imageUrl, 'portfolio-media');
    if (objectPath) {
      await client.storage.from('portfolio-media').remove([objectPath]);
    }
  }
  const { error } = await client.from('certificates').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// --- SKILLS / TECH STACK CRUD ---
export async function upsertSkill(
  payload: Omit<SkillRecord, 'id'> & { id?: string }
): Promise<SkillRecord> {
  const { client } = await requireAuthorizedAdmin();
  const row: Record<string, unknown> = {
    slug: payload.slug,
    name: payload.name,
    role: payload.role,
    category_id: payload.category_id,
    icon_key: payload.icon_key,
    accent_color: payload.accent_color || '#ff8c59',
    display_order: Number(payload.display_order) || 1,
    published: Boolean(payload.published),
  };
  if (payload.id && !payload.id.startsWith('skill-')) {
    row.id = payload.id;
  }
  const { data, error } = await client
    .from('skills')
    .upsert(row, { onConflict: 'slug' })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  markSkillsTableReady(true);
  return data as SkillRecord;
}

export async function deleteSkill(id: string): Promise<void> {
  const { client } = await requireAuthorizedAdmin();
  const { error } = await client.from('skills').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// --- CONTACT MESSAGES CRUD ---
export async function submitContactMessage(input: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from('contact_messages').insert({
    name: input.name.trim(),
    email: input.email.trim(),
    subject: (input.subject || 'Project / Collaboration Inquiry').trim(),
    message: input.message.trim(),
    status: 'unread',
  });
  if (error) throw new Error(error.message);
}

export async function updateContactMessageStatus(
  id: string,
  status: 'unread' | 'read' | 'archived'
): Promise<ContactMessageRecord> {
  const { client } = await requireAuthorizedAdmin();
  const { data, error } = await client
    .from('contact_messages')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as ContactMessageRecord;
}

export async function deleteContactMessage(id: string): Promise<void> {
  const { client } = await requireAuthorizedAdmin();
  const { error } = await client.from('contact_messages').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// --- STORAGE UPLOAD ---
export async function uploadPortfolioMedia(file: File, folder = 'projects'): Promise<string> {
  const { client } = await requireAuthorizedAdmin();
  const ext = file.name.split('.').pop() || 'png';
  const safeName = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-');
  const filePath = `${folder}/${Date.now()}-${safeName}.${ext}`;

  const { error } = await client.storage.from('portfolio-media').upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) throw new Error(error.message);

  const { data } = client.storage.from('portfolio-media').getPublicUrl(filePath);
  return data.publicUrl;
}

// --- SEED INITIAL PORTFOLIO RECORDS INTO SUPABASE ---
export async function seedInitialPortfolioData(): Promise<void> {
  const { client } = await requireAuthorizedAdmin();

  for (const p of INITIAL_PROJECTS) {
    const { id: _id, ...rest } = p;
    const { error } = await client.from('projects').upsert(rest, { onConflict: 'slug' });
    if (error) throw new Error(`Projects seed failed: ${error.message}`);
    markProjectSlugDeleted(p.slug, false);
  }

  for (const c of INITIAL_CERTIFICATES) {
    const { id: _id, ...rest } = c;
    const { error } = await client.from('certificates').upsert(rest, { onConflict: 'slug' });
    if (error) throw new Error(`Certificates seed failed: ${error.message}`);
  }

  let skillsSeeded = true;
  for (const s of INITIAL_SKILLS) {
    const { id: _id, ...rest } = s;
    const { error } = await client.from('skills').upsert(rest, { onConflict: 'slug' });
    if (error) {
      skillsSeeded = false;
      if (!error.message.includes('public.skills')) {
        throw new Error(`Skills seed failed: ${error.message}`);
      }
      break;
    }
  }
  if (skillsSeeded) {
    markSkillsTableReady(true);
  }

  const { data: existingEdu } = await client
    .from('education')
    .select('id, display_order')
    .order('display_order', { ascending: true });

  for (const e of INITIAL_EDUCATION) {
    const { id: _id, ...rest } = e;
    const match = (existingEdu || []).find((row) => Number(row.display_order) === e.display_order);
    if (match?.id) {
      await saveEducation({ id: String(match.id), ...rest });
    } else {
      await saveEducation(rest);
    }
  }

  const { data: existingAch } = await client.from('achievements').select('id').limit(1);
  if (!existingAch || existingAch.length === 0) {
    for (const a of INITIAL_ACHIEVEMENTS) {
      const { id: _id, ...rest } = a;
      const { error } = await client.from('achievements').insert(rest);
      if (error) throw new Error(`Achievements seed failed: ${error.message}`);
    }
  }
}
