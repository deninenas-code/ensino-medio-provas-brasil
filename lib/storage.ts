import { ExamAttempt } from './types';

const STORAGE_KEY_ATTEMPTS = 'esc_simulados_attempts_v1';
const STORAGE_KEY_BOOKMARKS = 'esc_simulados_bookmarks_v1';
const STORAGE_KEY_STUDENT = 'esc_simulados_student_v1';
const STORAGE_KEY_ACTIVE_EXAM = 'esc_simulados_active_exam_v1';

export interface StudentProfile {
  name: string;
  grade: string;
  focusDays: number;
  weeklyTarget: number;
  weeklySolved: number;
  triAverage: number;
}

export const DEFAULT_STUDENT: StudentProfile = {
  name: 'Lucas Albuquerque',
  grade: '3º Ano - Médio / ENEM',
  focusDays: 12,
  weeklyTarget: 100,
  weeklySolved: 68,
  triAverage: 718.5,
};

export function getStudentProfile(): StudentProfile {
  if (typeof window === 'undefined') return DEFAULT_STUDENT;
  try {
    const data = localStorage.getItem(STORAGE_KEY_STUDENT);
    return data ? JSON.parse(data) : DEFAULT_STUDENT;
  } catch {
    return DEFAULT_STUDENT;
  }
}

export function saveStudentProfile(profile: Partial<StudentProfile>): StudentProfile {
  if (typeof window === 'undefined') return DEFAULT_STUDENT;
  const current = getStudentProfile();
  const updated = { ...current, ...profile };
  try {
    localStorage.setItem(STORAGE_KEY_STUDENT, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save profile', err);
  }
  return updated;
}

export function getExamAttempts(): ExamAttempt[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ATTEMPTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveExamAttempt(attempt: ExamAttempt): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getExamAttempts();
    const updated = [attempt, ...current.filter(a => a.id !== attempt.id)];
    localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(updated));

    // Update student weekly solved count
    const student = getStudentProfile();
    const answeredCount = Object.keys(attempt.answers).filter(k => !!attempt.answers[Number(k)]).length;
    saveStudentProfile({
      weeklySolved: Math.min(student.weeklyTarget, student.weeklySolved + answeredCount),
      triAverage: Number(((student.triAverage + attempt.triScore) / 2).toFixed(1)),
    });
  } catch (err) {
    console.error('Failed to save attempt', err);
  }
}

export function getBookmarks(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleBookmarkStorage(simuladoId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const current = getBookmarks();
    let updated: string[];
    let isBookmarked = false;
    if (current.includes(simuladoId)) {
      updated = current.filter(id => id !== simuladoId);
      isBookmarked = false;
    } else {
      updated = [...current, simuladoId];
      isBookmarked = true;
    }
    localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(updated));
    return isBookmarked;
  } catch {
    return false;
  }
}

export interface InProgressExamState {
  simuladoId: string;
  currentQuestionIndex: number;
  answers: Record<number, 'A' | 'B' | 'C' | 'D' | 'E' | undefined>;
  flaggedForReview: number[];
  struckAlternatives: Record<number, ('A' | 'B' | 'C' | 'D' | 'E')[]>;
  timeRemainingSeconds: number;
  notes: string;
}

export function saveActiveExamState(state: InProgressExamState | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (state === null) {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_EXAM);
    } else {
      localStorage.setItem(STORAGE_KEY_ACTIVE_EXAM, JSON.stringify(state));
    }
  } catch (err) {
    console.error('Failed to save active exam', err);
  }
}

export function getActiveExamState(): InProgressExamState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_EXAM);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
