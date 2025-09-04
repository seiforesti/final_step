'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, Square, SkipForward, SkipBack, Settings, RefreshCw, MessageSquare, Globe, Languages, Headphones, Speaker, Smartphone, Monitor, Radio, Waves, Activity, BarChart3, Clock, Timer, Zap, Target, CheckCircle, XCircle, AlertTriangle, Info, Eye, EyeOff, Edit, Copy, Download, Upload, Save, FolderOpen, Plus, Minus, X, Check, Search, Filter, Star, Bookmark, Flag, Bell, BellOff, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreHorizontal, Volume, VolumeOff, Volume1, Sliders, Equalizer } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Racine System Imports
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';

// Types
import { 
  VoiceControlConfig,
  SpeechRecognitionResult,
  VoiceSynthesisConfig,
  VoiceCommand,
  VoiceProfile,
  AudioDevice,
  VoiceMetrics,
  SpeechPattern,
  LanguageModel,
  VoiceControlStatus,
  AudioQuality,
  NoiseFilter,
  VoicePersonalization,
  CommandHistory,
  VoiceTraining,
  SpeechEngineConfig,
  VoiceAnalytics,
  AccessibilityFeatures
} from '../../types/ai-assistant.types';

import {
  AIContext,
  SystemHealth,
  UserPermissions,
  WorkspaceContext
} from '../../types/racine-core.types';

// Utilities
import {
  initializeSpeechRecognition,
  initializeVoiceSynthesis,
  processVoiceCommand,
  trainVoiceModel,
  calibrateAudioInput,
  filterNoise,
  analyzeVoicePattern,
  personalizeVoice,
  validateVoiceCommand,
  optimizeAudioQuality
} from '../../utils/ai-assistant-utils';

// Constants
import {
  SUPPORTED_VOICE_LANGUAGES,
  VOICE_COMMANDS,
  AUDIO_DEVICES,
  SPEECH_ENGINES,
  VOICE_PROFILES,
  NOISE_FILTERS,
  ACCESSIBILITY_OPTIONS
} from '../../constants/ai-assistant-constants';

interface VoiceControlInterfaceProps {
  className?: string;
  enabledByDefault?: boolean;
  defaultLanguage?: string;
  onVoiceCommand?: (command: VoiceCommand) => void;
  onTranscription?: (text: string) => void;
  enableTraining?: boolean;
  accessibilityMode?: boolean;
}

interface VoiceControlPanelProps {
  isListening: boolean;
  onToggleListening: () => void;
  isSpeaking: boolean;
  onToggleSpeaking: () => void;
  confidence: number;
  currentText: string;
  commands: VoiceCommand[];
}

interface AudioVisualizerProps {
  audioData: number[];
  isActive: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface VoiceSettingsProps {
  config: VoiceControlConfig;
  onConfigUpdate: (config: Partial<VoiceControlConfig>) => void;
  devices: AudioDevice[];
  onDeviceSelect: (deviceId: string) => void;
}

interface CommandHistoryProps {
  commands: CommandHistory[];
  onCommandReplay: (commandId: string) => void;
  onCommandEdit: (commandId: string) => void;
  onCommandDelete: (commandId: string) => void;
}

interface VoiceTrainingProps {
  profile: VoiceProfile;
  onTrainingStart: () => void;
  onTrainingComplete: (results: VoiceTraining) => void;
  isTraining: boolean;
}

interface VoiceAnalyticsProps {
  analytics: VoiceAnalytics;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export const VoiceControlInterface: React.FC<VoiceControlInterfaceProps> = ({
  className = "",
  enabledByDefault = false,
  defaultLanguage = 'en-US',
  onVoiceCommand,
  onTranscription,
  enableTraining = true,
  accessibilityMode = false
}) => {
  // Hooks
  const {
    voiceControlConfig,
    speechRecognition,
    voiceSynthesis,
    voiceCommands,
    voiceMetrics,
    voiceProfile,
    commandHistory,
    voiceAnalytics,
    initializeVoiceControl,
    processVoiceInput,
    synthesizeVoiceOutput,
    trainVoiceProfile,
    updateVoiceConfig,
    isListening,
    isSpeaking,
    error
  } = useAIAssistant();

  const {
    systemHealth
  } = useRacineOrchestration();

  const {
    activeSPAContext
  } = useCrossGroupIntegration();

  const {
    currentUser,
    userPermissions
  } = useUserManagement();

  const {
    activeWorkspace
  } = useWorkspaceManagement();

  const {
    trackActivity
  } = useActivityTracker();

  // State
  const [activeTab, setActiveTab] = useState<'control' | 'settings' | 'history' | 'training' | 'analytics'>('control');
  const [voiceEnabled, setVoiceEnabled] = useState(enabledByDefault);
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [confidence, setConfidence] = useState(0);
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioData, setAudioData] = useState<number[]>([]);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [noiseFilterEnabled, setNoiseFilterEnabled] = useState(true);
  const [voicePersonalization, setVoicePersonalization] = useState(true);
  const [continuousListening, setContinuousListening] = useState(false);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(1.0);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState('default');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [accessibilityFeatures, setAccessibilityFeatures] = useState<AccessibilityFeatures>({
    voiceGuidance: accessibilityMode,
    visualIndicators: true,
    hapticFeedback: false,
    slowSpeech: false,
    highContrast: false,
    largeFonts: false
  });

