
import React, { useState, useEffect, useRef } from 'react';
import { Bot, Map as MapIcon, RotateCcw, Play, Languages, User, Star, Terminal, AlertTriangle, CheckCircle, XCircle, Timer, Zap, Trophy, Users, BarChart3, PlusCircle, Settings, Database } from 'lucide-react';
import CodeEditor from './components/CodeEditor';
import CoachChat from './components/CoachChat';
import LevelMap from './components/LevelMap';
import TutorialOverlay from './components/TutorialOverlay';
import VictoryModal from './components/VictoryModal';
import LeaderboardModal from './components/LeaderboardModal'; 
import UserSelectModal from './components/UserSelectModal';   
import QuestionRenderer from './components/questions/QuestionRenderer';
import ReviewModal from './components/ReviewModal';
import { getLevels, UI_STRINGS, LEVEL_COUNT } from './constants';
import { validateCodeWithGemini, sendChatMessage } from './services/geminiService';
import { UserState, MessageRole, ChatMessage, CoachPersona, LevelData, ConceptLevel, ConceptQuestion, Course } from './types';
import { audio } from './services/audioService';
import CourseCreator from './components/course/CourseCreator';
import { configService } from './services/configService';
import ConfigEditor from './components/settings/ConfigEditor';
import DataBackup from './components/settings/DataBackup';
import { analyticsService, EVENTS } from './services/analyticsService';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  // --- Global State (Multi-User) ---
  const [allPlayers, setAllPlayers] = useState<UserState[]>([]);
  const [showUserSelect, setShowUserSelect] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // --- Current User State ---
  const initialCourses = React.useMemo(() => configService.getCourses(), []);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [userState, setUserState] = useState<UserState>({
    id: 'default',
    currentLevel: 1,
    stars: 0,
    levelStars: {},
    xp: 0,
    unlockedBadges: [],
    name: 'Guest',
    language: 'zh',
    hasSeenTutorial: false,
    settings: {
      voiceURI: '美嘉',
      persona: 'professional'
    },
    currentBank: 'A'
  });

  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourses[0]?.id || '');
  const [conceptProgressMap, setConceptProgressMap] = useState<Record<string, { currentLevel: number; levelStars: Record<number, number>; }>>({});
  useEffect(() => {
    // 确保初始课程都有进度
    const map: typeof conceptProgressMap = {};
    initialCourses.forEach(c => {
      map[c.id] = { currentLevel: 1, levelStars: {} };
    });
    setConceptProgressMap(map);
  }, [initialCourses]);
  const [currentConceptLevel, setCurrentConceptLevel] = useState<ConceptLevel | null>(null);

  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);
  const [currentLevelData, setCurrentLevelData] = useState<LevelData | null>(null);
  const [code, setCode] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  
  // Party Mode State
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [scoreData, setScoreData] = useState({ score: 0, timeBonus: 0 });

  const [tutorialStep, setTutorialStep] = useState<number>(-1);
  const [showVictory, setShowVictory] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [conceptAnswer, setConceptAnswer] = useState<string | boolean | null>(null);
  const [showConceptResult, setShowConceptResult] = useState(false);
  const [conceptIsCorrect, setConceptIsCorrect] = useState<boolean | null>(null);
  const [conceptAttempts, setConceptAttempts] = useState<number>(0); // 用于评星扣分
  const [conceptHistory, setConceptHistory] = useState<{ levelId: number; question: string; correct: boolean; userAnswer: string | boolean | null; map?: string; durationMs?: number; answeredAt?: number; courseId?: string }[]>([]);
  const [conceptSummary, setConceptSummary] = useState<{ map?: string; stars?: number; lastLevel?: number } | null>(null);
  const [conceptStartTime, setConceptStartTime] = useState<number>(Date.now());
  const [showCourseCreator, setShowCourseCreator] = useState(false);
  const [showConfigEditor, setShowConfigEditor] = useState(false);
  const [showBackup, setShowBackup] = useState(false);

  const ui = UI_STRINGS[userState.language];
  const codeLevels = getLevels(userState.language, userState.currentBank);
  const currentCourse = courses.find(c => c.id === selectedCourseId) || courses[0] || { id: 'fallback', name: '课程', icon: '📘', type: 'code', levels: [] };
  useEffect(() => {
    setCourses(configService.getCourses());
  }, []);

  useEffect(() => {
    // 确保每个课程都有进度记录
    const map: typeof conceptProgressMap = { ...conceptProgressMap };
    courses.forEach(c => {
      if (c.type === 'concept' && !map[c.id]) {
        map[c.id] = { currentLevel: 1, levelStars: {} };
      }
    });
    setConceptProgressMap(map);
  }, [courses]);
  const currentConceptProgress = React.useMemo(
    () => conceptProgressMap[currentCourse?.id || ''] || { currentLevel: 1, levelStars: {} },
    [conceptProgressMap, currentCourse?.id]
  );
  const isConceptCourse = currentCourse?.type === 'concept';
  const isConceptSession = Boolean(isConceptCourse && currentConceptLevel && activeLevelId);
  const isCodeSession = Boolean(!isConceptCourse && activeLevelId && currentLevelData);
  const starRules = configService.get<{ firstAttempt: number; secondAttempt: number; thirdOrMore: number }>('scoring.starRules') || { firstAttempt: 3, secondAttempt: 2, thirdOrMore: 1 };
  const starsFromAttempts = (attempts: number) => {
    if (attempts <= 0) return starRules.firstAttempt;
    if (attempts === 1) return starRules.secondAttempt;
    return starRules.thirdOrMore;
  };
  const historyForCurrentCourse = React.useMemo(
    () => conceptHistory.filter(h => !h.courseId || h.courseId === currentCourse?.id),
    [conceptHistory, currentCourse?.id]
  );
  const totalTimeYesterdayMs = React.useMemo(() => {
    const now = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfYesterday = startOfToday.getTime() - 24 * 60 * 60 * 1000;
    return conceptHistory
      .filter(h => (!h.courseId || h.courseId === currentCourse?.id) && (h.answeredAt || 0) >= startOfYesterday && (h.answeredAt || 0) < startOfToday.getTime())
      .reduce((acc, cur) => acc + (cur.durationMs || 0), 0);
  }, [conceptHistory, currentCourse?.id]);
  const goToNextConceptLevel = () => {
    if (!currentCourse || currentCourse.type !== 'concept' || !currentConceptLevel) return;
    const levels = currentCourse.levels as ConceptLevel[];
    const next = levels.find(l => l.id > currentConceptLevel.id);
    if (next) {
      setActiveLevelId(next.id);
      setCurrentConceptLevel(next);
      analyticsService.trackLevelStart(currentCourse.id, next.id);
      setConceptAnswer(null);
      setConceptIsCorrect(null);
      setShowConceptResult(false);
      setShowVictory(false);
      setConceptAttempts(0);
      setConceptSummary(null);
      setConceptStartTime(Date.now());
      const firstQuestionText = next.questions?.[0]?.type === 'fill_blank'
        ? (next.questions[0] as any).question
        : (next.questions?.[0] as any)?.question || (next.questions?.[0] as any)?.statement || next.title;
      setMessages([{ role: MessageRole.MODEL, text: firstQuestionText }]);
    } else {
      handleNextLevel();
    }
  };

  // --- Initialization & Persistence ---
  useEffect(() => {
    storageService.init().catch(err => console.warn('IndexedDB init failed', err));
    const loadedCourses = configService.getCourses();
    setCourses(loadedCourses);
    if (!selectedCourseId && loadedCourses[0]) {
      setSelectedCourseId(loadedCourses[0].id);
    }
  }, []);

  // 1. Load players
  useEffect(() => {
    const savedPlayers = localStorage.getItem('pysparky_players');
    if (savedPlayers) {
      try {
        const parsed = JSON.parse(savedPlayers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAllPlayers(parsed);
          setShowUserSelect(true);
          return;
        }
      } catch (e) {
        console.error("Failed to load save data", e);
      }
    }
    setShowUserSelect(true);
  }, []);

  // 2. Save players
  useEffect(() => {
    if (allPlayers.length > 0) {
      localStorage.setItem('pysparky_players', JSON.stringify(allPlayers));
    }
  }, [allPlayers]);

  // 3. Sync current userState back to allPlayers
  useEffect(() => {
    if (userState.id !== 'default') {
      setAllPlayers(prev => prev.map(p => p.id === userState.id ? userState : p));
    }
  }, [userState]);

  useEffect(() => {
    if (userState.id === 'default') return;
    analyticsService.init(userState.id);
    analyticsService.trackPageView('home');
    return () => {
      analyticsService.destroy();
    };
  }, [userState.id]);

  useEffect(() => {
    if (!selectedCourseId) return;
    setConceptProgressMap(prev => {
      if (prev[selectedCourseId]) return prev;
      return { ...prev, [selectedCourseId]: { currentLevel: 1, levelStars: {} } };
    });
  }, [selectedCourseId]);


  // --- Effects (Level Logic) ---
  useEffect(() => {
    if (userState.id !== 'default' && !userState.hasSeenTutorial) {
      setTutorialStep(0);
    }
  }, [userState.id]); 

  // Level Initialization & Timer
  useEffect(() => {
    if (activeLevelId && currentLevelData) {
      setMessages([{ role: MessageRole.MODEL, text: currentLevelData.task || currentLevelData.description || ui.welcomeChat }]);
      setCode(currentLevelData.starterCode || '');
      setOutput('');
      setRunStatus('idle');
      
      setTimeLeft(currentLevelData.timeLimit || 60);
      if (timerRef.current) clearInterval(timerRef.current);
      
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
             clearInterval(timerRef.current!);
             audio.play('LOSE');
             return 0;
          }
          if (prev <= 11) audio.play('TICK');
          return prev - 1;
        });
      }, 1000);

    } else if (isConceptSession && currentConceptLevel) {
      const firstQuestionText = currentConceptLevel.questions?.[0]?.type === 'fill_blank'
        ? (currentConceptLevel.questions[0] as any).question
        : (currentConceptLevel.questions?.[0] as any)?.question || (currentConceptLevel.questions?.[0] as any)?.statement || currentConceptLevel.title;
      setMessages([{ role: MessageRole.MODEL, text: firstQuestionText }]);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (userState.id !== 'default') {
        setMessages([{ role: MessageRole.MODEL, text: ui.welcomeChat }]);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeLevelId, currentLevelData, userState.language, userState.currentBank, isConceptSession, currentConceptLevel]);


  // --- User Management Handlers ---

  const handleCreateUser = (name: string, bank: 'A'|'B'|'C') => {
    const newUser: UserState = {
      id: Date.now().toString(),
      name,
      currentLevel: 1,
      stars: 0,
      levelStars: {},
      xp: 0,
      unlockedBadges: [],
      language: userState.language, 
      hasSeenTutorial: false,
      settings: { voiceURI: '美嘉', persona: 'professional' },
      currentBank: bank 
    };
    setAllPlayers(prev => [...prev, newUser]);
    setUserState(newUser);
    setShowUserSelect(false);
  };

  const handleSelectUser = (user: UserState) => {
    setUserState(user);
    setShowUserSelect(false);
  };

  const handleSwitchUser = () => {
    audio.play('CLICK');
    setActiveLevelId(null);
    setCurrentLevelData(null);
    setCurrentConceptLevel(null);
    setConceptProgressMap({});
    setSelectedCourseId(courses[0]?.id || '');
    setShowConceptResult(false);
    setConceptAnswer(null);
    setConceptIsCorrect(null);
    setConceptAttempts(0);
    setConceptStartTime(Date.now());
    setShowUserSelect(true);
  };

  // --- Game Handlers ---

  const toggleLanguage = () => {
    audio.play('CLICK');
    setUserState(prev => ({ ...prev, language: prev.language === 'en' ? 'zh' : 'en' }));
  };

  const handleLevelSelect = (id: number) => {
    audio.play('CLICK');
    if (isConceptCourse && currentCourse.type === 'concept') {
      const conceptLevel = (currentCourse.levels as ConceptLevel[]).find(l => l.id === id);
      if (conceptLevel) {
        setActiveLevelId(id);
        setCurrentConceptLevel(conceptLevel);
        setConceptAnswer(null);
        setShowConceptResult(false);
        setConceptIsCorrect(null);
        setCurrentLevelData(null);
        setConceptAttempts(0);
        setConceptStartTime(Date.now());
        const firstQuestionText = conceptLevel.questions?.[0]?.type === 'fill_blank'
          ? (conceptLevel.questions[0] as any).question
          : (conceptLevel.questions?.[0] as any)?.question || (conceptLevel.questions?.[0] as any)?.statement || conceptLevel.title;
        setMessages([{ role: MessageRole.MODEL, text: firstQuestionText }]);
        analyticsService.trackLevelStart(currentCourse.id, id);
      }
      return;
    }

    const baseLevel = codeLevels.find(l => l.id === id);
    if (baseLevel) {
      let finalLevel = { ...baseLevel };
      if (baseLevel.variants && baseLevel.variants.length > 0) {
        const randomIndex = Math.floor(Math.random() * baseLevel.variants.length);
        const randomVariant = baseLevel.variants[randomIndex];
        finalLevel = {
          ...finalLevel,
          task: randomVariant.task,
          starterCode: randomVariant.starterCode,
          hint: randomVariant.hint,
          description: randomVariant.description || finalLevel.description
        };
      }
      
      setCurrentLevelData(finalLevel);
      setActiveLevelId(id);
      analyticsService.trackLevelStart(currentCourse.id, id);
      if (tutorialStep === 1) setTutorialStep(2);
    }
  };
  
  const handleBankSelect = (bank: 'A' | 'B' | 'C') => {
    setUserState(prev => ({...prev, currentBank: bank}));
  };

  const handleCourseSelect = (courseId: string) => {
    audio.play('CLICK');
    analyticsService.trackCourseSelect(courseId);
    setSelectedCourseId(courseId);
    setActiveLevelId(null);
    setCurrentLevelData(null);
    setShowConceptResult(false);
    setConceptAnswer(null);
    setConceptIsCorrect(null);
    setConceptAttempts(0);
    setConceptStartTime(Date.now());

    const course = courses.find(c => c.id === courseId);
    if (course && course.type === 'concept') {
      const progress = conceptProgressMap[courseId] || { currentLevel: 1, levelStars: {} };
      const levels = course.levels as ConceptLevel[];
      const target = levels.find(l => l.id === progress.currentLevel) || levels[0];
      if (target) {
        setCurrentConceptLevel(target);
        setActiveLevelId(target.id);
        const firstQuestionText = target.questions?.[0]?.type === 'fill_blank'
          ? (target.questions[0] as any).question
          : (target.questions?.[0] as any)?.question || (target.questions?.[0] as any)?.statement || target.title;
        setMessages([{ role: MessageRole.MODEL, text: firstQuestionText }]);
      }
    } else {
      setCurrentConceptLevel(null);
    }
  };

  const handleTutorialNext = () => {
    audio.play('CLICK');
    if (tutorialStep >= 4) {
      setTutorialStep(-1);
      setUserState(prev => ({ ...prev, hasSeenTutorial: true }));
    } else {
      setTutorialStep(prev => prev + 1);
    }
  };

  const checkConceptAnswer = (question: ConceptQuestion, answer: string | boolean): boolean => {
    switch (question.type) {
      case 'single_choice':
        return answer === question.correctAnswer;
      case 'true_false':
        return answer === question.correctAnswer;
      case 'fill_blank': {
        const normalized = String(answer).trim();
        return question.correctAnswers.some(correct =>
          question.caseSensitive ? correct === normalized : correct.toLowerCase() === normalized.toLowerCase()
        );
      }
      default:
        return false;
    }
  };

  const handleConceptAnswer = (answer: string | boolean) => {
    if (!currentConceptLevel || !currentCourse) return;
    const question = currentConceptLevel.questions[0];
    const isCorrect = question ? checkConceptAnswer(question, answer) : false;

    audio.play('CLICK');
    setConceptAnswer(answer);
    setConceptIsCorrect(isCorrect);
    setShowConceptResult(true);
    const answeredAt = Date.now();
    const durationMs = Math.max(0, answeredAt - conceptStartTime);
    analyticsService.trackAnswer(currentCourse.id, currentConceptLevel.id, isCorrect, conceptAttempts + 1);
    setConceptHistory(prev => [...prev, {
      levelId: currentConceptLevel.id,
      question: (question as any).question || (question as any).statement || '',
      correct: isCorrect,
      userAnswer: answer,
      map: currentConceptLevel.map,
      durationMs,
      answeredAt,
      courseId: currentCourse.id
    }]);

    if (isCorrect) {
      audio.play('WIN');
      const baseScore = 1000;
      const totalScore = baseScore;
      const newStars = starsFromAttempts(conceptAttempts);

      setEarnedStars(newStars);
      setScoreData({ score: totalScore, timeBonus: 0 });
      setUserState(prev => ({ ...prev, xp: prev.xp + totalScore }));
      setConceptAttempts(0);
      analyticsService.trackLevelComplete(currentCourse.id, currentConceptLevel.id, newStars, durationMs);
      storageService.saveProgress({
        id: `${userState.id}-${currentCourse.id}-${currentConceptLevel.id}`,
        userId: userState.id,
        courseId: currentCourse.id,
        levelId: currentConceptLevel.id,
        stars: newStars,
        attempts: conceptAttempts + 1,
        timeSpent: durationMs,
        completedAt: answeredAt
      }).catch(err => console.warn('保存进度失败', err));

      setConceptProgressMap(prev => {
        const prevProgress = prev[currentCourse.id] || { currentLevel: 1, levelStars: {} };
        const currentStars = prevProgress.levelStars[currentConceptLevel.id] || 0;
        const updatedStars = Math.max(currentStars, newStars);
        const canAdvance = currentConceptLevel.id === prevProgress.currentLevel;
        return {
          ...prev,
          [currentCourse.id]: {
            currentLevel: canAdvance ? prevProgress.currentLevel + 1 : prevProgress.currentLevel,
            levelStars: { ...prevProgress.levelStars, [currentConceptLevel.id]: updatedStars }
          }
        };
      });
      // map 完成提示
      const levels = (currentCourse?.levels || []) as ConceptLevel[];
      const sameMapLevels = levels.filter(l => l.map === currentConceptLevel.map);
      const lastInMap = sameMapLevels.length > 0 ? sameMapLevels[sameMapLevels.length - 1] : null;
      if (lastInMap && lastInMap.id === currentConceptLevel.id) {
        setConceptSummary({ map: currentConceptLevel.map, stars: newStars, lastLevel: currentConceptLevel.id });
      }
      if (configService.get<boolean>('progression.autoAdvance')) {
        const delay = configService.get<number>('progression.autoAdvanceDelay') || 1200;
        setTimeout(() => goToNextConceptLevel(), delay);
      }
    } else {
      audio.play('LOSE');
      setConceptAttempts(prev => prev + 1);
    }
  };

  const handleRunCode = async () => {
    if (!currentLevelData) return;
    audio.play('CLICK');
    setIsRunning(true);
    setRunStatus('running');
    setOutput(ui.casting);
    
    if (timerRef.current) clearInterval(timerRef.current);

    if (tutorialStep === 3) setTutorialStep(4);

    const result = await validateCodeWithGemini(code, currentLevelData.task, userState.language);
    
    setIsRunning(false);
    setOutput(result.output || "");
    setRunStatus(result.success ? 'success' : 'error');

    const feedbackMsg: ChatMessage = { role: MessageRole.MODEL, text: result.feedback };
    setMessages(prev => [...prev, feedbackMsg]);

    if (result.success) {
      const baseScore = 1000;
      const timeBonus = timeLeft * 20;
      const totalScore = baseScore + timeBonus;
      
      const percentLeft = timeLeft / (currentLevelData.timeLimit || 60);
      let newStars = starRules.thirdOrMore;
      if (percentLeft > 0.5) newStars = starRules.firstAttempt;
      else if (percentLeft > 0.2) newStars = starRules.secondAttempt;

      setEarnedStars(newStars);
      setScoreData({ score: totalScore, timeBonus });
      
      setUserState(prev => {
        const nextLevel = currentLevelData.id === prev.currentLevel && currentLevelData.id < LEVEL_COUNT ? prev.currentLevel + 1 : prev.currentLevel;
        const currentLevelStars = prev.levelStars[currentLevelData.id] || 0;
        
        return {
          ...prev,
          stars: prev.stars + Math.max(0, newStars - currentLevelStars),
          xp: prev.xp + totalScore,
          currentLevel: nextLevel,
          levelStars: { ...prev.levelStars, [currentLevelData.id]: Math.max(currentLevelStars, newStars) }
        };
      });
      analyticsService.trackLevelComplete(currentCourse.id, currentLevelData.id, newStars, (currentLevelData.timeLimit || 60) - timeLeft);
      storageService.saveProgress({
        id: `${userState.id}-${currentCourse.id}-${currentLevelData.id}`,
        userId: userState.id,
        courseId: currentCourse.id,
        levelId: currentLevelData.id,
        stars: newStars,
        attempts: 1,
        timeSpent: (currentLevelData.timeLimit || 60) - timeLeft,
        completedAt: Date.now()
      }).catch(err => console.warn('保存进度失败', err));
      setTimeout(() => setShowVictory(true), 800);
    } else {
       if (timeLeft > 0) {
          audio.play('LOSE');
          timerRef.current = window.setInterval(() => {
            setTimeLeft(prev => {
              if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
              return prev - 1;
            });
          }, 1000);
       }
    }
  };

  const handleSendMessage = async (text: string) => {
    if (tutorialStep === 4) handleTutorialNext();
    const newMsg: ChatMessage = { role: MessageRole.USER, text };
    setMessages(prev => [...prev, newMsg]);
    setIsChatLoading(true);
    analyticsService.track(EVENTS.COACH_CHAT, { courseId: currentCourse?.id, levelId: activeLevelId });

    const personaForChat: CoachPersona = isConceptSession ? 'mentor' : userState.settings.persona;

    const response = await sendChatMessage(
      messages, 
      text, 
      userState.language, 
      personaForChat,
      {
        currentLevel: activeLevelId || 0,
        levelTitle: currentLevelData?.title || currentConceptLevel?.title,
        levelTask: currentLevelData?.task || currentConceptLevel?.description,
        currentCode: code,
        userXp: userState.xp,
        // 注入概念题上下文
        ...(isConceptSession && currentConceptLevel
          ? { extra: JSON.stringify({ map: currentConceptLevel.map, difficulty: currentConceptLevel.difficulty, question: currentConceptLevel.questions?.[0] }) }
          : {})
      }
    );

    setIsChatLoading(false);
    setMessages(prev => [...prev, { role: MessageRole.MODEL, text: response }]);
  };

  const handleNextLevel = () => {
    setShowVictory(false);
    setActiveLevelId(null);
    setCurrentLevelData(null);
    setCurrentConceptLevel(null);
    setShowConceptResult(false);
    setConceptAnswer(null);
    setConceptIsCorrect(null);
  };

  const handleReplay = () => {
    setShowVictory(false);
    if (isConceptSession) {
      setShowConceptResult(false);
      setConceptAnswer(null);
      setConceptIsCorrect(null);
    }
  };

  const updateSettings = (voice: string, persona: CoachPersona) => {
    setUserState(prev => ({ ...prev, settings: { voiceURI: voice || null, persona } }));
  };

  const handleCourseCreated = (course: Course) => {
    const refreshed = configService.getCourses();
    setCourses(refreshed);
    setSelectedCourseId(course.id);
    setConceptProgressMap(prev => ({ ...prev, [course.id]: { currentLevel: 1, levelStars: {} } }));
    setShowCourseCreator(false);
  };

  const handleDeleteCourse = (courseId: string) => {
    configService.deleteCustomCourse(courseId);
    const updated = configService.getCourses();
    const stored = JSON.parse(localStorage.getItem('zlearn_custom_courses') || '[]');
    const filtered = Array.isArray(stored) ? stored.filter((c: any) => c.id !== courseId) : [];
    localStorage.setItem('zlearn_custom_courses', JSON.stringify(filtered));
    setCourses(updated);
    if (selectedCourseId === courseId) {
      setSelectedCourseId(updated[0]?.id || '');
      setCurrentConceptLevel(null);
      setActiveLevelId(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden font-fredoka selection:bg-purple-500/30">
      
      {/* Modals */}
      {showUserSelect && (
        <UserSelectModal 
          players={allPlayers} 
          onSelectUser={handleSelectUser} 
          onCreateUser={handleCreateUser} 
          language={userState.language}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal 
          players={allPlayers} 
          currentPlayerId={userState.id}
          onClose={() => { audio.play('CLICK'); setShowLeaderboard(false); }}
          language={userState.language}
        />
      )}
      {showReview && (
        <ReviewModal
          open={showReview}
          onClose={() => setShowReview(false)}
          course={currentCourse.type === 'concept' ? currentCourse : null}
          conceptProgress={currentConceptProgress}
          history={historyForCurrentCourse}
          totalTimeYesterdayMs={totalTimeYesterdayMs}
          onGenerateSummary={async () => {
            const mistakes = historyForCurrentCourse.filter(h => !h.correct).slice(-5).map(m => `#${m.levelId} ${m.question} | ans: ${m.userAnswer}`);
            const prompt = `作为教练，基于这些错题和进度给出3条精炼建议，中文：\n${mistakes.join('\n') || '暂无错题'}`;
            const resp = await sendChatMessage([], prompt, userState.language, 'mentor', { currentLevel: currentConceptProgress.currentLevel, currentCode: '', userXp: userState.xp });
            return resp;
          }}
        />
      )}
      {showCourseCreator && (
        <CourseCreator
          onComplete={handleCourseCreated}
          onCancel={() => setShowCourseCreator(false)}
        />
      )}
      {showConfigEditor && <ConfigEditor onClose={() => setShowConfigEditor(false)} />}
      {showBackup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-3xl border border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setShowBackup(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>
            <DataBackup />
          </div>
        </div>
      )}

      {tutorialStep >= 0 && <TutorialOverlay step={tutorialStep} onNext={handleTutorialNext} language={userState.language} />}
      {showVictory && <VictoryModal stars={earnedStars} score={scoreData.score} timeBonus={scoreData.timeBonus} onNext={handleNextLevel} onReplay={handleReplay} language={userState.language} />}

      {/* Header */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-40 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-600 p-2 rounded-lg shadow-lg shadow-purple-900/40">
            <Bot className="text-white" size={22} />
          </div>
          <h1 className="font-bold text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hidden md:block tracking-wide">
            {ui.appTitle}
          </h1>
        </div>

        {/* Timer (Center) */}
        {isCodeSession && (
          <div className={`absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${timeLeft < 10 ? 'bg-red-900/50 border-red-500 animate-pulse' : 'bg-slate-800 border-slate-700'}`}>
            <Timer size={20} className={timeLeft < 10 ? 'text-red-400' : 'text-slate-400'} />
            <span className={`font-mono text-xl font-black ${timeLeft < 10 ? 'text-red-400' : 'text-white'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
           {activeLevelId && (
            <button onClick={() => setActiveLevelId(null)} className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-xs font-bold transition-all border border-slate-700 hover:border-slate-600">
              <MapIcon size={16} />
              <span>{ui.mapBtn}</span>
            </button>
          )}
          
          <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 px-4 py-2 rounded-full text-xs font-bold border border-slate-700">
            <Zap size={16} className="text-blue-400 fill-blue-400" />
            <span className="text-blue-100">{userState.xp}</span>
          </div>

          <button
            onClick={() => setShowCourseCreator(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-xs font-bold transition-all border border-slate-700"
          >
            <PlusCircle size={16} />
            <span>自定义课程</span>
          </button>
          <button
            onClick={() => setShowConfigEditor(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-xs font-bold transition-all border border-slate-700"
          >
            <Settings size={16} />
            <span>配置</span>
          </button>
          <button
            onClick={() => setShowBackup(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-xs font-bold transition-all border border-slate-700"
          >
            <Database size={16} />
            <span>备份</span>
          </button>
          <button
            onClick={() => setShowReview(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-xs font-bold transition-all border border-slate-700"
          >
            <BarChart3 size={16} />
            <span>复盘</span>
          </button>

          <button onClick={toggleLanguage} className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-xs font-bold transition-all border border-slate-700">
            <Languages size={16} />
            <span>{userState.language === 'en' ? '中' : 'EN'}</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 h-[calc(100vh-4rem)] overflow-auto relative p-3">
        {!activeLevelId ? (
          <LevelMap 
            userState={userState} 
            selectedCourseId={selectedCourseId}
            conceptProgress={currentConceptProgress}
            courses={courses}
            onSelectCourse={handleCourseSelect}
            onSelectLevel={handleLevelSelect} 
            onSelectBank={handleBankSelect} 
            onSwitchUser={handleSwitchUser} 
            onShowLeaderboard={() => setShowLeaderboard(true)}
            onCreateCourse={() => setShowCourseCreator(true)}
            onDeleteCourse={handleDeleteCourse}
          />
        ) : isConceptSession && currentConceptLevel ? (
          <div className="flex flex-col md:flex-row h-full gap-4">
            <div className="flex flex-col flex-[2] gap-4 min-w-0">
              {showConceptResult && conceptIsCorrect && (
                <div className="bg-green-900/40 border border-green-700 text-green-100 rounded-xl p-3 font-bold flex items-center gap-3">
                  🎉 回答正确！可继续下一关或查看提示。
                  <div className="flex gap-1">
                    {[1, 2, 3].map(s => (
                      <Star key={s} size={18} className="text-yellow-400 fill-yellow-400 drop-shadow" />
                    ))}
                  </div>
                </div>
              )}
                <div className="bg-gradient-to-r from-indigo-900/80 to-blue-900/80 p-5 rounded-2xl border border-indigo-500/30 shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm shrink-0">
                      概念关卡 #{currentConceptLevel.id}
                    </span>
                    <h2 className="font-bold text-lg text-white tracking-wide truncate">{currentConceptLevel.title}</h2>
                </div>
                <p className="text-sm text-slate-200 leading-snug opacity-90">{currentConceptLevel.description}</p>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-slate-900/40 rounded-2xl border border-slate-800 custom-scrollbar">
                <QuestionRenderer 
                  question={currentConceptLevel.questions[0]} 
                  onAnswer={handleConceptAnswer} 
                  showResult={showConceptResult}
                  userAnswer={conceptAnswer ?? undefined}
                  isCorrect={conceptIsCorrect ?? undefined}
                  disabled={showConceptResult}
                />
              </div>
              {showConceptResult && conceptIsCorrect && (
                <div className="bg-green-900/40 border border-green-700 text-green-100 rounded-xl p-3 font-bold">
                  ⭐ 评级：3 星
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConceptResult(false);
                    setConceptAnswer(null);
                    setConceptIsCorrect(null);
                    setShowVictory(false);
                    setConceptAttempts(0);
                    setConceptStartTime(Date.now());
                  }}
                  className="flex-1 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                >
                  {ui.resetBtn}
                </button>
                <button
                  onClick={goToNextConceptLevel}
                  disabled={!conceptIsCorrect}
                  className={`flex-1 py-3 rounded-xl font-bold border transition-colors shadow-lg ${
                    conceptIsCorrect
                      ? 'bg-yellow-500 hover:bg-yellow-400 border-yellow-400 text-slate-900'
                      : 'bg-slate-700 text-slate-300 border-slate-700 cursor-not-allowed'
                  }`}
                >
                  下一关
                </button>
                <button
                  onClick={handleNextLevel}
                  className="flex-1 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 border border-blue-500/60 transition-colors shadow-lg shadow-blue-900/30"
                >
                  {ui.backToMap}
                </button>
              </div>
            </div>

            <div className="flex-1 min-w-[320px] max-w-md shrink-0 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-slate-900/60 border border-slate-800">
              <CoachChat 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                isLoading={isChatLoading} 
                language={userState.language}
                voice={userState.settings.voiceURI} 
                persona={userState.settings.persona} 
                onUpdateSettings={updateSettings}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row h-full gap-4">
            
            {/* Left Column */}
            <div className="flex flex-col flex-[2] gap-3 h-full min-w-0">
              
              {/* TOP BAR */}
              <div className="flex justify-between items-stretch gap-3 shrink-0 h-20">
                <div className="flex-1 bg-gradient-to-r from-indigo-900/80 to-purple-900/80 p-3 px-5 rounded-2xl border border-indigo-500/30 backdrop-blur-sm shadow-sm flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm shrink-0">{ui.mission} #{currentLevelData?.id}</span>
                      <h2 className="font-bold text-base text-white tracking-wide truncate">{currentLevelData?.title}</h2>
                    </div>
                    <p className="text-sm text-slate-200 leading-snug opacity-90 truncate">{currentLevelData?.task}</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-2xl border border-slate-700 shrink-0">
                   <button 
                    onClick={() => { audio.play('CLICK'); setCode(currentLevelData?.starterCode || ''); }}
                    className="h-full px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-xl transition-colors flex flex-col items-center justify-center gap-1 min-w-[64px]"
                    title={ui.resetBtn}
                   >
                     <RotateCcw size={18} />
                     <span className="text-[10px] uppercase font-bold">{ui.resetBtn.includes(' ') ? 'Reset' : ui.resetBtn}</span>
                   </button>
                   
                   <button 
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="h-full px-6 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-900/20 transition-all active:scale-95 border-b-4 border-green-700 hover:border-green-600 flex flex-col items-center justify-center gap-1 min-w-[80px]"
                   >
                     {isRunning ? (
                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                     ) : (
                       <Play size={20} fill="currentColor" />
                     )}
                     <span className="text-[10px] uppercase font-bold">{ui.runBtn}</span>
                   </button>
                </div>
              </div>

              {/* EDITOR */}
              <div className="flex-1 min-h-0 relative shadow-2xl rounded-xl overflow-hidden border-2 border-slate-700/50">
                <CodeEditor 
                  code={code} onChange={setCode} 
                  placeholder={currentLevelData?.starterCode}
                />
              </div>

              {/* OUTPUT */}
              <div className="h-[25%] bg-[#1e1e1e] rounded-xl border border-slate-700 flex flex-col overflow-hidden shrink-0 shadow-lg font-mono text-sm group">
                <div className="px-4 py-2 bg-[#2d2d2d] border-b border-[#3e3e42] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-slate-400" />
                    <span className="text-xs text-slate-400 font-bold tracking-wider">{ui.outputTitle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     {runStatus === 'success' && <span className="flex items-center gap-1 text-[10px] text-green-400 uppercase font-bold"><CheckCircle size={10}/> Success</span>}
                     {runStatus === 'error' && <span className="flex items-center gap-1 text-[10px] text-red-400 uppercase font-bold"><XCircle size={10}/> Error</span>}
                  </div>
                </div>
                
                <div className="p-4 overflow-y-auto custom-scrollbar flex-1 whitespace-pre-wrap code-font bg-[#1e1e1e]/90">
                  {runStatus === 'idle' && <span className="text-slate-500 italic opacity-70">$ python3 magic_script.py</span>}
                  
                  {runStatus === 'running' && (
                     <div className="text-yellow-400 animate-pulse flex items-center gap-2">
                       <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"/> 
                       executing magic_script.py...
                     </div>
                  )}

                  {runStatus === 'success' && output && (
                    <div className="text-green-300 animate-in fade-in duration-300">
                      <span className="text-slate-500 block mb-2 select-none text-xs">$ python3 magic_script.py</span>
                      {output}
                    </div>
                  )}

                  {runStatus === 'error' && (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                      <span className="text-slate-500 block mb-2 select-none text-xs">$ python3 magic_script.py</span>
                      <div className="text-red-300 bg-red-950/30 border-l-2 border-red-500/50 p-3 rounded-r-lg font-mono text-xs md:text-sm">
                         <div className="flex items-center gap-2 font-bold mb-2 text-red-400"><AlertTriangle size={14}/> Runtime Error / Syntax Error</div>
                         {output}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Coach Chat */}
            <div className="flex-1 min-w-[320px] max-w-md shrink-0 h-[calc(100%-150px)] self-start rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <CoachChat 
                messages={messages} onSendMessage={handleSendMessage} isLoading={isChatLoading} language={userState.language}
                voice={userState.settings.voiceURI} persona={userState.settings.persona} onUpdateSettings={updateSettings}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
