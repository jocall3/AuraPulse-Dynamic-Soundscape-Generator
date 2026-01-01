
export interface EnvironmentalData {
  weatherCondition: 'CLEAR' | 'CLOUDY' | 'RAIN' | 'STORM' | 'SNOW' | 'FOG';
  temperatureCelsius: number;
  humidityPercentage: number;
  windSpeedKPH: number;
  timeOfDay: 'DAWN' | 'MORNING' | 'MIDDAY' | 'AFTERNOON' | 'DUSK' | 'NIGHT';
  ambientNoiseLevelDB: number;
  geoCoordinates: { lat: number; lon: number };
  locationName: string;
}

export interface OfficeSensorData {
  occupancyCount: number;
  averageActivityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  meetingRoomStatus: { roomId: string; isOccupied: boolean; schedule: string }[];
  calendarEvents: { eventName: string; startTime: string; endTime: string; impact: 'HIGH' | 'MEDIUM' | 'LOW' }[];
  energyConsumptionKW: number;
}

export interface EffectConfig {
  id: string;
  type: 'REVERB' | 'DELAY' | 'EQ' | 'COMPRESSOR' | 'SPATIALIZER' | 'LOWPASS' | 'HIGHPASS';
  params: Record<string, any>;
  isEnabled: boolean;
}

export interface SoundLayerConfig {
  id: string;
  name: string;
  assetId: string;
  volume: number;
  pan: number;
  isEnabled: boolean;
  isMuted: boolean;
  isSoloed: boolean;
  loop: boolean;
  startTimeOffsetSeconds: number;
  endTimeOffsetSeconds: number;
  spatialCoordinates?: { x: number; y: number; z: number };
  effects: EffectConfig[];
}

export interface SoundAsset {
  id: string;
  name: string;
  category: 'AMBIENT' | 'NATURE' | 'MUSIC' | 'VOICES' | 'MACHINES' | 'EFFECTS';
  filePath: string;
  durationSeconds: number;
  tags: string[];
  description?: string;
  isCustomUpload: boolean;
}

export interface RuleConfig {
  id: string;
  name: string;
  trigger: 'ENVIRONMENT' | 'OFFICE_ACTIVITY' | 'TIME' | 'MANUAL';
  condition: string;
  action: 'ACTIVATE_PRESET' | 'MODIFY_LAYER' | 'ADJUST_VOLUME' | 'ADD_EFFECT' | 'REMOVE_EFFECT' | 'TOGGLE_LAYER' | 'SEND_NOTIFICATION';
  actionParams: Record<string, any>;
  priority: number;
  isEnabled: boolean;
}

export interface SoundscapePreset {
  id: string;
  name: string;
  description: string;
  layers: SoundLayerConfig[];
  adaptiveRules: RuleConfig[];
  tags: string[];
  isCustom: boolean;
  createdByUserId?: string;
  lastModified?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  favoritePresets: string[];
  customSoundscapes: SoundscapePreset[];
  personalSettings: {
    masterVolume: number;
    spatialAudioEnabled: boolean;
    notificationsEnabled: boolean;
    preferredLanguage: string;
    aiRecommendationsEnabled: boolean;
    theme: 'DARK' | 'LIGHT';
  };
  lastActiveSoundscapeId?: string;
  sessionHistory: { timestamp: string; presetId: string; durationMinutes: number }[];
}

export interface Notification {
  id: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'AGENT_ACTION';
  message: string;
  timestamp: string;
  isRead: boolean;
  details?: Record<string, any>;
}

export interface AudioEnginePlaybackState {
  isPlaying: boolean;
  currentPlaybackTimeSeconds: number;
  bufferedSources: { assetId: string; status: 'LOADING' | 'READY' | 'ERROR' }[];
  outputDevice: string;
  masterVolume: number;
  spatialAudioEnabled: boolean;
  lowLatencyMode: boolean;
}

