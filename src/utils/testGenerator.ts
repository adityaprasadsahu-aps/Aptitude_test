import type { Question, TestSettings } from '../types';

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function generateTest(allQuestions: Question[], settings: TestSettings, askedQuestions: string[] = []): Question[] {
  let selectedQuestions: Question[] = [];

  const companyQuestions = settings.selectedCompany === 'All' 
    ? allQuestions 
    : allQuestions.filter(q => q.company === settings.selectedCompany);

  settings.sectionDistribution.forEach(sectionDef => {
    // Filter questions by this section
    const sectionQuestions = companyQuestions.filter(q => q.section === sectionDef.section);
    
    if (sectionQuestions.length === 0) return;

    // Calculate how many questions of each difficulty we need
    const easyCount = Math.round(sectionDef.questionCount * (settings.difficultyRatio.Easy / 100));
    const hardCount = Math.round(sectionDef.questionCount * (settings.difficultyRatio.Hard / 100));
    const mediumCount = sectionDef.questionCount - easyCount - hardCount; // Remainder to medium

    const pickQuestions = (diff: string, count: number) => {
      const unused = shuffleArray(sectionQuestions.filter(q => q.difficulty === diff && !askedQuestions.includes(q.id)));
      const used = shuffleArray(sectionQuestions.filter(q => q.difficulty === diff && askedQuestions.includes(q.id)));
      
      let selected = unused.slice(0, count);
      if (selected.length < count) {
        selected = [...selected, ...used.slice(0, count - selected.length)];
      }
      return selected;
    };

    const easyQuestions = pickQuestions('Easy', easyCount);
    const mediumQuestions = pickQuestions('Medium', mediumCount);
    const hardQuestions = pickQuestions('Hard', hardCount);

    const selectedForSection = [
      ...easyQuestions,
      ...mediumQuestions,
      ...hardQuestions
    ];

    // If there's a shortfall because we don't have enough of a specific difficulty, fill with whatever is available
    if (selectedForSection.length < sectionDef.questionCount) {
      const needed = sectionDef.questionCount - selectedForSection.length;
      const unusedFallback = sectionQuestions.filter(q => !selectedForSection.find(sq => sq.id === q.id) && !askedQuestions.includes(q.id));
      const usedFallback = sectionQuestions.filter(q => !selectedForSection.find(sq => sq.id === q.id) && askedQuestions.includes(q.id));
      
      let fallbackSelected = shuffleArray(unusedFallback).slice(0, needed);
      if (fallbackSelected.length < needed) {
        fallbackSelected = [...fallbackSelected, ...shuffleArray(usedFallback).slice(0, needed - fallbackSelected.length)];
      }
      selectedForSection.push(...fallbackSelected);
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
