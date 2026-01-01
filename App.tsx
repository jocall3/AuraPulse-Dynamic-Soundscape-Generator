
import React, { useReducer, useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_STATE } from './constants';
import { soundscapeReducer, generateUniqueId } from './logic';
import { TabButton, InfoCard, IconButton, Slider } from './components/UI';
import { getAIRecommendation } from './services/gemini';
import { SoundscapeAppState, SoundscapeAction } from './types';

const App: React.FC = () => {
  const [state, dispatch] = useReducer(soundscapeReducer, INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'MIXER' | 'PROFILES' | 'SETTINGS' | 'ADMIN'>('DASHBOARD');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Audio simulation state
  const [progress, setProgress] = useState(0);

  // Effect to handle AI Recommendations
  useEffect(() => {
    if (state.globalSettings.aiRecommendationMode === 'OFF') return;

    const fetchAiAdvice = async () => {
      setIsAiLoading(true);
      const advice = await getAIRecommendation(state.environmentalData, state.officeSensorData, state.availablePresets);
      if (advice) {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: generateUniqueId(),
            type: 'AGENT_ACTION',
            message: advice.reason,
            timestamp: new Date().toISOString(),
            isRead: false,
            details: { recommendedPresetId: advice.recommendedPresetId }
          }
        });
      }
      setIsAiLoading(false);
    };

    fetchAiAdvice();
    const interval = setInterval(fetchAiAdvice, 120000); // Poll Gemini every 2 mins
    return () => clearInterval(interval);
  }, [state.globalSettings.aiRecommendationMode, state.environmentalData, state.officeSensorData, state.availablePresets]);

  // Simulated playback progress
  useEffect(() => {
    if (!state.audioEngine.isPlaying) return;
    const interval = setInterval(() => {
      setProgress(p => (p + 1) % 100);
      dispatch({ type: 'UPDATE_PLAYBACK_TIME', payload: state.audioEngine.currentPlaybackTimeSeconds + 1 });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.audioEngine.isPlaying, state.audioEngine.currentPlaybackTimeSeconds]);

  const handlePlayToggle = () => {
    if (state.audioEngine.isPlaying) dispatch({ type: 'PAUSE_SOUNDSCAPE' });
    else dispatch({ type: 'PLAY_SOUNDSCAPE' });
  };

  const handlePresetSelect = (id: string) => {
    dispatch({ type: 'SET_ACTIVE_SOUNDSCAPE_PRESET', payload: { presetId: id } });
  };

  const activeProfile = state.userProfiles.find(p => p.id === state.globalSettings.activeProfileId);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${state.globalSettings.theme === 'DARK' ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <i className="fas fa-wave-square text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase">
                AuraPulse
              </h1>
              <p className="text-xs font-bold text-slate-500 tracking-[0.2em] uppercase">Dynamic Intelligence Soundscape</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-2 bg-slate-900/50 backdrop-blur rounded-2xl border border-slate-800">
            <div className="flex flex-col items-end px-4">
              <span className="text-xs font-bold text-slate-500 uppercase">{activeProfile?.username}</span>
              <span className="text-[10px] font-medium text-cyan-400 uppercase tracking-tighter">Premium Agentic Node</span>
            </div>
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
              <i className="fas fa-user-shield text-slate-400"></i>
            </div>
          </div>
        </header>

        {/* Global Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          <div className="lg:col-span-3 bg-slate-900/40 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center gap-8">
             <div className="relative group">
                <div className={`absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl transition-opacity duration-500 ${state.audioEngine.isPlaying ? 'opacity-100' : 'opacity-0'}`}></div>
                <button 
                  onClick={handlePlayToggle}
                  className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl 
                  ${state.audioEngine.isPlaying ? 'bg-cyan-500 text-white scale-105' : 'bg-slate-800 text-slate-400 hover:scale-105 hover:bg-slate-700'}`}
                >
                  <i className={`fas ${state.audioEngine.isPlaying ? 'fa-pause' : 'fa-play'} text-3xl`}></i>
                </button>
             </div>
             <div className="flex-1 space-y-4 w-full">
                <div className="flex justify-between items-end">
                   <div>
                      <h2 className="text-xl font-bold text-white">{state.activeSoundscape.name}</h2>
                      <p className="text-sm text-slate-500 font-medium">{state.activeSoundscape.description}</p>
                   </div>
                   <div className="text-right">
                      <span className="text-3xl font-black text-cyan-400 font-mono">
                        {Math.floor(state.audioEngine.currentPlaybackTimeSeconds / 60).toString().padStart(2, '0')}:
                        {(state.audioEngine.currentPlaybackTimeSeconds % 60).toString().padStart(2, '0')}
                      </span>
                   </div>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                </div>
             </div>
          </div>
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 flex flex-col justify-center gap-4">
             <Slider 
               label="Master Volume" 
               value={state.globalSettings.masterVolume} 
               onChange={(v) => dispatch({ type: 'ADJUST_MASTER_VOLUME', payload: v })}
             />
             <div className="flex justify-between gap-4">
                <IconButton 
                  icon="fa-expand" 
                  active={state.globalSettings.spatialAudioEnabled} 
                  onClick={() => dispatch({ type: 'TOGGLE_SPATIAL_AUDIO', payload: !state.globalSettings.spatialAudioEnabled })} 
                />
                <IconButton 
                  icon="fa-bolt-lightning" 
                  active={state.globalSettings.lowLatencyMode} 
                  onClick={() => dispatch({ type: 'SET_LOW_LATENCY_MODE', payload: !state.globalSettings.lowLatencyMode })} 
                />
                <IconButton 
                  icon="fa-robot" 
                  active={state.globalSettings.aiRecommendationMode !== 'OFF'} 
                  onClick={() => dispatch({ type: 'TOGGLE_AI_RECOMMENDATION_MODE', payload: state.globalSettings.aiRecommendationMode === 'OFF' ? 'AMBIENT' : 'OFF' })} 
                />
             </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-8 overflow-x-auto">
          <TabButton label="Dashboard" isActive={activeTab === 'DASHBOARD'} onClick={() => setActiveTab('DASHBOARD')} icon="fa-chart-pie" />
          <TabButton label="Mixer" isActive={activeTab === 'MIXER'} onClick={() => setActiveTab('MIXER')} icon="fa-sliders" />
          <TabButton label="Profiles" isActive={activeTab === 'PROFILES'} onClick={() => setActiveTab('PROFILES')} icon="fa-address-card" />
          <TabButton label="Settings" isActive={activeTab === 'SETTINGS'} onClick={() => setActiveTab('SETTINGS')} icon="fa-cog" />
          <TabButton label="Admin" isActive={activeTab === 'ADMIN'} onClick={() => setActiveTab('ADMIN')} icon="fa-shield-halved" />
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {activeTab === 'DASHBOARD' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                <InfoCard title="Weather" value={state.environmentalData.weatherCondition} icon="fa-cloud-sun" />
                <InfoCard title="Temp" value={state.environmentalData.temperatureCelsius} unit="°C" icon="fa-thermometer" colorClass="text-orange-400" />
                <InfoCard title="Activity" value={state.officeSensorData.averageActivityLevel} icon="fa-chart-line" colorClass="text-purple-400" />
                <InfoCard title="Occupancy" value={state.officeSensorData.occupancyCount} unit="ppl" icon="fa-users" colorClass="text-green-400" />
                <InfoCard title="Time" value={state.environmentalData.timeOfDay} icon="fa-clock" colorClass="text-yellow-400" />
                <InfoCard title="Noise" value={state.environmentalData.ambientNoiseLevelDB} unit="dB" icon="fa-ear-listen" colorClass="text-pink-400" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                   <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold">Recommended Presets</h3>
                      {isAiLoading && <span className="text-xs font-bold text-cyan-400 animate-pulse uppercase">AI Agent Analyzing...</span>}
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {state.availablePresets.map(preset => (
                        <div 
                          key={preset.id} 
                          onClick={() => handlePresetSelect(preset.id)}
                          className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] 
                          ${state.activeSoundscape.id === preset.id ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-900/40 border-slate-800'}`}
                        >
                          <div className="flex justify-between items-start mb-4">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${state.activeSoundscape.id === preset.id ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                <i className="fas fa-music"></i>
                             </div>
                             {state.activeSoundscape.id === preset.id && <span className="bg-cyan-500 text-[10px] font-black px-2 py-0.5 rounded text-white uppercase">Active</span>}
                          </div>
                          <h4 className="font-bold text-white mb-1">{preset.name}</h4>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">{preset.description}</p>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-xl font-bold">AI Agent Insights</h3>
                   <div className="space-y-4">
                      {state.notifications.filter(n => n.type === 'AGENT_ACTION').length === 0 ? (
                        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 border-dashed flex flex-col items-center justify-center text-center">
                           <i className="fas fa-robot text-slate-700 text-4xl mb-4"></i>
                           <p className="text-slate-500 text-sm font-medium">Awaiting next agent recommendation cycle...</p>
                        </div>
                      ) : (
                        state.notifications.filter(n => n.type === 'AGENT_ACTION').slice(0, 3).map(n => (
                          <div key={n.id} className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 flex gap-4">
                             <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                                <i className="fas fa-sparkles"></i>
                             </div>
                             <div className="space-y-1">
                                <p className="text-sm font-medium leading-relaxed italic">"{n.message}"</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase">{new Date(n.timestamp).toLocaleTimeString()}</p>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'MIXER' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-6">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Active Layers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {state.activeSoundscape.layers.map(layer => (
                      <div key={layer.id} className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6">
                         <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-cyan-400">
                                  <i className="fas fa-layer-group"></i>
                               </div>
                               <h4 className="font-bold">{layer.name}</h4>
                            </div>
                            <div className="flex gap-2">
                               <IconButton icon={layer.isMuted ? 'fa-volume-mute' : 'fa-volume-up'} active={!layer.isMuted} onClick={() => dispatch({ type: 'UPDATE_LAYER_CONFIG', payload: { layerId: layer.id, updates: { isMuted: !layer.isMuted } } })} />
                               <IconButton icon="fa-trash" danger onClick={() => dispatch({ type: 'REMOVE_LAYER_FROM_ACTIVE_SOUNDSCAPE', payload: layer.id })} />
                            </div>
                         </div>
                         <div className="space-y-4">
                            <Slider 
                              label="Layer Gain" 
                              value={layer.volume} 
                              onChange={(v) => dispatch({ type: 'UPDATE_LAYER_CONFIG', payload: { layerId: layer.id, updates: { volume: v } } })} 
                            />
                            <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                               <span>Panning</span>
                               <span className="text-cyan-400">{layer.pan < 0 ? 'Left' : layer.pan > 0 ? 'Right' : 'Center'}</span>
                            </div>
                            <input
                              type="range"
                              min="-1"
                              max="1"
                              step="0.01"
                              value={layer.pan}
                              onChange={(e) => dispatch({ type: 'UPDATE_LAYER_CONFIG', payload: { layerId: layer.id, updates: { pan: parseFloat(e.target.value) } } })}
                              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                            />
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
               
               <div className="space-y-6">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Asset Library</h3>
                  <div className="space-y-4">
                     {state.soundAssets.map(asset => (
                       <div key={asset.id} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between group hover:border-cyan-500/30 transition-all">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-cyan-400 transition-colors">
                                <i className="fas fa-music"></i>
                             </div>
                             <div>
                                <h5 className="text-sm font-bold text-slate-200">{asset.name}</h5>
                                <p className="text-[10px] font-bold text-slate-500 uppercase">{asset.category}</p>
                             </div>
                          </div>
                          <button 
                            onClick={() => dispatch({ 
                              type: 'ADD_LAYER_TO_ACTIVE_SOUNDSCAPE', 
                              payload: { 
                                id: generateUniqueId(), 
                                name: asset.name, 
                                assetId: asset.id, 
                                volume: 0.5, 
                                pan: 0, 
                                isEnabled: true, 
                                isMuted: false, 
                                isSoloed: false, 
                                loop: true, 
                                startTimeOffsetSeconds: 0, 
                                endTimeOffsetSeconds: 0, 
                                effects: [] 
                              } 
                            })}
                            className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-500 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-all"
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'SETTINGS' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto space-y-8">
               <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 space-y-8">
                  <div className="flex items-center gap-4 mb-4">
                     <i className="fas fa-sliders text-cyan-400 text-xl"></i>
                     <h3 className="text-xl font-bold">Preferences</h3>
                  </div>
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <div>
                           <h4 className="font-bold">Dark Mode</h4>
                           <p className="text-xs text-slate-500 font-medium">Toggle deep space interface aesthetics.</p>
                        </div>
                        <IconButton 
                          icon={state.globalSettings.theme === 'DARK' ? 'fa-moon' : 'fa-sun'} 
                          active={state.globalSettings.theme === 'DARK'} 
                          onClick={() => dispatch({ type: 'UPDATE_GLOBAL_SETTINGS', payload: { theme: state.globalSettings.theme === 'DARK' ? 'LIGHT' : 'DARK' } })} 
                        />
                     </div>
                     <div className="flex items-center justify-between">
                        <div>
                           <h4 className="font-bold">AI Recommendations</h4>
                           <p className="text-xs text-slate-500 font-medium">Autonomous environmental analysis and guidance.</p>
                        </div>
                        <IconButton 
                          icon="fa-robot" 
                          active={state.globalSettings.aiRecommendationMode !== 'OFF'} 
                          onClick={() => dispatch({ type: 'TOGGLE_AI_RECOMMENDATION_MODE', payload: state.globalSettings.aiRecommendationMode === 'OFF' ? 'AMBIENT' : 'OFF' })} 
                        />
                     </div>
                  </div>
               </div>
               <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">AuraPulse Operational Node v3.1.2</p>
               </div>
            </div>
          )}
          
          {/* Fallback for other tabs */}
          {(activeTab === 'PROFILES' || activeTab === 'ADMIN') && (
            <div className="animate-in fade-in duration-500 h-[300px] flex flex-col items-center justify-center text-center opacity-40">
               <i className="fas fa-helmet-safety text-5xl mb-4 text-cyan-400"></i>
               <h3 className="text-xl font-bold mb-1 uppercase tracking-tight">{activeTab} Interface Under Maintenance</h3>
               <p className="text-sm font-medium">Protocols are being updated for enhanced security.</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <footer className="mt-24 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-600">
           <div className="text-[10px] font-black uppercase tracking-widest">&copy; {new Date().getFullYear()} Build Phase • Advanced Auditory Infrastructure</div>
           <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
              <a href="#" className="hover:text-cyan-400 transition-colors">Documentation</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Protocols</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Node Registry</a>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