export interface SoundscapeAppState {
  globalSettings: {
    masterVolume: number;
    aiRecommendationMode: 'OFF' | 'AMBIENT' | 'FOCUS' | 'ENERGY';
    spatialAudioEnabled: boolean;
    lowLatencyMode: boolean;
    activeProfileId: string;
    theme: 'DARK' | 'LIGHT';
  };
  environmentalData: EnvironmentalData;
  officeSensorData: OfficeSensorData;
  userProfiles: UserProfile[];
  soundAssets: SoundAsset[];
  availablePresets: SoundscapePreset[];
  activeSoundscape: {
    id: string;
    name: string;
    description: string;
    layers: SoundLayerConfig[];
    activeAdaptiveRules: RuleConfig[];
    startTime: string;
    lastUpdated: string;
    currentRecommendation?: string;
    lastAgentActivity?: { timestamp: string; agentId: string; message: string; action: string };
  };
  audioEngine: AudioEnginePlaybackState;
  notifications: Notification[];
  logs: { timestamp: string; level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR'; message: string }[];
  isLoading: boolean;
  error: string | null;
  activeAdminTab: 'ASSETS' | 'PRESETS' | 'RULES' | 'SYSTEM_LOGS';
  activeProfileManagementTab: 'OVERVIEW' | 'CUSTOM_SOUNDSCAPES' | 'HISTORY';
  activeSettingsTab: 'GENERAL' | 'AUDIO' | 'SENSORS' | 'NOTIFICATIONS';
  activeDashboardTab: 'OVERVIEW' | 'MIXER' | 'RECOMMENDATIONS';
}

export type SoundscapeAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_ENVIRONMENTAL_DATA'; payload: Partial<EnvironmentalData> }
  | { type: 'UPDATE_OFFICE_SENSOR_DATA'; payload: Partial<OfficeSensorData> }
  | { type: 'SET_ACTIVE_SOUNDSCAPE_PRESET'; payload: { presetId: string; userId?: string } }
  | { type: 'PLAY_SOUNDSCAPE' }
  | { type: 'PAUSE_SOUNDSCAPE' }
  | { type: 'STOP_SOUNDSCAPE' }
  | { type: 'ADJUST_MASTER_VOLUME'; payload: number }
  | { type: 'TOGGLE_SPATIAL_AUDIO'; payload: boolean }
  | { type: 'TOGGLE_AI_RECOMMENDATION_MODE'; payload: SoundscapeAppState['globalSettings']['aiRecommendationMode'] }
  | { type: 'UPDATE_LAYER_CONFIG'; payload: { layerId: string; updates: Partial<SoundLayerConfig> } }
  | { type: 'ADD_LAYER_TO_ACTIVE_SOUNDSCAPE'; payload: SoundLayerConfig }
  | { type: 'REMOVE_LAYER_FROM_ACTIVE_SOUNDSCAPE'; payload: string }
  | { type: 'ADD_EFFECT_TO_LAYER'; payload: { layerId: string; effect: EffectConfig } }
  | { type: 'REMOVE_EFFECT_FROM_LAYER'; payload: { layerId: string; effectId: string } }
  | { type: 'UPDATE_EFFECT_CONFIG'; payload: { layerId: string; effectId: string; updates: Partial<EffectConfig> } }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_AS_READ'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'ADD_LOG'; payload: SoundscapeAppState['logs'][0] }
  | { type: 'SET_ACTIVE_PROFILE'; payload: string }
  | { type: 'ADD_USER_PROFILE'; payload: UserProfile }
  | { type: 'UPDATE_USER_PROFILE'; payload: { userId: string; updates: Partial<UserProfile> } }
  | { type: 'ADD_CUSTOM_SOUNDSCAPE_TO_PROFILE'; payload: { userId: string; soundscape: SoundscapePreset } }
  | { type: 'DELETE_CUSTOM_SOUNDSCAPE_FROM_PROFILE'; payload: { userId: string; soundscapeId: string } }
  | { type: 'UPDATE_SOUND_ASSET'; payload: { assetId: string; updates: Partial<SoundAsset> } }
  | { type: 'ADD_SOUND_ASSET'; payload: SoundAsset }
  | { type: 'DELETE_SOUND_ASSET'; payload: string }
  | { type: 'UPDATE_PRESET'; payload: { presetId: string; updates: Partial<SoundscapePreset> } }
  | { type: 'ADD_PRESET'; payload: SoundscapePreset }
  | { type: 'DELETE_PRESET'; payload: string }
  | { type: 'UPDATE_RULE_CONFIG'; payload: { ruleId: string; updates: Partial<RuleConfig> } }
  | { type: 'ADD_RULE_CONFIG'; payload: RuleConfig }
  | { type: 'DELETE_RULE_CONFIG'; payload: string }
  | { type: 'SET_AUDIO_OUTPUT_DEVICE'; payload: string }
  | { type: 'SET_LOW_LATENCY_MODE'; payload: boolean }
  | { type: 'SET_ACTIVE_DASHBOARD_TAB'; payload: SoundscapeAppState['activeDashboardTab'] }
  | { type: 'SET_ACTIVE_SETTINGS_TAB'; payload: SoundscapeAppState['activeSettingsTab'] }
  | { type: 'SET_ACTIVE_PROFILE_MANAGEMENT_TAB'; payload: SoundscapeAppState['activeProfileManagementTab'] }
  | { type: 'SET_ACTIVE_ADMIN_TAB'; payload: SoundscapeAppState['activeAdminTab'] }
  | { type: 'UPDATE_GLOBAL_SETTINGS'; payload: Partial<SoundscapeAppState['globalSettings']> }
  | { type: 'UPDATE_PLAYBACK_TIME'; payload: number }
  | { type: 'SET_AGENT_ACTIVITY'; payload: SoundscapeAppState['activeSoundscape']['lastAgentActivity'] }
  | { type: 'INITIALIZE_STATE'; payload: SoundscapeAppState }
  | { type: 'RESET_STATE' };
