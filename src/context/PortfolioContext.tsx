import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import {
  AchievementRecord,
  buildLearningJourneyItems,
  buildTechStackCategories,
  CertificateRecord,
  EducationRecord,
  getPublishedShowcaseItems,
  INITIAL_ACHIEVEMENTS,
  INITIAL_EDUCATION,
  INITIAL_PROJECTS,
  INITIAL_SKILLS,
  LEARNING_JOURNEY_ITEMS,
  LearningJourneyItem,
  mapProjectToVideoItem,
  ProjectRecord,
  SkillRecord,
  TechStackCategory,
  VideoItem,
} from '../data/portfolioData';
import { fetchPublicPortfolioSnapshot, supabase } from '../lib/supabase';

interface PortfolioContextValue {
  projects: ProjectRecord[];
  education: EducationRecord[];
  learningJourneyItems: LearningJourneyItem[];
  achievements: AchievementRecord[];
  certificates: CertificateRecord[];
  showcaseItems: CertificateRecord[];
  skills: SkillRecord[];
  techStackCategories: TechStackCategory[];
  videos: VideoItem[];
  refreshPortfolio: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextValue>({
  projects: INITIAL_PROJECTS,
  education: INITIAL_EDUCATION,
  learningJourneyItems: LEARNING_JOURNEY_ITEMS,
  achievements: INITIAL_ACHIEVEMENTS,
  certificates: [],
  showcaseItems: [],
  skills: INITIAL_SKILLS,
  techStackCategories: buildTechStackCategories(INITIAL_SKILLS),
  videos: INITIAL_PROJECTS.map(mapProjectToVideoItem),
  refreshPortfolio: async () => {},
});

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectRecord[]>(INITIAL_PROJECTS);
  const [education, setEducation] = useState<EducationRecord[]>(INITIAL_EDUCATION);
  const [achievements, setAchievements] = useState<AchievementRecord[]>(INITIAL_ACHIEVEMENTS);
  const [liveCertificates, setLiveCertificates] = useState<CertificateRecord[]>([]);
  const [skills, setSkills] = useState<SkillRecord[]>(INITIAL_SKILLS);

  const refreshPortfolio = useCallback(async () => {
    try {
      const snapshot = await fetchPublicPortfolioSnapshot();
      if (snapshot.projects && snapshot.projects.length > 0) {
        setProjects(snapshot.projects);
      }
      if (snapshot.education && snapshot.education.length > 0) {
        setEducation(snapshot.education);
      }
      if (snapshot.achievements && snapshot.achievements.length > 0) {
        setAchievements(snapshot.achievements);
      }
      if (snapshot.certificates !== undefined) {
        setLiveCertificates(snapshot.certificates);
      }
      if (snapshot.skills && snapshot.skills.length > 0) {
        setSkills(snapshot.skills);
      }
    } catch {
      // Keep baseline verified portfolio data if network or table is not yet initialized
    }
  }, []);

  useEffect(() => {
    refreshPortfolio();
    const client = supabase;
    if (!client) return;

    const channel = client
      .channel('portfolio-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        refreshPortfolio();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'education' }, () => {
        refreshPortfolio();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'achievements' }, () => {
        refreshPortfolio();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'certificates' }, () => {
        refreshPortfolio();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skills' }, () => {
        refreshPortfolio();
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [refreshPortfolio]);

  const showcaseItems = getPublishedShowcaseItems(liveCertificates);
  const publishedProjects = [...projects]
    .filter((p) => p.published)
    .sort((a, b) => (Number(a.display_order) || 1) - (Number(b.display_order) || 1));
  const videos = (publishedProjects.length > 0 ? publishedProjects : INITIAL_PROJECTS).map(
    mapProjectToVideoItem
  );
  const techStackCategories = buildTechStackCategories(skills);
  const learningJourneyItems = buildLearningJourneyItems(education);

  return (
    <PortfolioContext.Provider
      value={{
        projects,
        education,
        learningJourneyItems,
        achievements,
        certificates: liveCertificates,
        showcaseItems,
        skills,
        techStackCategories,
        videos,
        refreshPortfolio,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}
