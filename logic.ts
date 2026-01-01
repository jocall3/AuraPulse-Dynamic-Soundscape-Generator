
import { SoundscapeAppState, SoundscapeAction } from './types';
import { INITIAL_STATE } from './constants';

export const generateUniqueId = (): string => Math.random().toString(36).substring(2, 15);

export const soundscapeReducer = (state: SoundscapeAppState, action: SoundscapeAction): SoundscapeAppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_ACTIVE_SOUNDSCAPE_PRESET': {
      const selectedPreset = state.availablePresets.find(p => p.id === action.payload.presetId);
      if (!selectedPreset) return state;
      // Fix: Explicitly map SoundscapePreset to the activeSoundscape structure, mapping adaptiveRules to activeAdaptiveRules
      return {
        ...state,
        activeSoundscape: {
          id: selectedPreset.id,
          name: selectedPreset.name,
          description: selectedPreset.description,
          layers: selectedPreset.layers,
          activeAdaptiveRules: selectedPreset.adaptiveRules,
          startTime: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        },
        audioEngine: { ...state.audioEngine, isPlaying: true, currentPlaybackTimeSeconds: 0 },
        logs: [...state.logs, { timestamp: new Date().toISOString(), level: 'INFO', message: `Soundscape switched to ${selectedPreset.name}` }]
      };
    }
    case 'PLAY_SOUNDSCAPE':
      return { ...state, audioEngine: { ...state.audioEngine, isPlaying: true } };
    case 'PAUSE_SOUNDSCAPE':
      return { ...state, audioEngine: { ...state.audioEngine, isPlaying: false } };
    case 'ADJUST_MASTER_VOLUME':
      return { 
        ...state, 
        globalSettings: { ...state.globalSettings, masterVolume: action.payload },
        audioEngine: { ...state.audioEngine, masterVolume: action.payload }
      };
    case 'TOGGLE_SPATIAL_AUDIO':
      return { 
        ...state, 
        globalSettings: { ...state.globalSettings, spatialAudioEnabled: action.payload },
        audioEngine: { ...state.audioEngine, spatialAudioEnabled: action.payload }
      };
    case 'SET_LOW_LATENCY_MODE':
        return { 
          ...state, 
          globalSettings: { ...state.globalSettings, lowLatencyMode: action.payload },
          audioEngine: { ...state.audioEngine, lowLatencyMode: action.payload }
        };
    case 'TOGGLE_AI_RECOMMENDATION_MODE':
      return { 
        ...state, 
        globalSettings: { ...state.globalSettings, aiRecommendationMode: action.payload }
      };
    case 'UPDATE_LAYER_CONFIG':
      return {
        ...state,
        activeSoundscape: {
          ...state.activeSoundscape,
          layers: state.activeSoundscape.layers.map(l => l.id === action.payload.layerId ? { ...l, ...action.payload.updates } : l)
        }
      };
    case 'REMOVE_LAYER_FROM_ACTIVE_SOUNDSCAPE':
      return {
        ...state,
        activeSoundscape: {
          ...state.activeSoundscape,
          layers: state.activeSoundscape.layers.filter(l => l.id !== action.payload)
        }
      };
    case 'ADD_LAYER_TO_ACTIVE_SOUNDSCAPE':
        return {
          ...state,
          activeSoundscape: {
            ...state.activeSoundscape,
            layers: [...state.activeSoundscape.layers, action.payload]
          }
        };
    case 'UPDATE_PLAYBACK_TIME':
      return {
        ...state,
        audioEngine: { ...state.audioEngine, currentPlaybackTimeSeconds: action.payload }
      };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'UPDATE_GLOBAL_SETTINGS':
        return { ...state, globalSettings: { ...state.globalSettings, ...action.payload } };
    case 'RESET_STATE':
      return INITIAL_STATE;
    default:
      return state;
  }
};
