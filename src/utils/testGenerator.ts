import type { Question, TestSettings } from '../types';

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function generateTest(allQuestions: Question[], settings: TestSettings): Question[] {
  let selectedQuestions: Question[] = [];

  settings.sectionDistribution.forEach(sectionDef => {
    // Filter questions by this section
    const sectionQuestions = allQuestions.filter(q => q.section === sectionDef.section);
    
    if (sectionQuestions.length === 0) return;

    // Calculate how many questions of each difficulty we need
    const easyCount = Math.round(sectionDef.questionCount * (settings.difficultyRatio.Easy / 100));
    const hardCount = Math.round(sectionDef.questionCount * (settings.difficultyRatio.Hard / 100));
    const mediumCount = sectionDef.questionCount - easyCount - hardCount; // Remainder to medium

    const easyQuestions = shuffleArray(sectionQuestions.filter(q => q.difficulty === 'Easy'));
    const mediumQuestions = shuffleArray(sectionQuestions.filter(q => q.difficulty === 'Medium'));
    const hardQuestions = shuffleArray(sectionQuestions.filter(q => q.difficulty === 'Hard'));

    const selectedForSection = [
      ...easyQuestions.slice(0, easyCount),
      ...mediumQuestions.slice(0, mediumCount),
      ...hardQuestions.slice(0, hardCount)
    ];

    // If there's a shortfall because we don't have enough of a specific difficulty, fill with whatever is available
    if (selectedForSection.length < sectionDef.questionCount) {
      const needed = sectionDef.questionCount - selectedForSection.length;
      const unused = sectionQuestions.filter(q => !selectedForSection.find(sq => sq.id === q.id));
      selectedForSection.push(...shuffleArray(unused).slice(0, needed));
    }

    selectedQuestions = [...selectedQuestions, ...selectedForSection];
  });

  if (settings.shuffleQuestions) {
    selectedQuestions = shuffleArray(selectedQuestions);
  }

  if (settings.shuffleOptions) {
    selectedQuestions = selectedQuestions.map(q => {
      // Shuffling options requires keeping track of the correct answer letter
      const optionsArr = [
        { key: 'A', text: q.options.A },
        { key: 'B', text: q.options.B },
        { key: 'C', text: q.options.C },
        { key: 'D', text: q.options.D }
      ];
      const correctText = optionsArr.find(o => o.key === q.answer)?.text;
      
      const shuffledOptions = shuffleArray(optionsArr);
      const newOptions = {
        A: shuffledOptions[0].text,
        B: shuffledOptions[1].text,
        C: shuffledOptions[2].text,
        D: shuffledOptions[3].text
      };
      
      let newAnswer = 'A';
      if (shuffledOptions[1].text === correctText) newAnswer = 'B';
      else if (shuffledOptions[2].text === correctText) newAnswer = 'C';
      else if (shuffledOptions[3].text === correctText) newAnswer = 'D';

      return {
        ...q,
        options: newOptions,
        answer: newAnswer
      };
    });
  }

  return selectedQuestions;
}