  // Refs
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);

  // Computed Values
  const currentContext = useMemo<AIContext>(() => ({
    user: currentUser,
    workspace: activeWorkspace,
    activeSPA: activeSPAContext?.activeSPA || null,
    systemHealth,
    timestamp: new Date(),
    sessionId: crypto.randomUUID()
  }), [currentUser, activeWorkspace, activeSPAContext, systemHealth]);

  const supportedLanguages = useMemo(() => {
    return SUPPORTED_VOICE_LANGUAGES.filter(lang => 
      speechRecognition?.supportedLanguages?.includes(lang.code) || true
    );
  }, [speechRecognition]);

  const availableVoices = useMemo(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      return window.speechSynthesis.getVoices().filter(voice => 
        voice.lang.startsWith(selectedLanguage.substring(0, 2))
      );
    }
    return [];
  }, [selectedLanguage]);

  const voiceControlStatus = useMemo<VoiceControlStatus>(() => ({
    isEnabled: voiceEnabled,
    isListening,
    isSpeaking,
    currentLanguage: selectedLanguage,
    audioLevel,
    confidence,
    lastCommand: voiceCommands[0] || null,
    deviceStatus: 'connected'
  }), [voiceEnabled, isListening, isSpeaking, selectedLanguage, audioLevel, confidence, voiceCommands]);

  // Effects
  useEffect(() => {
    if (voiceEnabled) {
      initializeVoiceInterface();
    } else {
      cleanupVoiceInterface();
    }

    return () => {
      cleanupVoiceInterface();
    };
  }, [voiceEnabled]);

  useEffect(() => {
    if (voiceEnabled && continuousListening && !isListening) {
      startListening();
    }
  }, [voiceEnabled, continuousListening, isListening]);

  useEffect(() => {
    if (accessibilityFeatures.voiceGuidance && isSpeaking) {
      // Provide voice guidance for accessibility
      provideVoiceGuidance();
    }
  }, [accessibilityFeatures.voiceGuidance, isSpeaking]);

  useEffect(() => {
    // Update audio visualization
    if (isListening && analyserRef.current) {
      updateAudioVisualization();
    }
  }, [isListening]);

  // Voice Interface Initialization
  const initializeVoiceInterface = useCallback(async () => {
    try {
      // Initialize speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        recognitionRef.current.continuous = continuousListening;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = selectedLanguage;
        
        recognitionRef.current.onstart = () => {
          setCurrentTranscription('');
          trackActivity({
            type: 'voice_recognition_started',
            details: { language: selectedLanguage }
          });
        };

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence;

            if (event.results[i].isFinal) {
              finalTranscript += transcript;
              setConfidence(confidence);
              
              // Process voice command
              handleVoiceCommand(transcript, confidence);
            } else {
              interimTranscript += transcript;
            }
          }

          setCurrentTranscription(finalTranscript || interimTranscript);
          
          if (onTranscription && finalTranscript) {
            onTranscription(finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (accessibilityFeatures.voiceGuidance) {
            speak('Voice recognition error occurred. Please try again.');
          }
        };

        recognitionRef.current.onend = () => {
          if (continuousListening && voiceEnabled) {
            // Restart recognition for continuous listening
            setTimeout(() => {
              if (recognitionRef.current && voiceEnabled) {
                recognitionRef.current.start();
              }
            }, 100);
          }
        };
      }

      // Initialize voice synthesis
      if ('speechSynthesis' in window) {
        synthesisRef.current = window.speechSynthesis;
      }

      // Initialize audio context for visualization
      if ('AudioContext' in window || 'webkitAudioContext' in window) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      }

      // Initialize voice control config
      await initializeVoiceControl({
        language: selectedLanguage,
        continuous: continuousListening,
        interimResults: true,
        maxAlternatives: 3
      });

    } catch (error) {
      console.error('Failed to initialize voice interface:', error);
    }
  }, [selectedLanguage, continuousListening, voiceEnabled, accessibilityFeatures]);

  const cleanupVoiceInterface = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Voice Control Handlers
  const startListening = useCallback(async () => {
    try {
      if (!voiceEnabled) return;

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStreamRef.current = stream;

      // Connect to audio context for visualization
      if (audioContextRef.current && analyserRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
      }

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      if (accessibilityFeatures.voiceGuidance) {
        speak('Voice recognition started. I am listening.');
      }

    } catch (error) {
      console.error('Failed to start listening:', error);
      if (accessibilityFeatures.voiceGuidance) {
        speak('Unable to access microphone. Please check your permissions.');
      }
    }
  }, [voiceEnabled, accessibilityFeatures]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }

    if (accessibilityFeatures.voiceGuidance) {
      speak('Voice recognition stopped.');
    }
  }, [accessibilityFeatures]);

  const speak = useCallback(async (text: string, options?: {
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  }) => {
    try {
      if (!synthesisRef.current || !voiceEnabled) return;

      // Cancel any ongoing speech
      synthesisRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply voice settings
      utterance.rate = options?.rate || speechRate;
      utterance.pitch = options?.pitch || speechPitch;
      utterance.volume = options?.volume || voiceVolume;
      utterance.lang = selectedLanguage;

      // Select voice
      const voices = synthesisRef.current.getVoices();
      const selectedVoiceObj = voices.find(voice => 
        voice.name === (options?.voice || selectedVoice) ||
        voice.lang === selectedLanguage
      );
      
      if (selectedVoiceObj) {
        utterance.voice = selectedVoiceObj;
      }

      // Apply accessibility adjustments
      if (accessibilityFeatures.slowSpeech) {
        utterance.rate = Math.min(utterance.rate, 0.7);
      }

      utterance.onstart = () => {
        trackActivity({
          type: 'voice_synthesis_started',
          details: {
            text: text.substring(0, 100),
            language: selectedLanguage,
            voice: selectedVoiceObj?.name
          }
        });
      };

      utterance.onend = () => {
        // Voice synthesis completed
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
      };

      synthesisRef.current.speak(utterance);

    } catch (error) {
      console.error('Failed to speak:', error);
    }
  }, [voiceEnabled, speechRate, speechPitch, voiceVolume, selectedLanguage, selectedVoice, accessibilityFeatures, trackActivity]);

  const handleVoiceCommand = useCallback(async (transcript: string, confidence: number) => {
    try {
      const command = await processVoiceInput(transcript, {
        context: currentContext,
        confidence,
        language: selectedLanguage
      });

      if (command && confidence >= 0.7) {
        if (onVoiceCommand) {
          onVoiceCommand(command);
        }

        // Provide feedback
        if (accessibilityFeatures.voiceGuidance) {
          speak(`Command recognized: ${command.intent}`);
        }

        trackActivity({
          type: 'voice_command_executed',
          details: {
            command: command.intent,
            confidence,
            transcript: transcript.substring(0, 100)
          }
        });
      } else if (confidence < 0.7 && accessibilityFeatures.voiceGuidance) {
        speak('Command not recognized. Please try again.');
      }

    } catch (error) {
      console.error('Failed to process voice command:', error);
    }
  }, [processVoiceInput, currentContext, selectedLanguage, onVoiceCommand, accessibilityFeatures, speak, trackActivity]);

  const calibrateAudio = useCallback(async () => {
    try {
      setIsCalibrating(true);
      
      if (accessibilityFeatures.voiceGuidance) {
        speak('Starting audio calibration. Please speak normally for 10 seconds.');
      }

      await calibrateAudioInput({
        duration: 10000,
        sampleRate: 44100,
        channelCount: 1
      });

      if (accessibilityFeatures.voiceGuidance) {
        speak('Audio calibration completed.');
      }

      trackActivity({
        type: 'audio_calibrated',
        details: { language: selectedLanguage }
      });

    } catch (error) {
      console.error('Failed to calibrate audio:', error);
      if (accessibilityFeatures.voiceGuidance) {
        speak('Audio calibration failed. Please try again.');
      }
    } finally {
      setIsCalibrating(false);
    }
  }, [selectedLanguage, accessibilityFeatures, trackActivity]);

  const updateAudioVisualization = useCallback(() => {
    if (!analyserRef.current || !isListening) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average audio level
    const average = dataArray.reduce((acc, value) => acc + value, 0) / bufferLength;
    setAudioLevel(average / 255);

    // Update visualization data
    const visualizationData = Array.from(dataArray).slice(0, 32);
    setAudioData(visualizationData);

    animationFrameRef.current = requestAnimationFrame(updateAudioVisualization);
  }, [isListening]);

  const provideVoiceGuidance = useCallback(() => {
    const guidance = [
      'Voice control is active.',
      `Current language is ${selectedLanguage}.`,
      'Say commands clearly for best recognition.',
      'Use wake word if enabled for hands-free operation.'
    ];

    speak(guidance.join(' '));
  }, [selectedLanguage, speak]);

  const handleVoiceTraining = useCallback(async () => {
    try {
      setIsTraining(true);
      setTrainingProgress(0);

      if (accessibilityFeatures.voiceGuidance) {
        speak('Starting voice training. Please repeat the phrases as they appear.');
      }

      const trainingPhrases = [
        'Hello, this is my voice.',
        'I want to search for data.',
        'Show me the dashboard.',
        'Create a new workflow.',
        'Save my changes.'
      ];

      for (let i = 0; i < trainingPhrases.length; i++) {
        const phrase = trainingPhrases[i];
        
        if (accessibilityFeatures.voiceGuidance) {
          speak(`Please say: ${phrase}`);
        }

        // Wait for user to repeat the phrase
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        setTrainingProgress(((i + 1) / trainingPhrases.length) * 100);
      }

      await trainVoiceProfile({
        userId: currentUser?.id || 'anonymous',
        language: selectedLanguage,
        phrases: trainingPhrases
      });

      if (accessibilityFeatures.voiceGuidance) {
        speak('Voice training completed successfully.');
      }

      trackActivity({
        type: 'voice_training_completed',
        details: {
          language: selectedLanguage,
          phrasesCount: trainingPhrases.length
        }
      });

    } catch (error) {
      console.error('Failed to train voice:', error);
      if (accessibilityFeatures.voiceGuidance) {
        speak('Voice training failed. Please try again.');
      }
    } finally {
      setIsTraining(false);
      setTrainingProgress(0);
    }
  }, [selectedLanguage, currentUser, accessibilityFeatures, trainVoiceProfile, trackActivity]);

  // Render Methods
  const renderVoiceControlPanel = () => (
    <VoiceControlPanel
      isListening={isListening}
      onToggleListening={isListening ? stopListening : startListening}
      isSpeaking={isSpeaking}
      onToggleSpeaking={() => {
        if (isSpeaking) {
          synthesisRef.current?.cancel();
        } else {
          speak('Voice control test. This is a sample message.');
        }
      }}
      confidence={confidence}
      currentText={currentTranscription}
      commands={voiceCommands.slice(0, 5)}
    />
  );

  const renderVoiceSettings = () => (
    <VoiceSettings
      config={voiceControlConfig}
      onConfigUpdate={(config) => {
        updateVoiceConfig(config);
      }}
      devices={[]} // Would be populated from actual audio devices
      onDeviceSelect={(deviceId) => {
        // Handle device selection
      }}
    />
  );

  const renderCommandHistory = () => (
    <CommandHistory
      commands={commandHistory}
      onCommandReplay={(commandId) => {
        const command = commandHistory.find(c => c.id === commandId);
        if (command) {
          handleVoiceCommand(command.transcript, command.confidence);
        }
      }}
      onCommandEdit={(commandId) => {
        // Handle command editing
      }}
      onCommandDelete={(commandId) => {
        // Handle command deletion
      }}
    />
  );

  const renderVoiceTraining = () => (
    <VoiceTraining
      profile={voiceProfile}
      onTrainingStart={handleVoiceTraining}
      onTrainingComplete={(results) => {
        // Handle training completion
      }}
      isTraining={isTraining}
    />
  );

  const renderVoiceAnalytics = () => (
    <VoiceAnalytics
      analytics={voiceAnalytics}
      timeRange="24h"
      onTimeRangeChange={(range) => {
        // Handle time range change
      }}
    />
  );

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mic className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold">Voice Control Interface</h2>
              <p className="text-sm text-muted-foreground">
                Advanced voice recognition and synthesis with natural language processing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={voiceEnabled}
                onCheckedChange={setVoiceEnabled}
              />
              <Label className="text-sm">Voice Control</Label>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={calibrateAudio}
              disabled={isCalibrating}
            >
              {isCalibrating ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2" />
                  Calibrating...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Calibrate
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Voice Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    voiceEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span className="text-sm font-medium">
                    {voiceEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedLanguages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={[voiceVolume]}
                    onValueChange={([value]) => setVoiceVolume(value)}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={isListening ? 'default' : 'outline'}>
                  {isListening ? 'Listening' : 'Idle'}
                </Badge>
                {confidence > 0 && (
                  <Badge variant="secondary">
                    {Math.round(confidence * 100)}% confident
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audio Visualization */}
        {voiceEnabled && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-center">
                <AudioVisualizer
                  audioData={audioData}
                  isActive={isListening}
                  color="blue"
                  size="lg"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="control" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Control
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Training
              {isTraining && (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="control" className="space-y-4">
            {renderVoiceControlPanel()}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            {renderVoiceSettings()}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {renderCommandHistory()}
          </TabsContent>

          <TabsContent value="training" className="space-y-4">
            {renderVoiceTraining()}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {renderVoiceAnalytics()}
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Voice Control Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

// Voice Control Panel Component
const VoiceControlPanel: React.FC<VoiceControlPanelProps> = ({
  isListening,
  onToggleListening,
  isSpeaking,
  onToggleSpeaking,
  confidence,
  currentText,
  commands
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Voice Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={onToggleListening}
              className={`w-20 h-20 rounded-full ${
                isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isListening ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>

            <Button
              size="lg"
              onClick={onToggleSpeaking}
              variant="outline"
              className="w-20 h-20 rounded-full"
            >
              {isSpeaking ? (
                <VolumeX className="h-8 w-8" />
              ) : (
                <Volume2 className="h-8 w-8" />
              )}
            </Button>
          </div>

          {currentText && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <Label className="text-sm font-medium">Current Transcription:</Label>
              <p className="text-sm mt-1">{currentText}</p>
              {confidence > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={confidence * 100} className="flex-1 h-2" />
                  <span className="text-xs text-muted-foreground">
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
              )}
            </div>
          )}

          {commands.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Recent Commands:</Label>
              <div className="mt-2 space-y-1">
                {commands.map((command, index) => (
                  <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted/20 rounded">
                    <span>{command.intent}</span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(command.confidence * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Audio Visualizer Component
const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  audioData,
  isActive,
  color = 'blue',
  size = 'md'
}) => {
  const heights = {
    sm: 40,
    md: 60,
    lg: 80
  };

  const height = heights[size];
  const barCount = Math.min(audioData.length, 32);

  return (
    <div className={`flex items-end gap-1 h-${height}`} style={{ height: `${height}px` }}>
      {Array.from({ length: barCount }).map((_, index) => {
        const value = audioData[index] || 0;
        const barHeight = isActive ? (value / 255) * height : Math.random() * height * 0.1;
        
        return (
          <motion.div
            key={index}
            className={`w-1 bg-${color}-500 rounded-t`}
            style={{
              height: `${barHeight}px`,
              backgroundColor: isActive ? undefined : '#e5e7eb'
            }}
            animate={{ height: `${barHeight}px` }}
            transition={{ duration: 0.1 }}
          />
        );
      })}
    </div>
  );
};

// Voice Settings Component
const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  config,
  onConfigUpdate,
  devices,
  onDeviceSelect
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Voice Recognition Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Continuous Listening</Label>
              <Switch
                checked={config.continuous}
                onCheckedChange={(checked) => onConfigUpdate({ continuous: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Interim Results</Label>
              <Switch
                checked={config.interimResults}
                onCheckedChange={(checked) => onConfigUpdate({ interimResults: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Noise Filtering</Label>
              <Switch
                checked={config.noiseReduction}
                onCheckedChange={(checked) => onConfigUpdate({ noiseReduction: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Echo Cancellation</Label>
              <Switch
                checked={config.echoCancellation}
                onCheckedChange={(checked) => onConfigUpdate({ echoCancellation: checked })}
              />
            </div>
          </div>

          <div>
            <Label className="text-sm">Confidence Threshold</Label>
            <Slider
              value={[config.confidenceThreshold || 0.7]}
              onValueChange={([value]) => onConfigUpdate({ confidenceThreshold: value })}
              min={0.1}
              max={1}
              step={0.05}
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {Math.round((config.confidenceThreshold || 0.7) * 100)}%
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Voice Synthesis Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm">Speech Rate</Label>
            <Slider
              value={[config.speechRate || 1.0]}
              onValueChange={([value]) => onConfigUpdate({ speechRate: value })}
              min={0.1}
              max={2}
              step={0.1}
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {(config.speechRate || 1.0).toFixed(1)}x
            </div>
          </div>

          <div>
            <Label className="text-sm">Speech Pitch</Label>
            <Slider
              value={[config.speechPitch || 1.0]}
              onValueChange={([value]) => onConfigUpdate({ speechPitch: value })}
              min={0.1}
              max={2}
              step={0.1}
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {(config.speechPitch || 1.0).toFixed(1)}x
            </div>
          </div>

          <div>
            <Label className="text-sm">Volume</Label>
            <Slider
              value={[config.volume || 1.0]}
              onValueChange={([value]) => onConfigUpdate({ volume: value })}
              min={0}
              max={1}
              step={0.1}
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {Math.round((config.volume || 1.0) * 100)}%
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Command History Component
const CommandHistory: React.FC<CommandHistoryProps> = ({
  commands,
  onCommandReplay,
  onCommandEdit,
  onCommandDelete
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Command History</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {commands.map((command) => (
                <div key={command.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{command.transcript}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {command.intent}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(command.confidence * 100)}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(command.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCommandReplay(command.id)}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCommandEdit(command.id)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCommandDelete(command.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

// Voice Training Component
const VoiceTraining: React.FC<VoiceTrainingProps> = ({
  profile,
  onTrainingStart,
  onTrainingComplete,
  isTraining
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Voice Training</CardTitle>
          <CardDescription>
            Train the system to better recognize your voice and speech patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Training Sessions:</Label>
              <div>{profile.trainingSessions || 0}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Accuracy:</Label>
              <div>{Math.round((profile.accuracy || 0) * 100)}%</div>
            </div>
          </div>

          <Button
            onClick={onTrainingStart}
            disabled={isTraining}
            className="w-full"
          >
            {isTraining ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Training in Progress...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Start Voice Training
              </>
            )}
          </Button>

          {isTraining && (
            <div className="space-y-2">
              <Progress value={0} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                Follow the voice prompts to complete training
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Voice Analytics Component
const VoiceAnalytics: React.FC<VoiceAnalyticsProps> = ({
  analytics,
  timeRange,
  onTimeRangeChange
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Voice Analytics</CardTitle>
            <Select value={timeRange} onValueChange={onTimeRangeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analytics.totalCommands || 0}</div>
              <p className="text-sm text-muted-foreground">Total Commands</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analytics.successfulCommands || 0}</div>
              <p className="text-sm text-muted-foreground">Successful</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{Math.round((analytics.averageConfidence || 0) * 100)}%</div>
              <p className="text-sm text-muted-foreground">Avg Confidence</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{analytics.averageResponseTime || 0}ms</div>
              <p className="text-sm text-muted-foreground">Avg Response</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceControlInterface;
