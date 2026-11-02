import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  Check,
  Copy,
  Cpu,
  Database,
  Edit3,
  Eye,
  EyeOff,
  ExternalLink,
  FolderGit2,
  GraduationCap,
  Inbox,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  AchievementRecord,
  AUTHORIZED_ADMIN_EMAIL,
  CertificateCategory,
  CertificateRecord,
  ContactMessageRecord,
  EducationRecord,
  formatProjectCategory,
  INITIAL_EDUCATION,
  isAuthorizedAdminEmail,
  isAuthorizedAdminUser,
  isProofStripCtaRecord,
  normalizeProjectSlug,
  parseProjectMetadata,
  ProjectRecord,
  PROOF_STRIP_CTA_CATEGORY,
  SHOWCASE_CATEGORIES,
  SHOWCASE_FILTERS,
  ShowcaseFilter,
  SkillCategoryId,
  SkillRecord,
  TechIconKey,
  validateShowcaseInput,
  VIDEO_FILTERS,
  VideoFilter,
} from '../data/portfolioData';
import {
  deleteAchievement,
  deleteCertificate,
  deleteContactMessage,
  deleteEducation,
  deleteProject,
  deleteSkill,
  fetchAdminAllRecords,
  isSupabaseConfigured,
  saveAchievement,
  saveEducation,
  seedInitialPortfolioData,
  setCertificatePublished,
  setProjectPublished,
  supabase,
  updateContactMessageStatus,
  uploadPortfolioMedia,
  upsertCertificate,
  upsertProject,
  upsertSkill,
} from '../lib/supabase';
import { TechBrandIcon } from './TechBrandIcon';
import schemaSqlRaw from '../../supabase/schema.sql?raw';

type AdminTab =
  | 'projects'
  | 'education'
  | 'skills'
  | 'achievements'
  | 'certificates'
  | 'messages'
  | 'rls';

const SKILL_ICON_OPTIONS: readonly TechIconKey[] = [
  'react',
  'nextjs',
  'typescript',
  'javascript',
  'html5',
  'css3',
  'tailwindcss',
  'gsap',
  'figma',
  'nodejs',
  'express',
  'supabase',
  'postgresql',
  'git',
  'github',
  'c',
  'python',
  'fastapi',
  'code',
];

const SKILL_CATEGORY_OPTIONS: ReadonlyArray<{ id: SkillCategoryId; label: string }> = [
  { id: 'frontend', label: '01 / Frontend & Core Languages' },
  { id: 'styling-motion', label: '02 / Styling, Motion & Interface Design' },
  { id: 'backend-data', label: '03 / Backend, Database & Cloud' },
  { id: 'workflow', label: '04 / Version Control & Workflow' },
];

