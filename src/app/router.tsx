import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from '../components/layout/Shell';
import { HomeView } from '../features/home/HomeView';
import { PracticeView } from '../features/practice/PracticeView';
import { WordsView } from '../features/words/WordsView';
import { SkillsView } from '../features/skills/SkillsView';
import { JournalView } from '../features/journal/JournalView';
import { QuestsView } from '../features/quests/QuestsView';
import { SystemView } from '../features/system/SystemView';
import { LearningPlanView } from '../features/plan/LearningPlanView';
import { GuidedWizardView } from '../features/practice/GuidedWizardView';
import { ThaiTestView } from '../features/dev/ThaiTestView';

export const AppRouter: React.FC = () => {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/wizard" element={<GuidedWizardView />} />
        <Route path="/plan" element={<LearningPlanView />} />
        <Route path="/practice" element={<PracticeView />} />
        <Route path="/words" element={<WordsView />} />
        <Route path="/skills" element={<SkillsView />} />
        <Route path="/journal" element={<JournalView />} />
        <Route path="/quests" element={<QuestsView />} />
        <Route path="/system" element={<SystemView />} />
        <Route path="/dev/thai-test" element={<ThaiTestView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
};
