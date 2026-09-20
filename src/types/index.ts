export interface Question {
  id: string;
  company: string;
  section: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: string;
  explanation: string;
  image?: string;
}

export interface SectionDistribution {
  section: string;
  timeLimit: number;
  questionCount: number;
}

export interface TestSettings {
  selectedCompany: string;
  totalQuestions: number;
  totalTimeMinutes: number;
  sectionDistribution: SectionDistribution[];
  difficultyRatio: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  negativeMarking: boolean;
  negativeMarkWeight: number; // e.g. 0.25
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

export interface AnswerRecord {
  questionId: string;
  selectedOption: string | null;
  status: 'unanswered' | 'answered' | 'review';
}

export interface TestResult {
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  negativeMarks: number;
  answers: AnswerRecord[];
  questions: Question[];
}
