
import React from 'react';
import { ALL_COURSES, getCourseById, getLevels, UI_STRINGS } from '../constants';
import { ConceptLevel, UserState } from '../types';
import { Lock, Star, Play, Trophy, Users, User } from 'lucide-react';
import { audio } from '../services/audioService';

interface LevelMapProps {
  userState: UserState;
  selectedCourseId: string;
  conceptProgress: {
    currentLevel: number;
    levelStars: Record<number, number>;
  };
  onSelectLevel: (id: number) => void;
  onSelectBank: (bank: 'A' | 'B' | 'C') => void;
  onSelectCourse: (courseId: string) => void;
  onSwitchUser: () => void;
  onShowLeaderboard: () => void;
}

const LevelMap: React.FC<LevelMapProps> = ({
  userState,
  selectedCourseId,
  conceptProgress,
  onSelectLevel,
  onSelectBank,
  onSelectCourse,
  onSwitchUser,
  onShowLeaderboard
}) => {
  const selectedCourse = getCourseById(selectedCourseId);
  const isConceptCourse = selectedCourse?.type === 'concept';
  const levels = isConceptCourse
    ? (selectedCourse?.levels as ConceptLevel[])
    : getLevels(userState.language, userState.currentBank);
  const ui = UI_STRINGS[userState.language];

  const [mapFilter, setMapFilter] = React.useState<string>('all');

  const mapOptions = React.useMemo(() => {
    if (!isConceptCourse) return [];
    const set = new Set<string>();
    (levels as ConceptLevel[]).forEach(l => { if (l.map) set.add(l.map); });
    return Array.from(set);
  }, [isConceptCourse, levels]);

  React.useEffect(() => {
    if (isConceptCourse && mapOptions.length > 0) {
      setMapFilter(mapOptions[0]);
    } else {
      setMapFilter('all');
    }
  }, [selectedCourseId, isConceptCourse, mapOptions]);

  const filteredLevels = React.useMemo(() => {
    if (!isConceptCourse || mapFilter === 'all') return levels;
    return (levels as ConceptLevel[]).filter(l => l.map === mapFilter);
  }, [isConceptCourse, levels, mapFilter]);

  const handleBankChange = (bank: 'A' | 'B' | 'C') => {
    audio.play('CLICK');
    onSelectBank(bank);
  };

  const handleCourseChange = (courseId: string) => {
    audio.play('CLICK');
    onSelectCourse(courseId);
  };

  const currentLevelNumber = isConceptCourse ? conceptProgress.currentLevel : userState.currentLevel;
  const levelStarMap = isConceptCourse ? conceptProgress.levelStars : userState.levelStars;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 relative custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-12 gap-6">
          
          {/* Left: Title + User Controls (Grouped Together) */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 drop-shadow-sm flex items-center gap-3 animate-float">
              <Trophy className="text-yellow-500" size={40} />
              {ui.mapTitle}
            </h2>

            {/* Switch User Button - Placed right next to Title */}
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => { audio.play('CLICK'); onSwitchUser(); }}
                    className="flex items-center gap-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/20 group border border-indigo-400/30"
                    title={ui.switchUser}
                >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/10">
                    <User size={16} className="text-white" />
                    </div>
                    <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] text-indigo-200 uppercase tracking-wider font-bold">{ui.player}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm truncate max-w-[100px]">{userState.name}</span>
                        <span className="bg-indigo-800 text-indigo-200 text-[9px] px-1.5 rounded border border-indigo-400/30 font-mono">
                        {userState.currentBank}
                        </span>
                    </div>
                    </div>
                </button>

                <button 
                    onClick={() => { audio.play('CLICK'); onShowLeaderboard(); }}
                    className="p-3 text-yellow-500 hover:text-yellow-400 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors shadow-md"
                    title={ui.leaderboard}
                >
                    <Trophy size={20} />
                </button>
            </div>
          </div>

          {/* Right: Course Selector */}
          <div className="flex flex-col gap-3 self-start xl:self-auto">
            <div className="flex flex-wrap gap-2">
              {ALL_COURSES.map(course => (
                <button
                  key={course.id}
                  onClick={() => handleCourseChange(course.id)}
                  className={`px-4 py-2 rounded-xl font-bold transition-all border ${
                    selectedCourseId === course.id
                      ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-900/40'
                      : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span className="mr-2">{course.icon}</span>
                  {course.name}
                </button>
              ))}
            </div>

            {isConceptCourse && mapOptions.length > 0 && (
              <div className="bg-slate-800 p-2 rounded-2xl border border-slate-700 flex items-center gap-2 shadow-xl flex-wrap">
                <div className="flex items-center gap-2 px-3 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <Users size={14} />
                  <span>地图</span>
                </div>
                <button
                  onClick={() => setMapFilter('all')}
                  className={`px-3 py-1 rounded-lg text-sm font-bold ${
                    mapFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  全部
                </button>
                {mapOptions.map(map => (
                  <button
                    key={map}
                    onClick={() => setMapFilter(map)}
                    className={`px-3 py-1 rounded-lg text-sm font-bold ${
                      mapFilter === map ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {map}
                  </button>
                ))}
              </div>
            )}

            {!isConceptCourse && (
              <div className="bg-slate-800 p-2 rounded-2xl border border-slate-700 flex items-center gap-3 shadow-xl">
                <div className="flex items-center gap-2 px-3 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <Users size={14} />
                  <span>{ui.bankSelector}</span>
                </div>
                <div className="flex gap-1">
                  {(['A', 'B', 'C'] as const).map(bank => (
                    <button
                      key={bank}
                      onClick={() => handleBankChange(bank)}
                      className={`w-10 h-10 rounded-xl font-black text-lg transition-all transform hover:scale-110 ${
                        userState.currentBank === bank 
                        ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg scale-110 ring-2 ring-white/20' 
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredLevels.map((level) => {
            const isUnlocked = isConceptCourse ? level.id <= currentLevelNumber : level.id <= currentLevelNumber;
            const stars = levelStarMap[level.id] || 0;
            const isCompleted = stars > 0;

            return (
              <div
                key={level.id}
                onClick={() => {
                   if(isUnlocked) {
                     audio.play('START');
                     onSelectLevel(level.id);
                   }
                }}
                className={`relative group rounded-3xl p-6 transition-all duration-300 transform border-b-4 
                  ${isUnlocked 
                    ? 'cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(168,85,247,0.4)] bg-slate-800 border-indigo-900 hover:border-indigo-500' 
                    : 'opacity-50 grayscale bg-slate-900 border-slate-800 cursor-not-allowed'
                  }
                `}
              >
                {isUnlocked && !isConceptCourse && (
                  <div className="absolute top-4 right-4 bg-slate-900/50 rounded-lg px-2 py-1 text-[10px] font-mono text-slate-300 border border-slate-700">
                    ⏱️ {level.timeLimit}s
                  </div>
                )}
                {isUnlocked && isConceptCourse && (
                  <div className="absolute top-4 right-4 bg-blue-900/50 rounded-lg px-2 py-1 text-[10px] font-mono text-blue-200 border border-blue-700">
                    概念关卡
                  </div>
                )}

                <div className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl mb-4 shadow-inner
                  ${isCompleted ? 'bg-green-500 text-white' : level.id === currentLevelNumber ? 'bg-yellow-500 text-black animate-pulse' : 'bg-slate-700 text-slate-500'}
                `}>
                  {level.id}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-300 truncate">
                    {level.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 h-8">{level.description}</p>
                  <div className="flex gap-2 mt-2">
                    {('difficulty' in level) && (level as ConceptLevel).difficulty && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        (level as ConceptLevel).difficulty === 'easy' ? 'bg-green-700/60 text-green-100' :
                        (level as ConceptLevel).difficulty === 'medium' ? 'bg-blue-700/60 text-blue-100' :
                        (level as ConceptLevel).difficulty === 'hard' ? 'bg-orange-700/60 text-orange-100' :
                        'bg-red-700/60 text-red-100'
                      }`}>
                        {(level as ConceptLevel).difficulty}
                      </span>
                    )}
                    {(level as ConceptLevel).map && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-200">
                        {(level as ConceptLevel).map}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  {isCompleted ? (
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <Star key={i} size={20} className={i <= stars ? "text-yellow-400 fill-yellow-400" : "text-slate-700 fill-slate-700"} />
                      ))}
                    </div>
                  ) : !isUnlocked ? (
                    <Lock className="text-slate-600" size={20} />
                  ) : (
                    <span className="text-yellow-500 font-bold text-sm uppercase tracking-wider flex items-center gap-1">
                      {ui.playNow} <Play size={14} fill="currentColor"/>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelMap;