export function AdminDashboard() {
  const { refreshPortfolio } = usePortfolio();

  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(isSupabaseConfigured);
  const [email, setEmail] = useState(AUTHORIZED_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [magicLinkNotice, setMagicLinkNotice] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('projects');
  const [dataLoading, setDataLoading] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [education, setEducation] = useState<EducationRecord[]>(INITIAL_EDUCATION);
  const [skills, setSkills] = useState<SkillRecord[]>([]);
  const [achievements, setAchievements] = useState<AchievementRecord[]>([]);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [messages, setMessages] = useState<ContactMessageRecord[]>([]);
  const [copiedSql, setCopiedSql] = useState(false);

  // Project Form State (synchronized with section#content MediaShowcase & /work)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectModuleFilter, setProjectModuleFilter] = useState<VideoFilter>('All modules');
  const [projectForm, setProjectForm] = useState<{
    slug: string;
    display_order: number;
    filter_category: 'Web & Cloud' | 'CS & AI Labs';
    channel: string;
    role: string;
    title: string;
    summary: string;
    key_tech_input: string;
    live_url: string;
    browser_label: string;
    image_url: string;
    published: boolean;
  }>({
    slug: '',
    display_order: 1,
    filter_category: 'Web & Cloud',
    channel: 'Chandresh Kumar',
    role: 'Creative Web Development & CMS',
    title: '',
    summary: '',
    key_tech_input: '',
    live_url: '',
    browser_label: '',
    image_url: '/images/work/cinematic-portfolio.svg',
    published: true,
  });

  // Education Form State
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [eduForm, setEduForm] = useState({
    badge_text: 'PHASE 02 · 2025–PRESENT · IN PROGRESS',
    title: '',
    year_or_duration: '',
    institution_or_board: '',
    location_or_qualification: '',
    score_or_completion: '',
    status: 'Current / In Progress',
    description: '',
    display_order: 1,
    published: true,
  });

  // Skill Form State
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [skillForm, setSkillForm] = useState<{
    slug: string;
    name: string;
    role: string;
    category_id: SkillCategoryId;
    icon_key: TechIconKey;
    accent_color: string;
    display_order: number;
    published: boolean;
  }>({
    slug: '',
    name: '',
    role: '',
    category_id: 'frontend',
    icon_key: 'react',
    accent_color: '#ff8c59',
    display_order: 1,
    published: true,
  });

  // Achievement Form State
  const [editingAchId, setEditingAchId] = useState<string | null>(null);
  const [achForm, setAchForm] = useState({
    metric_value: '',
    metric_suffix: '+',
    label: '',
    description: '',
    category: 'Deployments',
    display_order: 1,
    published: true,
  });

  // Career Highlights Strip CTA Link Block Form State
  const [ctaForm, setCtaForm] = useState({
    line1: '',
    line2: '',
    href: '#impact',
    published: true,
  });

  // Certificate / Showcase Form State
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [certCategoryFilter, setCertCategoryFilter] = useState<ShowcaseFilter>('All');
  const [certForm, setCertForm] = useState<{
    slug: string;
    title: string;
    issuer: string;
    role_or_domain: string;
    subtitle_or_skills: string;
    category: CertificateCategory;
    credential_url: string;
    image_url: string;
    issue_date: string;
    display_order: number;
    published: boolean;
  }>({
    slug: '',
    title: '',
    issuer: '',
    role_or_domain: '',
    subtitle_or_skills: '',
    category: 'Certificates',
    credential_url: '',
    image_url: '',
    issue_date: '2025',
    display_order: 1,
    published: true,
  });

  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const loadAllAdminData = useCallback(async () => {
    if (!supabase) return;
    setDataLoading(true);
    try {
      const records = await fetchAdminAllRecords();
      setProjects(records.projects);
      setEducation(records.education);
      setSkills(records.skills);
      setAchievements(records.achievements);
      const existingCta = records.achievements.find((a) => isProofStripCtaRecord(a));
      if (existingCta) {
        setCtaForm({
          line1: existingCta.label,
          line2: existingCta.description || '',
          href: existingCta.metric_value || '#impact',
          published: existingCta.published,
        });
      } else {
        setCtaForm({
          line1: '',
          line2: '',
          href: '#impact',
          published: true,
        });
      }
      setCertificates(records.certificates);
      setMessages(records.messages);
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text:
          err instanceof Error
            ? `Database query error: ${err.message}. Ensure /supabase/schema.sql has been executed in your Supabase SQL Editor.`
            : 'Unable to load records from Supabase.',
      });
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session && isAuthorizedAdminUser(session.user)) {
      loadAllAdminData();
    }
  }, [session, loadAllAdminData]);

  const handlePasswordSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setMagicLinkNotice(null);
    const candidateEmail = email.trim().toLowerCase();
    if (!isAuthorizedAdminEmail(candidateEmail)) {
      setAuthError(
        `Access denied: Only authorized administrator (${AUTHORIZED_ADMIN_EMAIL}) is permitted to access this console.`
      );
      return;
    }
    if (!supabase) {
      setAuthError(
        'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in your environment secrets to authenticate with Supabase.'
      );
      return;
    }
    setAuthSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: candidateEmail,
        password,
      });
      if (error) throw error;
      if (data.user && !isAuthorizedAdminUser(data.user)) {
        await supabase.auth.signOut();
        throw new Error(
          `Access denied: Account "${data.user.email || candidateEmail}" is not an authorized administrator.`
        );
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleMagicLinkSignIn = async () => {
    setAuthError(null);
    setMagicLinkNotice(null);
    const candidateEmail = email.trim().toLowerCase();
    if (!isAuthorizedAdminEmail(candidateEmail)) {
      setAuthError(
        `Access denied: Magic links can only be issued to the authorized administrator (${AUTHORIZED_ADMIN_EMAIL}).`
      );
      return;
    }
    if (!supabase) {
      setAuthError(
        'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in your environment secrets to authenticate with Supabase.'
      );
      return;
    }
    setAuthSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: candidateEmail,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/45861563/admin`,
        },
      });
      if (error) throw error;
      setMagicLinkNotice(
        `One-time sign-in link sent to ${AUTHORIZED_ADMIN_EMAIL}. Check your inbox to complete administrator authentication.`
      );
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Failed to send magic link.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleGitHubOAuth = async () => {
    setAuthError(null);
    setMagicLinkNotice(null);
    if (!supabase) {
      setAuthError(
        'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in your environment secrets to use GitHub OAuth.'
      );
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/45861563/admin`,
      },
    });
    if (error) {
      setAuthError(error.message);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(schemaSqlRaw);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleSeedDatabase = async () => {
    setDataLoading(true);
    setStatusBanner(null);
    try {
      await seedInitialPortfolioData();
      await loadAllAdminData();
      await refreshPortfolio();
      setStatusBanner({
        type: 'success',
        text: 'Portfolio baseline records synced to Supabase tables and published to the live site.',
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Database sync failed.',
      });
    } finally {
      setDataLoading(false);
    }
  };

  // --- PROJECT HANDLERS ---
  const resetProjectForm = () => {
    setEditingProjectId(null);
    setProjectForm({
      slug: '',
      display_order: projects.length + 1,
      filter_category: 'Web & Cloud',
      channel: 'Chandresh Kumar',
      role: 'Creative Web Development & CMS',
      title: '',
      summary: '',
      key_tech_input: '',
      live_url: '',
      browser_label: '',
      image_url: '/images/work/cinematic-portfolio.svg',
      published: true,
    });
  };

  const handleProjectSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);
    const slug = normalizeProjectSlug(projectForm.slug || projectForm.title);
    if (!slug) {
      setStatusBanner({ type: 'error', text: 'Project title or slug is required.' });
      return;
    }
    const cleanLiveUrl = projectForm.live_url.trim();
    const autoBrowserLabel =
      projectForm.browser_label.trim() ||
      cleanLiveUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '') ||
      slug;
    const keyTechList = projectForm.key_tech_input
      .split(/[,·]/)
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await upsertProject({
        id: editingProjectId || undefined,
        slug,
        display_order: Number(projectForm.display_order) || 1,
        is_featured: projectForm.filter_category === 'Web & Cloud',
        title: projectForm.title.trim(),
        category: formatProjectCategory(
          projectForm.filter_category,
          projectForm.channel,
          projectForm.role
        ),
        summary: projectForm.summary.trim(),
        key_tech: keyTechList,
        live_url: cleanLiveUrl,
        browser_label: autoBrowserLabel,
        image_url: projectForm.image_url.trim() || '/images/work/cinematic-portfolio.svg',
        published: projectForm.published,
      });
      resetProjectForm();
      await loadAllAdminData();
      await refreshPortfolio();
      setStatusBanner({
        type: 'success',
        text: 'Project module saved to Supabase and synchronized with /#content and /work.',
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save project.',
      });
    }
  };

  const handleToggleProjectPublish = async (proj: ProjectRecord) => {
    setStatusBanner(null);
    try {
      const nextPublished = !proj.published;
      await setProjectPublished(proj, nextPublished);
      await loadAllAdminData();
      await refreshPortfolio();
      setStatusBanner({
        type: 'success',
        text: nextPublished
          ? `"${proj.title}" published to /#content and /work.`
          : `"${proj.title}" unpublished and hidden from public portfolio.`,
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update project visibility.',
      });
    }
  };

  const handleProjectImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    setStatusBanner(null);
    try {
      const publicUrl = await uploadPortfolioMedia(file, 'projects');
      setProjectForm((prev) => ({ ...prev, image_url: publicUrl }));
      setStatusBanner({
        type: 'success',
        text: 'Image uploaded to Supabase Storage (portfolio-media).',
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Image upload failed.',
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  // --- EDUCATION HANDLERS ---
  const resetEduForm = () => {
    setEditingEduId(null);
    setEduForm({
      badge_text: 'PHASE 02 · 2025–PRESENT · IN PROGRESS',
      title: '',
      year_or_duration: '',
      institution_or_board: '',
      location_or_qualification: '',
      score_or_completion: '',
      status: 'Current / In Progress',
      description: '',
      display_order: education.length + 1,
      published: true,
    });
  };

  const handleEduSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);
    try {
      await saveEducation({
        id: editingEduId || undefined,
        ...eduForm,
      });
      resetEduForm();
      await loadAllAdminData();
      await refreshPortfolio();
      setStatusBanner({
        type: 'success',
        text: 'Education record saved to Supabase and reflected on the live portfolio.',
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save education record.',
      });
    }
  };

  // --- SKILLS / TECH STACK HANDLERS ---
  const resetSkillForm = () => {
    setEditingSkillId(null);
    setSkillForm({
      slug: '',
      name: '',
      role: '',
      category_id: 'frontend',
      icon_key: 'react',
      accent_color: '#ff8c59',
      display_order: skills.length + 1,
      published: true,
    });
  };

  const handleSkillSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);
    const slug = normalizeProjectSlug(skillForm.slug || skillForm.name);
    if (!slug) {
      setStatusBanner({ type: 'error', text: 'Skill name or slug is required.' });
      return;
    }
    try {
      await upsertSkill({
        id: editingSkillId || undefined,
        ...skillForm,
        name: skillForm.name.trim(),
        role: skillForm.role.trim(),
        slug,
      });
      resetSkillForm();
      await loadAllAdminData();
      await refreshPortfolio();
      setStatusBanner({
        type: 'success',
        text: 'Skill saved to Supabase and synchronized with the live Tech Stack section.',
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save skill.',
      });
    }
  };

  // --- ACHIEVEMENTS HANDLERS ---
  const resetAchForm = () => {
    setEditingAchId(null);
    setAchForm({
      metric_value: '',
      metric_suffix: '+',
      label: '',
      description: '',
      category: 'Deployments',
      display_order: achievements.length + 1,
      published: true,
    });
  };

  const handleAchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);
    try {
      await saveAchievement({
        id: editingAchId || undefined,
        ...achForm,
      });
      resetAchForm();
      await loadAllAdminData();
      await refreshPortfolio();
      setStatusBanner({
        type: 'success',
        text: 'Achievement metric saved to Supabase and reflected on the live portfolio.',
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save achievement.',
      });
    }
  };

  const handleCtaSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);
    const trimmedLine1 = ctaForm.line1.trim();
    if (!trimmedLine1) {
      setStatusBanner({
        type: 'error',
        text: 'Line 1 text is required to publish the Career Highlights CTA block.',
      });
      return;
    }
    try {
      const existingCta = achievements.find((a) => isProofStripCtaRecord(a));
      await saveAchievement({
        id: existingCta?.id,
        metric_value: ctaForm.href.trim() || '#impact',
        metric_suffix: '',
        label: trimmedLine1,
        description: ctaForm.line2.trim(),
        category: PROOF_STRIP_CTA_CATEGORY,
        display_order: 4,
        published: ctaForm.published,
      });
      await loadAllAdminData();
      await refreshPortfolio();
      setStatusBanner({
        type: 'success',
        text: ctaForm.published
          ? 'Career Highlights CTA block published to Supabase and displayed on the live portfolio.'
          : 'Career Highlights CTA block saved as draft (hidden on live portfolio).',
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save Career Highlights CTA block.',
      });
    }
  };

  // --- CERTIFICATES, ACHIEVEMENTS & MEMORIES SHOWCASE HANDLERS ---
  const resetCertForm = () => {
    setEditingCertId(null);
    setCertForm({
      slug: '',
      title: '',
      issuer: '',
      role_or_domain: '',
      subtitle_or_skills: '',
      category: 'Certificates',
      credential_url: '',
      image_url: '',
      issue_date: '2025',
      display_order: certificates.length + 1,
      published: true,
    });
  };

  const handleCertSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);
    const validation = validateShowcaseInput({
      title: certForm.title,
      category: certForm.category,
      issuer: certForm.issuer,
      image_url: certForm.image_url,
    });
    if (!validation.valid) {
      setStatusBanner({
        type: 'error',
        text: validation.error || 'Please check showcase item fields.',
      });
      return;
    }
    const slug = normalizeProjectSlug(certForm.slug || `${certForm.category}-${certForm.title}`);
    if (!slug) {
      setStatusBanner({ type: 'error', text: 'Title or slug is required.' });
      return;
    }
    try {
      await upsertCertificate({
        id: editingCertId || undefined,
        ...certForm,
        slug,
      });
      resetCertForm();
      await loadAllAdminData();
      await refreshPortfolio();
      setStatusBanner({
        type: 'success',
        text: certForm.published
          ? 'Item saved to PostgreSQL and published live in the Achievements, Certificates & Memories showcase.'
          : 'Item saved as draft (unpublished) in PostgreSQL.',
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save showcase item.',
      });
    }
  };

  const handleToggleCertPublished = async (cert: CertificateRecord) => {
    setStatusBanner(null);
    try {
      const nextPublished = !cert.published;
      await setCertificatePublished(cert.id, nextPublished);
      await loadAllAdminData();
      await refreshPortfolio();
      setStatusBanner({
        type: 'success',
        text: nextPublished
          ? `"${cert.title}" is now published on the live portfolio showcase.`
          : `"${cert.title}" has been unpublished and hidden from the live portfolio.`,
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to toggle publish status.',
      });
    }
  };

  const handleCertImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    setStatusBanner(null);
    try {
      const publicUrl = await uploadPortfolioMedia(file, 'certificates');
      setCertForm((prev) => ({ ...prev, image_url: publicUrl }));
      setStatusBanner({
        type: 'success',
        text: 'Image uploaded to Supabase Storage (portfolio-media/certificates).',
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Image upload failed.',
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  const filteredMessages = messages.filter((m) =>
    messageFilter === 'all' ? true : m.status === messageFilter
  );

  // --- RENDER UNAUTHENTICATED / CONFIGURATION VIEW ---
  if (!session) {
    return (
      <main id="main" className="editorial-page">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <a className="text-link" href="/">
            <ArrowLeft size={16} /> Back to live portfolio
          </a>
          <span className="eyebrow flex items-center gap-2 text-[#ff8c59]">
            <Lock size={13} /> SECURE ROUTE · /45861563/ADMIN
          </span>
        </div>

        <div className="editorial-intro">
          <span className="eyebrow">SUPABASE AUTHENTICATION &amp; CMS CONTROL PLANE</span>
          <h1>Admin Console.</h1>
          <p>
            Authenticate with your Supabase administrator account to manage projects, education,
            skills, achievements, certificates, and contact inquiries.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:mt-12 sm:gap-10 lg:grid-cols-12">
          <div className="border border-[#2a2521] bg-[#0b0a09] p-5 sm:p-8 lg:col-span-5">
            <div className="mb-6 flex items-center justify-between border-b border-[#24201d] pb-4">
              <span className="eyebrow text-[#ff8c59]">ADMINISTRATOR SIGN IN</span>
              <ShieldCheck size={18} className="text-[#ff8c59]" />
            </div>

            {!isSupabaseConfigured && (
              <div className="mb-5 border border-[#ff8c59]/40 bg-[#ff8c59]/10 p-3.5 text-xs text-[#f4efe9]">
                <strong className="mb-1 block uppercase tracking-wider text-[#ff8c59]">
                  Environment Secrets Notice
                </strong>
                Configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in
                your environment and run the SQL schema on the right in your Supabase SQL Editor.
              </div>
            )}

            {authLoading ? (
              <p className="py-8 text-sm text-[#bdb5aa]">Verifying Supabase session...</p>
            ) : (
              <div className="space-y-6">
                <form onSubmit={handlePasswordSignIn} className="space-y-4">
                  <div>
                    <label className="eyebrow mb-1.5 block text-[10px] text-[#b8b0a8]">
                      ADMIN EMAIL
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="chandreshme01@gmail.com"
                      className="w-full border border-[#2c2723] bg-[#050505] px-3.5 py-2.5 text-sm text-[#f4efe9] outline-none focus:border-[#ff8c59]"
                    />
                  </div>
                  <div>
                    <label className="eyebrow mb-1.5 block text-[10px] text-[#b8b0a8]">
                      PASSWORD
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full border border-[#2c2723] bg-[#050505] px-3.5 py-2.5 text-sm text-[#f4efe9] outline-none focus:border-[#ff8c59]"
                    />
                  </div>
                  {authError && (
                    <p
                      role="alert"
                      className="border border-[#ff5a36]/40 bg-[#ff5a36]/10 px-3 py-2 text-xs text-[#ff9d85]"
                    >
                      {authError}
                    </p>
                  )}
                  {magicLinkNotice && (
                    <p
                      role="status"
                      className="border border-[#ff8c59]/40 bg-[#ff8c59]/10 px-3 py-2 text-xs text-[#f4efe9]"
                    >
                      {magicLinkNotice}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={authSubmitting}
                    className="pill-link w-full cursor-pointer justify-center disabled:opacity-50"
                  >
                    <span>
                      {authSubmitting ? 'Authenticating with Supabase...' : 'Sign in with Email'}
                    </span>
                    <ArrowUpRight size={16} />
                  </button>
                </form>

                <div className="grid grid-cols-1 gap-2.5 border-t border-[#221e1b] pt-4 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={authSubmitting}
                    onClick={handleMagicLinkSignIn}
                    className="text-link flex cursor-pointer items-center justify-center gap-1.5 border border-[#2c2723] px-3 py-2.5 text-xs hover:border-[#ff8c59]"
                  >
                    <span>Send Magic Link</span>
                    <ArrowUpRight size={13} />
                  </button>
                  <button
                    type="button"
                    disabled={authSubmitting}
                    onClick={handleGitHubOAuth}
                    className="text-link flex cursor-pointer items-center justify-center gap-1.5 border border-[#2c2723] px-3 py-2.5 text-xs hover:border-[#ff8c59]"
                  >
                    <span>GitHub OAuth</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 lg:col-span-7">
            <div className="border border-[#2a2521] bg-[#0b0a09] p-6 sm:p-8">
              <div className="mb-4 flex items-center justify-between border-b border-[#24201d] pb-3">
                <span className="eyebrow text-[#ff8c59]">
                  SYNCHRONIZED PORTFOLIO ENTITIES &amp; LIVE SECTION MAP
                </span>
                <Database size={16} className="text-[#ff8c59]" />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a
                  href="/#content"
                  className="flex items-center justify-between gap-2 border border-[#221e1b] bg-[#050505] px-4 py-3 text-xs text-[#f4efe9] transition hover:border-[#ff8c59]"
                >
                  <span>01 · Projects (public.projects)</span>
                  <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] text-[#ff8c59]">
                    /#content <ArrowUpRight size={12} />
                  </span>
                </a>
                <a
                  href="/#work"
                  className="flex items-center justify-between gap-2 border border-[#221e1b] bg-[#050505] px-4 py-3 text-xs text-[#f4efe9] transition hover:border-[#ff8c59]"
                >
                  <span>02 · Skills &amp; Stack (public.skills)</span>
                  <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] text-[#ff8c59]">
                    /#work <ArrowUpRight size={12} />
                  </span>
                </a>
                <a
                  href="/#journey"
                  className="flex items-center justify-between gap-2 border border-[#221e1b] bg-[#050505] px-4 py-3 text-xs text-[#f4efe9] transition hover:border-[#ff8c59]"
                >
                  <span>03 · Education (public.education)</span>
                  <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] text-[#ff8c59]">
                    /#journey <ArrowUpRight size={12} />
                  </span>
                </a>
                <a
                  href="/#impact"
                  className="flex items-center justify-between gap-2 border border-[#221e1b] bg-[#050505] px-4 py-3 text-xs text-[#f4efe9] transition hover:border-[#ff8c59]"
                >
                  <span>04 · Achievements (public.achievements)</span>
                  <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] text-[#ff8c59]">
                    /#impact <ArrowUpRight size={12} />
                  </span>
                </a>
                <a
                  href="/#services"
                  className="flex items-center justify-between gap-2 border border-[#221e1b] bg-[#050505] px-4 py-3 text-xs text-[#f4efe9] transition hover:border-[#ff8c59]"
                >
                  <span>05 · Certificates &amp; Memories (public.certificates)</span>
                  <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] text-[#ff8c59]">
                    /#services <ArrowUpRight size={12} />
                  </span>
                </a>
                <a
                  href="/#contact"
                  className="flex items-center justify-between gap-2 border border-[#221e1b] bg-[#050505] px-4 py-3 text-xs text-[#f4efe9] transition hover:border-[#ff8c59]"
                >
                  <span>06 · Contact Inbox (public.contact_messages)</span>
                  <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] text-[#ff8c59]">
                    /#contact <ArrowUpRight size={12} />
                  </span>
                </a>
              </div>
            </div>

            <div className="border border-[#2a2521] bg-[#0b0a09] p-6 sm:p-8">
              <div className="mb-4 flex items-center justify-between border-b border-[#24201d] pb-3">
                <div>
                  <span className="eyebrow text-[#ff8c59]">SUPABASE SQL SCHEMA &amp; RLS</span>
                  <h2 className="mt-1 text-lg text-white">
                    6 Synchronized Tables + Storage Bucket (portfolio-media)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="text-link flex cursor-pointer items-center gap-1.5 border border-[#2c2723] px-3 py-1.5 text-xs hover:border-[#ff8c59]"
                >
                  {copiedSql ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedSql ? 'Copied SQL' : 'Copy SQL'}</span>
                </button>
              </div>
              <pre className="max-h-[250px] overflow-auto border border-[#221e1b] bg-[#050505] p-3.5 font-mono text-[11px] leading-relaxed text-[#d2c6ba]">
                {schemaSqlRaw}
              </pre>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --- RENDER 403 UNAUTHORIZED ACCOUNT VIEW IF SIGNED IN AS NON-ADMIN ---
  if (!isAuthorizedAdminUser(session.user)) {
    return (
      <main id="main" className="editorial-page">
        <div className="mb-8 flex items-center justify-between">
          <a className="text-link" href="/">
            <ArrowLeft size={16} /> Back to live portfolio
          </a>
          <span className="eyebrow flex items-center gap-2 text-[#ff5a36]">
            <Lock size={13} /> 403 FORBIDDEN · /45861563/ADMIN
          </span>
        </div>

        <div className="border border-[#ff5a36]/50 bg-[#0b0a09] p-8 sm:p-12">
          <span className="eyebrow text-[#ff5a36]">UNAUTHORIZED ACCOUNT DETECTED</span>
          <h1 className="mt-2 text-3xl text-white sm:text-4xl">
            Administrator Access Restricted.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#bdb5aa]">
            You are currently signed in as{' '}
            <strong className="text-white">{session.user.email || 'an unverified user'}</strong>,
            which is not authorized to access the portfolio control plane or perform database
            mutations. Administrative privileges are strictly restricted to{' '}
            <strong className="text-[#ff8c59]">{AUTHORIZED_ADMIN_EMAIL}</strong>.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={handleSignOut}
              className="pill-link cursor-pointer"
            >
              <LogOut size={15} />
              <span>Sign Out &amp; Switch to {AUTHORIZED_ADMIN_EMAIL}</span>
            </button>
            <a
              href="/"
              className="text-link flex items-center gap-2 border border-[#2c2723] px-5 py-2.5 text-xs"
            >
              <span>Return to Public Portfolio</span>
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </main>
    );
  }

  // --- RENDER AUTHENTICATED ADMIN DASHBOARD ---
  return (
    <main id="main" className="editorial-page">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#26221e] pb-6">
        <div>
          <span className="eyebrow text-[#ff8c59]">
            AUTHENTICATED ADMIN · {session.user.email}
          </span>
          <h1 className="mt-2 text-4xl sm:text-5xl">Portfolio Control Plane.</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSeedDatabase}
            disabled={dataLoading}
            className="pill-link cursor-pointer text-xs disabled:opacity-50"
          >
            <Database size={14} />
            <span>Sync Baseline Data to Supabase</span>
          </button>
          <button
            type="button"
            onClick={loadAllAdminData}
            disabled={dataLoading}
            className="text-link flex cursor-pointer items-center gap-1.5 border border-[#2c2723] px-3.5 py-2 text-xs"
          >
            <RefreshCw size={13} className={dataLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <a
            href="/"
            className="text-link flex items-center gap-1.5 border border-[#2c2723] px-3.5 py-2 text-xs"
          >
            <span>Live Site</span>
            <ArrowUpRight size={13} />
          </a>
          <button
            type="button"
            onClick={handleSignOut}
            className="text-link flex cursor-pointer items-center gap-1.5 border border-[#ff5a36]/40 px-3.5 py-2 text-xs text-[#ff9d85]"
          >
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {statusBanner && (
        <div
          className={`mb-8 flex items-center justify-between border px-4 py-3 text-xs ${
            statusBanner.type === 'success'
              ? 'border-[#ff8c59]/50 bg-[#ff8c59]/10 text-[#f4efe9]'
              : 'border-[#ff5a36]/60 bg-[#ff5a36]/15 text-[#ff9d85]'
          }`}
        >
          <span>{statusBanner.text}</span>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="cursor-pointer pl-4 font-mono"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-10 flex flex-wrap gap-2 border-b border-[#24201d] pb-4">
        {(
          [
            ['projects', `Projects (${projects.length})`, FolderGit2],
            ['education', `Education (${education.length})`, GraduationCap],
            ['skills', `Skills & Stack (${skills.length})`, Cpu],
            ['achievements', `Achievements (${achievements.length})`, Sparkles],
            ['certificates', `Certificates & Memories (${certificates.length})`, Award],
            [
              'messages',
              `Contact Inbox (${messages.filter((m) => m.status === 'unread').length} unread)`,
              Inbox,
            ],
            ['rls', 'RLS & SQL Schema', ShieldCheck],
          ] as const
        ).map(([tabKey, label, Icon]) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setActiveTab(tabKey)}
            className={`flex cursor-pointer items-center gap-2 border px-4 py-2.5 text-xs transition ${
              activeTab === tabKey
                ? 'border-[#ff8c59] bg-[#ff8c59]/15 text-white'
                : 'border-[#26221e] bg-[#0b0a09] text-[#b8b0a8] hover:border-[#4a423b]'
            }`}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: PROJECTS CRUD (SYNCHRONIZED WITH SECTION#CONTENT & /WORK) */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <form
            onSubmit={handleProjectSubmit}
            className="space-y-4 border border-[#2a2521] bg-[#0b0a09] p-6 lg:col-span-5"
          >
            <div className="flex items-center justify-between border-b border-[#24201d] pb-3">
              <div>
                <span className="eyebrow text-[#ff8c59]">
                  {editingProjectId
                    ? 'EDIT PROJECT MODULE (PUBLIC.PROJECTS)'
                    : 'ADD PROJECT MODULE (SECTION #CONTENT)'}
                </span>
                <p className="mt-1 text-xs text-[#9e958b]">
                  Powers the Works &amp; Academic Labs showcase (/#content) and case studies (/work).
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="/#content"
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-[#ff8c59] hover:underline"
                >
                  <span>View /#content</span>
                  <ArrowUpRight size={12} />
                </a>
                {editingProjectId && (
                  <button
                    type="button"
                    onClick={resetProjectForm}
                    className="cursor-pointer text-xs text-[#9e958b] hover:text-white"
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="eyebrow mb-1 block text-[10px]">PROJECT / MODULE TITLE</label>
                <input
                  type="text"
                  required
                  value={projectForm.title}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, title: e.target.value })
                  }
                  placeholder="Cinematic Interactive Portfolio"
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="eyebrow mb-1 block text-[10px]">ORDER</label>
                <input
                  type="number"
                  required
                  value={projectForm.display_order}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, display_order: Number(e.target.value) })
                  }
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="eyebrow mb-1 block text-[10px]">FILTER TAB CATEGORY</label>
                <select
                  value={projectForm.filter_category}
                  onChange={(e) =>
                    setProjectForm({
                      ...projectForm,
                      filter_category: e.target.value as 'Web & Cloud' | 'CS & AI Labs',
                    })
                  }
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                >
                  <option value="Web & Cloud">Web &amp; Cloud</option>
                  <option value="CS & AI Labs">CS &amp; AI Labs</option>
                </select>
              </div>
              <div>
                <label className="eyebrow mb-1 block text-[10px]">SLUG (ROUTE ID)</label>
                <input
                  type="text"
                  value={projectForm.slug}
                  onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })}
                  placeholder="cinematic-portfolio"
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="eyebrow mb-1 block text-[10px]">
                  AUTHOR / PLATFORM (CHANNEL)
                </label>
                <input
                  type="text"
                  required
                  value={projectForm.channel}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, channel: e.target.value })
                  }
                  placeholder="Chandresh Kumar"
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="eyebrow mb-1 block text-[10px]">ROLE / ENGINEERING DOMAIN</label>
                <input
                  type="text"
                  required
                  value={projectForm.role}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, role: e.target.value })
                  }
                  placeholder="Creative Web Development & CMS"
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="eyebrow mb-1 block text-[10px]">
                SUBTITLE / KEY TECHNOLOGIES (COMMA OR · SEPARATED)
              </label>
              <input
                type="text"
                required
                value={projectForm.key_tech_input}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, key_tech_input: e.target.value })
                }
                placeholder="Next.js, React, TypeScript, Tailwind CSS, Supabase"
                className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="eyebrow mb-1 block text-[10px]">
                CASE STUDY DESCRIPTION / SUMMARY
              </label>
              <textarea
                rows={3}
                required
                value={projectForm.summary}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, summary: e.target.value })
                }
                placeholder="Full-stack portfolio website and content management system..."
                className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="eyebrow mb-1 block text-[10px]">LIVE / GITHUB URL</label>
                <input
                  type="text"
                  required
                  value={projectForm.live_url}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, live_url: e.target.value })
                  }
                  placeholder="https://github.com/moon-rocks/..."
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="eyebrow mb-1 block text-[10px]">BROWSER BAR LABEL</label>
                <input
                  type="text"
                  value={projectForm.browser_label}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, browser_label: e.target.value })
                  }
                  placeholder="github.com/moon-rocks/Jal_setu"
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="eyebrow mb-1 block text-[10px]">
                THUMBNAIL IMAGE URL OR SUPABASE STORAGE UPLOAD
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={projectForm.image_url}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, image_url: e.target.value })
                  }
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
                <label className="flex cursor-pointer items-center gap-1.5 border border-[#2c2723] bg-[#141210] px-3 py-2 text-xs text-[#f4efe9] hover:border-[#ff8c59]">
                  <Upload size={13} />
                  <span>{uploadingMedia ? '...' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProjectImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {projectForm.image_url.trim().length > 0 && (
                <div className="mt-3 overflow-hidden border border-[#26221e] bg-[#050505]">
                  <div className="flex items-center justify-between border-b border-[#1d1916] px-3 py-1.5 text-[10px] font-mono text-[#9e958b]">
                    <span>PROJECT MODULE PREVIEW</span>
                    <span>{projectForm.filter_category.toUpperCase()}</span>
                  </div>
                  <img
                    src={projectForm.image_url}
                    alt={projectForm.title || 'Project preview'}
                    className="h-36 w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 text-xs text-[#d2c6ba]">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={projectForm.published}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, published: e.target.checked })
                  }
                />
                <span>Published on live portfolio (/#content &amp; /work)</span>
              </label>
            </div>

            <button type="submit" className="pill-link w-full cursor-pointer justify-center">
              <Plus size={15} />
              <span>
                {editingProjectId ? 'Update Project Module' : 'Save Project Module to Supabase'}
              </span>
            </button>
          </form>

          <div className="space-y-4 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border border-[#26221e] bg-[#0b0a09] p-4">
              <div className="flex flex-wrap gap-2">
                {VIDEO_FILTERS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setProjectModuleFilter(cat)}
                    className={`cursor-pointer border px-3 py-1.5 text-xs transition ${
                      projectModuleFilter === cat
                        ? 'border-[#ff8c59] bg-[#ff8c59]/15 text-white'
                        : 'border-[#26221e] text-[#9e958b] hover:border-[#4a423b]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <span className="font-mono text-[11px] text-[#9e958b]">
                {projects.filter((p) => p.published).length} PUBLISHED / {projects.length} TOTAL
              </span>
            </div>

            {projects.filter((proj) => {
              if (projectModuleFilter === 'All modules') return true;
              return parseProjectMetadata(proj).filterCategory === projectModuleFilter;
            }).length === 0 ? (
              <div className="border border-[#2a2521] bg-[#0b0a09] p-8 text-sm text-[#bdb5aa]">
                No project modules match filter <strong>{projectModuleFilter}</strong>. Click{' '}
                <strong>“Sync Baseline Data to Supabase”</strong> above or create a project module
                on the left.
              </div>
            ) : (
              projects
                .filter((proj) => {
                  if (projectModuleFilter === 'All modules') return true;
                  return parseProjectMetadata(proj).filterCategory === projectModuleFilter;
                })
                .map((proj) => {
                  const meta = parseProjectMetadata(proj);
                  return (
                    <article
                      key={proj.id}
                      className="flex flex-col justify-between gap-4 border border-[#26221e] bg-[#0b0a09] p-5 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-start gap-4">
                        {proj.image_url && (
                          <img
                            src={proj.image_url}
                            alt={proj.title}
                            className="h-20 w-28 shrink-0 border border-[#26221e] bg-[#050505] object-cover"
                          />
                        )}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="eyebrow text-[#ff8c59]">
                              0{proj.display_order} · {meta.filterCategory.toUpperCase()}
                            </span>
                            <span className="border border-[#2b2621] bg-[#12100e] px-2 py-0.5 font-mono text-[10px] text-[#d2c6ba]">
                              {meta.channel} / {meta.role}
                            </span>
                            <span
                              className={`border px-1.5 py-0.5 text-[10px] ${
                                proj.published
                                  ? 'border-[#3ECF8E]/40 bg-[#3ECF8E]/10 text-[#3ECF8E]'
                                  : 'border-[#ff5a36]/50 bg-[#ff5a36]/10 text-[#ff9d85]'
                              }`}
                            >
                              {proj.published ? 'PUBLISHED' : 'DRAFT / HIDDEN'}
                            </span>
                          </div>
                          <h3 className="text-xl text-white">{proj.title}</h3>
                          <p className="font-mono text-[11px] text-[#ff8c59]/90">{meta.subtitle}</p>
                          <p className="text-xs text-[#bdb5aa]">{proj.summary}</p>
                          <div className="flex flex-wrap items-center gap-4 pt-1">
                            <a
                              href={`/work/${proj.slug}`}
                              className="inline-flex items-center gap-1 font-mono text-[11px] text-[#d2c6ba] hover:text-[#ff8c59]"
                            >
                              <span>Case Study (/work/{proj.slug})</span>
                              <ArrowUpRight size={11} />
                            </a>
                            {proj.live_url && (
                              <a
                                href={proj.live_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-mono text-[11px] text-[#ff8c59] hover:underline"
                              >
                                <span>Live / Repo URL</span>
                                <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleProjectPublish(proj)}
                          className={`flex cursor-pointer items-center gap-1 border px-3 py-1.5 text-xs transition ${
                            proj.published
                              ? 'border-[#2c2723] text-[#d2c6ba] hover:border-[#ff8c59]'
                              : 'border-[#ff8c59]/60 bg-[#ff8c59]/10 text-[#ff8c59]'
                          }`}
                        >
                          {proj.published ? <EyeOff size={13} /> : <Eye size={13} />}
                          <span>{proj.published ? 'Unpublish' : 'Publish'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProjectId(proj.id);
                            setProjectForm({
                              slug: proj.slug,
                              display_order: proj.display_order,
                              filter_category: meta.filterCategory,
                              channel: meta.channel,
                              role: meta.role,
                              title: proj.title,
                              summary: proj.summary,
                              key_tech_input: (proj.key_tech || []).join(', '),
                              live_url: proj.live_url,
                              browser_label: proj.browser_label,
                              image_url: proj.image_url,
                              published: proj.published,
                            });
                          }}
                          className="flex cursor-pointer items-center gap-1 border border-[#2c2723] px-3 py-1.5 text-xs text-[#f4efe9] hover:border-[#ff8c59]"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await deleteProject(proj.id, proj.image_url, proj.slug);
                              await loadAllAdminData();
                              await refreshPortfolio();
                              setStatusBanner({
                                type: 'success',
                                text: `"${proj.title}" deleted from Projects.`,
                              });
                            } catch (err) {
                              setStatusBanner({
                                type: 'error',
                                text: err instanceof Error ? err.message : 'Delete failed.',
                              });
                            }
                          }}
                          className="flex cursor-pointer items-center gap-1 border border-[#ff5a36]/40 px-3 py-1.5 text-xs text-[#ff9d85]"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </article>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EDUCATION / LEARNING JOURNEY CRUD */}
      {activeTab === 'education' && (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <form
            onSubmit={handleEduSubmit}
            className="space-y-4 border border-[#2a2521] bg-[#0b0a09] p-6 lg:col-span-5"
          >
            <div className="flex items-center justify-between border-b border-[#24201d] pb-3">
              <span className="eyebrow text-[#ff8c59]">
                {editingEduId ? 'EDIT LEARNING JOURNEY PHASE' : 'ADD LEARNING JOURNEY PHASE'}
              </span>
              {editingEduId && (
                <button
                  type="button"
                  onClick={resetEduForm}
                  className="cursor-pointer text-xs text-[#9e958b] hover:text-white"
                >
                  Cancel edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="eyebrow mb-1 block text-[10px]">TIMELINE BADGE</label>
                <input
                  type="text"
                  required
                  value={eduForm.badge_text}
                  onChange={(e) => setEduForm({ ...eduForm, badge_text: e.target.value })}
                  placeholder="PHASE 01 · 2025 · COMPLETED"
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="eyebrow mb-1 block text-[10px]">PHASE ORDER</label>
                <input
                  type="number"
                  required
                  value={eduForm.display_order}
                  onChange={(e) =>
                    setEduForm({ ...eduForm, display_order: Number(e.target.value) })
                  }
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="eyebrow mb-1 block text-[10px]">PHASE HEADING</label>
              <input
                type="text"
                required
                value={eduForm.title}
                onChange={(e) => setEduForm({ ...eduForm, title: e.target.value })}
                placeholder="PHASE 01 — Academic Foundation (2025)"
                className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="eyebrow mb-1 block text-[10px]">YEAR OR DURATION</label>
                <input
                  type="text"
                  required
                  value={eduForm.year_or_duration}
                  onChange={(e) =>
                    setEduForm({ ...eduForm, year_or_duration: e.target.value })
                  }
                  placeholder="2025–Present"
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="eyebrow mb-1 block text-[10px]">BOARD OR INSTITUTION</label>
                <input
                  type="text"
                  required
                  value={eduForm.institution_or_board}
                  onChange={(e) =>
                    setEduForm({ ...eduForm, institution_or_board: e.target.value })
                  }
                  placeholder="Government Polytechnic Muzaffarpur, Bihar"
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="eyebrow mb-1 block text-[10px]">
                  QUALIFICATION OR FOCUS
                </label>
                <input
                  type="text"
                  required
                  value={eduForm.location_or_qualification}
                  onChange={(e) =>
                    setEduForm({ ...eduForm, location_or_qualification: e.target.value })
                  }
                  placeholder="Class 10 (Secondary Education) / Diploma in CSE"
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="eyebrow mb-1 block text-[10px]">
                  ACHIEVEMENT OR COHORT
                </label>
                <input
                  type="text"
                  required
                  value={eduForm.score_or_completion}
                  onChange={(e) =>
                    setEduForm({ ...eduForm, score_or_completion: e.target.value })
                  }
                  placeholder="89.4% Academic Achievement / 2025–2028 Cohort"
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="eyebrow mb-1 block text-[10px]">
                PHASE DESCRIPTION (SEPARATE PARAGRAPHS WITH BLANK LINE)
              </label>
              <textarea
                rows={4}
                value={eduForm.description}
                onChange={(e) => setEduForm({ ...eduForm, description: e.target.value })}
                placeholder="Write a concise, factual summary of this learning phase..."
                className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm leading-relaxed text-white"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="eyebrow mb-1 block text-[10px]">STATUS</label>
                <input
                  type="text"
                  required
                  value={eduForm.status}
                  onChange={(e) => setEduForm({ ...eduForm, status: e.target.value })}
                  placeholder="Completed / Current / In Progress"
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-[#d2c6ba]">
                  <input
                    type="checkbox"
                    checked={eduForm.published}
                    onChange={(e) =>
                      setEduForm({ ...eduForm, published: e.target.checked })
                    }
                  />
                  <span>Published on live timeline</span>
                </label>
              </div>
            </div>

            <button type="submit" className="pill-link w-full cursor-pointer justify-center">
              <Plus size={15} />
              <span>{editingEduId ? 'Update Phase' : 'Save Phase to Supabase'}</span>
            </button>
          </form>

          <div className="space-y-4 lg:col-span-7">
            {education.map((edu) => (
              <article
                key={edu.id}
                className="flex flex-col justify-between gap-4 border border-[#26221e] bg-[#0b0a09] p-5 sm:flex-row sm:items-start"
              >
                <div className="space-y-2">
                  <span className="eyebrow text-[#ff8c59]">{edu.badge_text}</span>
                  <h3 className="text-xl text-white">{edu.title}</h3>
                  <p className="text-xs text-[#bdb5aa]">
                    {edu.institution_or_board} · {edu.location_or_qualification} ·{' '}
                    {edu.year_or_duration} · {edu.score_or_completion} ({edu.status})
                  </p>
                  {edu.description && (
                    <p className="pt-1 text-xs leading-relaxed text-[#9e958b]">
                      {edu.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEduId(edu.id);
                      setEduForm({
                        badge_text: edu.badge_text,
                        title: edu.title,
                        year_or_duration: edu.year_or_duration,
                        institution_or_board: edu.institution_or_board,
                        location_or_qualification: edu.location_or_qualification,
                        score_or_completion: edu.score_or_completion,
                        status: edu.status,
                        description: edu.description || '',
                        display_order: edu.display_order,
                        published: edu.published,
                      });
                    }}
                    className="flex cursor-pointer items-center gap-1 border border-[#2c2723] px-3 py-1.5 text-xs text-[#f4efe9] hover:border-[#ff8c59]"
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await deleteEducation(edu.id);
                        await loadAllAdminData();
                        await refreshPortfolio();
                      } catch (err) {
                        setStatusBanner({
                          type: 'error',
                          text: err instanceof Error ? err.message : 'Delete failed.',
                        });
                      }
                    }}
                    className="flex cursor-pointer items-center gap-1 border border-[#ff5a36]/40 px-3 py-1.5 text-xs text-[#ff9d85]"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2B: SKILLS & TECH STACK CRUD */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <form
            onSubmit={handleSkillSubmit}
            className="space-y-4 border border-[#2a2521] bg-[#0b0a09] p-6 lg:col-span-5"
          >
            <div className="flex items-center justify-between border-b border-[#24201d] pb-3">
              <span className="eyebrow text-[#ff8c59]">
                {editingSkillId ? 'EDIT SKILL / STACK ITEM' : 'ADD SKILL / STACK ITEM'}
              </span>
              {editingSkillId ? (
                <button
                  type="button"
                  onClick={resetSkillForm}
                  className="cursor-pointer text-xs text-[#9e958b] hover:text-white"
                >
                  Cancel edit
                </button>
              ) : (
                <a
                  href="/#work"
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-[#ff8c59] hover:underline"
                >
                  View /#work <ArrowUpRight size={12} />
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="eyebrow mb-1 block text-[10px]">TECHNOLOGY NAME</label>
                <input
                  type="text"
                  required
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  placeholder="React / FastAPI / Python"
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="eyebrow mb-1 block text-[10px]">ORDER</label>
                <input
                  type="number"
                  required
                  value={skillForm.display_order}
                  onChange={(e) =>
                    setSkillForm({ ...skillForm, display_order: Number(e.target.value) })
                  }
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="eyebrow mb-1 block text-[10px]">ROLE / SUBTITLE</label>
                <input
                  type="text"
                  required
                  value={skillForm.role}
                  onChange={(e) => setSkillForm({ ...skillForm, role: e.target.value })}
                  placeholder="UI Architecture"
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="eyebrow mb-1 block text-[10px]">SLUG</label>
                <input
                  type="text"
                  value={skillForm.slug}
                  onChange={(e) => setSkillForm({ ...skillForm, slug: e.target.value })}
                  placeholder="react"
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="eyebrow mb-1 block text-[10px]">STACK CATEGORY</label>
                <select
                  value={skillForm.category_id}
                  onChange={(e) =>
                    setSkillForm({
                      ...skillForm,
                      category_id: e.target.value as SkillCategoryId,
                    })
                  }
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                >
                  {SKILL_CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="eyebrow mb-1 block text-[10px]">BRAND ICON KEY</label>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#2c2723] bg-[#111111]">
                    <TechBrandIcon iconKey={skillForm.icon_key} className="h-5 w-5" />
                  </span>
                  <select
                    value={skillForm.icon_key}
                    onChange={(e) =>
                      setSkillForm({
                        ...skillForm,
                        icon_key: e.target.value as TechIconKey,
                      })
                    }
                    className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                  >
                    {SKILL_ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs text-[#d2c6ba]">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={skillForm.published}
                  onChange={(e) =>
                    setSkillForm({ ...skillForm, published: e.target.checked })
                  }
                />
                <span>Published in live Verified Technical Stack</span>
              </label>
            </div>

            <button type="submit" className="pill-link w-full cursor-pointer justify-center">
              <Plus size={15} />
              <span>{editingSkillId ? 'Update Skill' : 'Save Skill to Supabase'}</span>
            </button>
          </form>

          <div className="space-y-4 lg:col-span-7">
            {skills.map((skill) => (
              <article
                key={skill.id}
                className="flex flex-col justify-between gap-4 border border-[#26221e] bg-[#0b0a09] p-5 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] border border-[#1f1f1f] bg-[#111111]">
                    <TechBrandIcon iconKey={skill.icon_key} className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="eyebrow text-[#ff8c59]">
                        {skill.category_id.toUpperCase()} · ORDER 0{skill.display_order}
                      </span>
                      {!skill.published && (
                        <span className="border border-[#ff5a36]/50 px-1.5 py-0.5 text-[10px] text-[#ff9d85]">
                          HIDDEN
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg text-white">{skill.name}</h3>
                    <p className="text-xs text-[#bdb5aa]">{skill.role}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSkillId(skill.id);
                      setSkillForm({
                        slug: skill.slug,
                        name: skill.name,
                        role: skill.role,
                        category_id: skill.category_id,
                        icon_key: skill.icon_key,
                        accent_color: skill.accent_color || '#ff8c59',
                        display_order: skill.display_order,
                        published: skill.published,
                      });
                    }}
                    className="flex cursor-pointer items-center gap-1 border border-[#2c2723] px-3 py-1.5 text-xs text-[#f4efe9] hover:border-[#ff8c59]"
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await deleteSkill(skill.id);
                        await loadAllAdminData();
                        await refreshPortfolio();
                      } catch (err) {
                        setStatusBanner({
                          type: 'error',
                          text: err instanceof Error ? err.message : 'Delete failed.',
                        });
                      }
                    }}
                    className="flex cursor-pointer items-center gap-1 border border-[#ff5a36]/40 px-3 py-1.5 text-xs text-[#ff9d85]"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ACHIEVEMENTS CRUD */}
      {activeTab === 'achievements' && (
        <div className="space-y-10">
          {/* CAREER HIGHLIGHTS STRIP — CTA LINK BLOCK (section.proof-strip > a) */}
          {(() => {
            const existingCta = achievements.find((a) => isProofStripCtaRecord(a));
            const isCtaLive = Boolean(
              existingCta && existingCta.published && existingCta.label.trim().length > 0
            );
            return (
              <div className="border border-[#2a2521] bg-[#0b0a09] p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#24201d] pb-3">
                  <div>
                    <span className="eyebrow text-[#ff8c59]">
                      CAREER HIGHLIGHTS STRIP — CTA LINK BLOCK
                    </span>
                    <p className="mt-1 text-xs text-[#9e958b]">
                      Hidden by default when no published record exists in Supabase. Appears
                      automatically in the Career Highlights strip after publishing valid content.
                    </p>
                  </div>
                  <span
                    className={`border px-2.5 py-1 font-mono text-[10px] ${
                      isCtaLive
                        ? 'border-[#ff8c59]/60 bg-[#ff8c59]/10 text-[#ff8c59]'
                        : 'border-[#3a332d] bg-[#141210] text-[#9e958b]'
                    }`}
                  >
                    {isCtaLive ? 'LIVE ON PORTFOLIO' : 'HIDDEN BY DEFAULT'}
                  </span>
                </div>

                <form
                  onSubmit={handleCtaSubmit}
                  className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end"
                >
                  <div className="lg:col-span-4">
                    <label className="eyebrow mb-1 block text-[10px]">
                      LINE 1 TEXT (REQUIRED)
                    </label>
                    <input
                      type="text"
                      required
                      value={ctaForm.line1}
                      onChange={(e) => setCtaForm({ ...ctaForm, line1: e.target.value })}
                      placeholder="Enter primary callout line"
                      className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div className="lg:col-span-4">
                    <label className="eyebrow mb-1 block text-[10px]">
                      LINE 2 TEXT (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      value={ctaForm.line2}
                      onChange={(e) => setCtaForm({ ...ctaForm, line2: e.target.value })}
                      placeholder="Enter optional second line"
                      className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="eyebrow mb-1 block text-[10px]">DESTINATION LINK</label>
                    <input
                      type="text"
                      required
                      value={ctaForm.href}
                      onChange={(e) => setCtaForm({ ...ctaForm, href: e.target.value })}
                      placeholder="#impact"
                      className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div className="flex items-center gap-3 lg:col-span-2">
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-[#d2c6ba]">
                      <input
                        type="checkbox"
                        checked={ctaForm.published}
                        onChange={(e) =>
                          setCtaForm({ ...ctaForm, published: e.target.checked })
                        }
                      />
                      <span>Published</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-1 lg:col-span-12">
                    <button type="submit" className="pill-link cursor-pointer">
                      <Check size={15} />
                      <span>
                        {existingCta ? 'Update CTA Block in Supabase' : 'Publish CTA Block'}
                      </span>
                    </button>
                    {existingCta && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await deleteAchievement(existingCta.id);
                            await loadAllAdminData();
                            await refreshPortfolio();
                            setStatusBanner({
                              type: 'success',
                              text: 'Career Highlights CTA block removed from Supabase and hidden on the portfolio.',
                            });
                          } catch (err) {
                            setStatusBanner({
                              type: 'error',
                              text: err instanceof Error ? err.message : 'Failed to remove CTA block.',
                            });
                          }
                        }}
                        className="flex cursor-pointer items-center gap-1.5 border border-[#ff5a36]/40 px-4 py-2.5 text-xs text-[#ff9d85]"
                      >
                        <Trash2 size={14} />
                        <span>Remove &amp; Hide CTA Block</span>
                      </button>
                    )}
                  </div>
                </form>
              </div>
            );
          })()}

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <form
              onSubmit={handleAchSubmit}
              className="space-y-4 border border-[#2a2521] bg-[#0b0a09] p-6 lg:col-span-5"
            >
              <div className="flex items-center justify-between border-b border-[#24201d] pb-3">
                <span className="eyebrow text-[#ff8c59]">
                  {editingAchId ? 'EDIT ACHIEVEMENT METRIC' : 'ADD ACHIEVEMENT METRIC'}
                </span>
                {editingAchId && (
                  <button
                    type="button"
                    onClick={resetAchForm}
                    className="cursor-pointer text-xs text-[#9e958b] hover:text-white"
                  >
                    Cancel edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="eyebrow mb-1 block text-[10px]">VALUE</label>
                  <input
                    type="text"
                    required
                    value={achForm.metric_value}
                    onChange={(e) => setAchForm({ ...achForm, metric_value: e.target.value })}
                    placeholder="3"
                    className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="eyebrow mb-1 block text-[10px]">SUFFIX</label>
                  <input
                    type="text"
                    value={achForm.metric_suffix}
                    onChange={(e) => setAchForm({ ...achForm, metric_suffix: e.target.value })}
                    placeholder="+"
                    className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="eyebrow mb-1 block text-[10px]">ORDER</label>
                  <input
                    type="number"
                    required
                    value={achForm.display_order}
                    onChange={(e) =>
                      setAchForm({ ...achForm, display_order: Number(e.target.value) })
                    }
                    className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="eyebrow mb-1 block text-[10px]">METRIC LABEL</label>
                <input
                  type="text"
                  required
                  value={achForm.label}
                  onChange={(e) => setAchForm({ ...achForm, label: e.target.value })}
                  placeholder="Core Web Applications Deployed across Vercel, Render & GitHub Pages"
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="eyebrow mb-1 block text-[10px]">EXTENDED CONTEXT</label>
                <textarea
                  rows={3}
                  value={achForm.description}
                  onChange={(e) => setAchForm({ ...achForm, description: e.target.value })}
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-[#d2c6ba]">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={achForm.published}
                    onChange={(e) =>
                      setAchForm({ ...achForm, published: e.target.checked })
                    }
                  />
                  <span>Published on live portfolio</span>
                </label>
              </div>

              <button type="submit" className="pill-link w-full cursor-pointer justify-center">
                <Plus size={15} />
                <span>
                  {editingAchId ? 'Update Achievement' : 'Save Achievement to Supabase'}
                </span>
              </button>
            </form>

            <div className="space-y-4 lg:col-span-7">
              {achievements
                .filter((ach) => !isProofStripCtaRecord(ach))
                .map((ach) => (
                  <article
                    key={ach.id}
                    className="flex flex-col justify-between gap-4 border border-[#26221e] bg-[#0b0a09] p-5 sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-3xl text-white">
                          {ach.metric_value}
                          <span className="text-[#ff8c59]">{ach.metric_suffix}</span>
                        </strong>
                        {!ach.published && (
                          <span className="border border-[#ff5a36]/50 px-1.5 py-0.5 text-[10px] text-[#ff9d85]">
                            HIDDEN
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 text-base text-[#f4efe9]">{ach.label}</h3>
                      <p className="mt-1 text-xs text-[#9e958b]">{ach.description}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAchId(ach.id);
                          setAchForm({
                            metric_value: ach.metric_value,
                            metric_suffix: ach.metric_suffix,
                            label: ach.label,
                            description: ach.description,
                            category: ach.category,
                            display_order: ach.display_order,
                            published: ach.published,
                          });
                        }}
                        className="flex cursor-pointer items-center gap-1 border border-[#2c2723] px-3 py-1.5 text-xs text-[#f4efe9] hover:border-[#ff8c59]"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await deleteAchievement(ach.id);
                            await loadAllAdminData();
                            await refreshPortfolio();
                          } catch (err) {
                            setStatusBanner({
                              type: 'error',
                              text: err instanceof Error ? err.message : 'Delete failed.',
                            });
                          }
                        }}
                        className="flex cursor-pointer items-center gap-1 border border-[#ff5a36]/40 px-3 py-1.5 text-xs text-[#ff9d85]"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CERTIFICATES, ACHIEVEMENTS & MEMORIES SHOWCASE CRUD */}
      {activeTab === 'certificates' && (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <form
            onSubmit={handleCertSubmit}
            className="space-y-4 border border-[#2a2521] bg-[#0b0a09] p-6 lg:col-span-5"
          >
            <div className="flex items-center justify-between border-b border-[#24201d] pb-3">
              <div>
                <span className="eyebrow text-[#ff8c59]">
                  {editingCertId
                    ? 'EDIT SHOWCASE RECORD'
                    : 'ADD CERTIFICATE / ACHIEVEMENT / MEMORY'}
                </span>
                <p className="mt-1 text-[11px] text-[#9e958b]">
                  Syncs with Supabase Storage (<code>portfolio-media</code>) &amp; PostgreSQL (
                  <code>public.certificates</code>).
                </p>
              </div>
              {editingCertId ? (
                <button
                  type="button"
                  onClick={resetCertForm}
                  className="cursor-pointer text-xs text-[#9e958b] hover:text-white"
                >
                  Cancel edit
                </button>
              ) : (
                <a
                  href="/#services"
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-[#ff8c59] hover:underline"
                >
                  View /#services <ArrowUpRight size={12} />
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="eyebrow mb-1 block text-[10px]">TITLE</label>
                <input
                  type="text"
                  required
                  value={certForm.title}
                  onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                  placeholder="e.g., Smart India Hackathon / Python Certification"
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="eyebrow mb-1 block text-[10px]">ORDER</label>
                <input
                  type="number"
                  required
                  value={certForm.display_order}
                  onChange={(e) =>
                    setCertForm({ ...certForm, display_order: Number(e.target.value) })
                  }
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="eyebrow mb-1 block text-[10px]">SHOWCASE CATEGORY</label>
                <select
                  value={certForm.category}
                  onChange={(e) =>
                    setCertForm({
                      ...certForm,
                      category: e.target.value as CertificateCategory,
                    })
                  }
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                >
                  {SHOWCASE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="eyebrow mb-1 block text-[10px]">DATE / YEAR</label>
                <input
                  type="text"
                  required
                  value={certForm.issue_date}
                  onChange={(e) => setCertForm({ ...certForm, issue_date: e.target.value })}
                  placeholder="2025 / Mar 2026"
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="eyebrow mb-1 block text-[10px]">
                  ISSUER / EVENT / INSTITUTION
                </label>
                <input
                  type="text"
                  required
                  value={certForm.issuer}
                  onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                  placeholder="GP Muzaffarpur / NPTEL / Hackathon"
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="eyebrow mb-1 block text-[10px]">
                  ROLE / MILESTONE HIGHLIGHT
                </label>
                <input
                  type="text"
                  required
                  value={certForm.role_or_domain}
                  onChange={(e) => setCertForm({ ...certForm, role_or_domain: e.target.value })}
                  placeholder="Verified Credential / Finalist / Milestone"
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="eyebrow mb-1 block text-[10px]">
                DESCRIPTION / CAPTION / SKILLS
              </label>
              <textarea
                rows={3}
                required
                value={certForm.subtitle_or_skills}
                onChange={(e) =>
                  setCertForm({ ...certForm, subtitle_or_skills: e.target.value })
                }
                placeholder="Describe the certificate, achievement photo, hackathon build, or academic milestone..."
                className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="eyebrow mb-1 block text-[10px]">
                CREDENTIAL OR VERIFICATION URL (OPTIONAL)
              </label>
              <input
                type="text"
                value={certForm.credential_url}
                onChange={(e) => setCertForm({ ...certForm, credential_url: e.target.value })}
                placeholder="https://..."
                className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="eyebrow mb-1 block text-[10px]">
                IMAGE URL OR UPLOAD TO SUPABASE STORAGE (PORTFOLIO-MEDIA)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={certForm.image_url}
                  onChange={(e) => setCertForm({ ...certForm, image_url: e.target.value })}
                  placeholder="Upload an image or paste public URL..."
                  className="w-full border border-[#2c2723] bg-[#050505] px-3 py-2 text-sm text-white"
                />
                <label className="flex shrink-0 cursor-pointer items-center gap-1.5 border border-[#2c2723] bg-[#141210] px-3.5 py-2 text-xs text-[#f4efe9] hover:border-[#ff8c59]">
                  <Upload size={13} />
                  <span>{uploadingMedia ? 'Uploading...' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCertImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {certForm.image_url && (
                <div className="mt-3 overflow-hidden border border-[#26221e] bg-[#050505] p-2">
                  <div className="mb-1.5 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#9e958b]">
                    <span>Live Image Preview</span>
                    <a
                      href={certForm.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#ff8c59] hover:underline"
                    >
                      Open full image <ExternalLink size={11} />
                    </a>
                  </div>
                  <img
                    src={certForm.image_url}
                    alt={certForm.title || 'Preview'}
                    className="max-h-44 w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 text-xs text-[#d2c6ba]">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={certForm.published}
                  onChange={(e) =>
                    setCertForm({ ...certForm, published: e.target.checked })
                  }
                />
                <span>Published on live portfolio showcase</span>
              </label>
            </div>

            <button type="submit" className="pill-link w-full cursor-pointer justify-center">
              <Plus size={15} />
              <span>
                {editingCertId
                  ? 'Update Showcase Item'
                  : 'Save & Sync to Supabase'}
              </span>
            </button>
          </form>

          <div className="space-y-4 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border border-[#26221e] bg-[#0b0a09] p-4">
              <div className="flex flex-wrap gap-1.5">
                {SHOWCASE_FILTERS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setCertCategoryFilter(filter)}
                    className={`cursor-pointer border px-3 py-1.5 text-[11px] font-mono uppercase transition ${
                      certCategoryFilter === filter
                        ? 'border-[#ff8c59] bg-[#ff8c59]/15 text-white'
                        : 'border-[#26221e] bg-[#050505] text-[#9e958b] hover:border-[#4a423b]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <span className="eyebrow text-[10px] text-[#9e958b]">
                {
                  certificates.filter((c) =>
                    certCategoryFilter === 'All' ? true : c.category === certCategoryFilter
                  ).length
                }{' '}
                RECORD(S)
              </span>
            </div>

            {certificates.filter((c) =>
              certCategoryFilter === 'All' ? true : c.category === certCategoryFilter
            ).length === 0 ? (
              <div className="border border-[#26221e] bg-[#0b0a09] p-8 text-sm text-[#bdb5aa]">
                No records found in <strong>{certCategoryFilter}</strong>. Use the form on the left
                to upload a certificate, achievement photo, hackathon memory, or academic milestone.
              </div>
            ) : (
              certificates
                .filter((c) =>
                  certCategoryFilter === 'All' ? true : c.category === certCategoryFilter
                )
                .map((cert) => (
                  <article
                    key={cert.id}
                    className="flex flex-col justify-between gap-4 border border-[#26221e] bg-[#0b0a09] p-5 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-start gap-4">
                      {cert.image_url && (
                        <a
                          href={cert.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block h-20 w-28 shrink-0 overflow-hidden border border-[#2c2723] bg-[#050505]"
                          title="Open full image"
                        >
                          <img
                            src={cert.image_url}
                            alt={cert.title}
                            className="h-full w-full object-cover"
                          />
                        </a>
                      )}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="eyebrow text-[#ff8c59]">
                            {cert.category} · {cert.issue_date}
                          </span>
                          <span
                            className={`border px-1.5 py-0.5 font-mono text-[10px] ${
                              cert.published
                                ? 'border-[#3ECF8E]/40 bg-[#3ECF8E]/10 text-[#3ECF8E]'
                                : 'border-[#ff5a36]/50 bg-[#ff5a36]/10 text-[#ff9d85]'
                            }`}
                          >
                            {cert.published ? 'PUBLISHED' : 'DRAFT / HIDDEN'}
                          </span>
                        </div>
                        <h3 className="text-xl text-white">{cert.title}</h3>
                        <p className="text-xs text-[#d2c6ba]">
                          {cert.issuer}
                          {cert.role_or_domain ? ` · ${cert.role_or_domain}` : ''}
                        </p>
                        <p className="text-xs text-[#9e958b]">{cert.subtitle_or_skills}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleCertPublished(cert)}
                        className={`flex cursor-pointer items-center gap-1 border px-3 py-1.5 text-xs transition ${
                          cert.published
                            ? 'border-[#2c2723] text-[#d2c6ba] hover:border-[#ff8c59]'
                            : 'border-[#ff8c59]/60 bg-[#ff8c59]/10 text-[#ff8c59]'
                        }`}
                      >
                        {cert.published ? <EyeOff size={13} /> : <Eye size={13} />}
                        <span>{cert.published ? 'Unpublish' : 'Publish'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCertId(cert.id);
                          setCertForm({
                            slug: cert.slug,
                            title: cert.title,
                            issuer: cert.issuer,
                            role_or_domain: cert.role_or_domain,
                            subtitle_or_skills: cert.subtitle_or_skills,
                            category: cert.category,
                            credential_url: cert.credential_url,
                            image_url: cert.image_url,
                            issue_date: cert.issue_date,
                            display_order: cert.display_order,
                            published: cert.published,
                          });
                        }}
                        className="flex cursor-pointer items-center gap-1 border border-[#2c2723] px-3 py-1.5 text-xs text-[#f4efe9] hover:border-[#ff8c59]"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await deleteCertificate(cert.id, cert.image_url);
                            await loadAllAdminData();
                            await refreshPortfolio();
                            setStatusBanner({
                              type: 'success',
                              text: `"${cert.title}" deleted from Supabase.`,
                            });
                          } catch (err) {
                            setStatusBanner({
                              type: 'error',
                              text: err instanceof Error ? err.message : 'Delete failed.',
                            });
                          }
                        }}
                        className="flex cursor-pointer items-center gap-1 border border-[#ff5a36]/40 px-3 py-1.5 text-xs text-[#ff9d85]"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </article>
                ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: CONTACT MESSAGES INBOX */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              {(['all', 'unread', 'read', 'archived'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setMessageFilter(status)}
                  className={`cursor-pointer border px-3 py-1.5 text-xs uppercase ${
                    messageFilter === status
                      ? 'border-[#ff8c59] bg-[#ff8c59]/15 text-white'
                      : 'border-[#26221e] text-[#9e958b]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <span className="eyebrow text-[#9e958b]">
              {filteredMessages.length} MESSAGE(S)
            </span>
          </div>

          {filteredMessages.length === 0 ? (
            <div className="border border-[#26221e] bg-[#0b0a09] p-8 text-sm text-[#bdb5aa]">
              No contact messages matching filter <strong>{messageFilter}</strong>.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((msg) => (
                <article
                  key={msg.id}
                  className="border border-[#26221e] bg-[#0b0a09] p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#221e1b] pb-3">
                    <div>
                      <span className="eyebrow text-[#ff8c59]">
                        {msg.status.toUpperCase()} · {new Date(msg.created_at).toLocaleString()}
                      </span>
                      <h3 className="mt-1 text-lg text-white">
                        {msg.subject} — <span className="text-[#d2c6ba]">{msg.name}</span> (
                        <a href={`mailto:${msg.email}`} className="underline">
                          {msg.email}
                        </a>
                        )
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {(['unread', 'read', 'archived'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={async () => {
                            try {
                              await updateContactMessageStatus(msg.id, st);
                              await loadAllAdminData();
                            } catch (err) {
                              setStatusBanner({
                                type: 'error',
                                text:
                                  err instanceof Error ? err.message : 'Status update failed.',
                              });
                            }
                          }}
                          className={`cursor-pointer border px-2.5 py-1 text-[11px] uppercase ${
                            msg.status === st
                              ? 'border-[#ff8c59] text-[#ff8c59]'
                              : 'border-[#2c2723] text-[#9e958b]'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await deleteContactMessage(msg.id);
                            await loadAllAdminData();
                          } catch (err) {
                            setStatusBanner({
                              type: 'error',
                              text: err instanceof Error ? err.message : 'Delete failed.',
                            });
                          }
                        }}
                        className="cursor-pointer border border-[#ff5a36]/40 px-2.5 py-1 text-[11px] text-[#ff9d85]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#e6ddd3]">
                    {msg.message}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: RLS & SQL SCHEMA */}
      {activeTab === 'rls' && (
        <div className="border border-[#26221e] bg-[#0b0a09] p-6">
          <div className="mb-4 flex items-center justify-between border-b border-[#221e1b] pb-4">
            <div>
              <span className="eyebrow text-[#ff8c59]">SUPABASE POSTGRESQL + RLS POLICIES</span>
              <h2 className="mt-1 text-2xl">Database Schema &amp; Security Policy Reference</h2>
            </div>
            <button
              type="button"
              onClick={handleCopySql}
              className="pill-link cursor-pointer text-xs"
            >
              {copiedSql ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedSql ? 'Copied SQL' : 'Copy SQL'}</span>
            </button>
          </div>
          <pre className="max-h-[540px] overflow-auto border border-[#221e1b] bg-[#050505] p-4 font-mono text-xs leading-relaxed text-[#d2c6ba]">
            {schemaSqlRaw}
          </pre>
        </div>
      )}
    </main>
  );
}
