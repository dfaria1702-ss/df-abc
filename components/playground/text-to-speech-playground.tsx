'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModelSelector } from '@/components/playground/model-selector';
import { useToast } from '@/hooks/use-toast';
import { GlowEffect } from '@/components/ui/glow-effect';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { 
  Volume2, 
  Download, 
  Play, 
  Pause, 
  RotateCcw,
  ExternalLink
} from 'lucide-react';

interface TextToSpeechPlaygroundProps {
  model: {
    name: string;
    provider: string;
    license: string;
    inputPrice: string;
    outputPrice: string;
    description: string;
    tags?: string[];
    logo: React.ReactNode;
  };
  selectedModel: string;
  modelData: Record<string, any>;
  onModelChange: (modelId: string) => void;
  onOpenSetupCode: () => void;
  onOpenCreateApiKey: () => void;
}

export function TextToSpeechPlayground({
  model,
  selectedModel,
  modelData,
  onModelChange,
  onOpenSetupCode,
  onOpenCreateApiKey,
}: TextToSpeechPlaygroundProps) {
  const { toast } = useToast();
  const [inputText, setInputText] = useState('');
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedInputLanguage, setSelectedInputLanguage] = useState('english');
  const [selectedOutputLanguage, setSelectedOutputLanguage] = useState('english');
  const [selectedVoice, setSelectedVoice] = useState('female');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [showCostShimmer, setShowCostShimmer] = useState(false);
  const [audioMetrics, setAudioMetrics] = useState<{
    ttft: number;
    latency: number;
    tps: number;
    cost: number;
  } | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const maxCharacters = 5000;
  const characterCount = inputText.length;

  // Input Language options
  const inputLanguages = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'telugu', label: 'Telugu' },
    { value: 'bengali', label: 'Bengali' },
    { value: 'marathi', label: 'Marathi' },
  ];

  // Output Language options
  const outputLanguages = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'telugu', label: 'Telugu' },
    { value: 'bengali', label: 'Bengali' },
    { value: 'marathi', label: 'Marathi' },
  ];

  // Voice options
  const voices = [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
  ];

  const handleGenerateSpeech = () => {
    if (!inputText.trim()) {
      toast({
        title: 'No text provided',
        description: 'Please enter some text to convert to speech.',
        variant: 'destructive',
      });
      return;
    }

    if (characterCount > maxCharacters) {
      toast({
        title: 'Text too long',
        description: `Please limit your text to ${maxCharacters} characters.`,
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    // Simulate API call - in real app, this would call the TTS API
    setTimeout(() => {
      // Generate mock metrics
      const metrics = {
        ttft: Math.floor(Math.random() * 200) + 50, // 50-250ms
        latency: Math.floor(Math.random() * 500) + 300, // 300-800ms
        tps: Math.floor(Math.random() * 100) + 100, // 100-200
        cost: parseFloat(((characterCount / 1000000) * parseFloat(model.inputPrice)).toFixed(6))
      };
      
      setAudioMetrics(metrics);
      setTotalCost(prev => prev + metrics.cost);
      setShowCostShimmer(true);
      setTimeout(() => setShowCostShimmer(false), 2000);
      
      // For demo, we'll use a placeholder audio URL
      // In production, this would be the generated audio from the API
      const demoAudio = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      setGeneratedAudio(demoAudio);
      setIsGenerating(false);

      toast({
        title: 'Speech generated successfully',
        description: 'Your text has been converted to speech.',
      });
    }, 2000);
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const time = parseFloat(e.target.value);
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleDownload = () => {
    if (!generatedAudio) return;

    toast({
      title: 'Downloading audio',
      description: 'Your audio file is being downloaded.',
    });

    // In real app, trigger actual download
    const link = document.createElement('a');
    link.href = generatedAudio;
    link.download = 'generated-speech.mp3';
    link.click();
  };

  const handleClear = () => {
    setGeneratedAudio(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setAudioMetrics(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className='flex gap-6 h-[calc(100vh-280px)]'>
      {/* LEFT SIDEBAR */}
      <div className='w-80 flex-shrink-0 flex flex-col h-full relative'>
        {/* Scrollable Content */}
        <div className='flex-1 space-y-3 overflow-y-auto min-h-0 pb-32'>
          {/* Model Section */}
          <div className='space-y-3'>
            <ModelSelector
              value={selectedModel}
              onChange={onModelChange}
              modelData={modelData}
            />

            {/* Model Info Card */}
            <div className={`rounded-lg border p-4 space-y-4 ${model.cardGradient}`}>
              {/* Pricing */}
              <div className='space-y-1'>
                <div className='flex items-center justify-between'>
                  <span className='text-base font-semibold text-gray-900'>₹{model.inputPrice}</span>
                  <span className='text-base font-semibold text-gray-900'>₹{model.outputPrice}</span>
                </div>
                <div className='flex items-center justify-between text-xs text-gray-500'>
                  <span>Per 1M Characters</span>
                  <span>Output</span>
                </div>
              </div>

              {/* Tags */}
              <div className='flex flex-wrap gap-2'>
                {model.tags.map((tag, index) => (
                  <span key={index} className='px-2 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded font-medium'>
                    {tag}
                  </span>
                ))}
              </div>

              <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                <button className='hover:text-foreground flex items-center gap-1'>
                  Learn more
                  <ExternalLink className='h-3 w-3' />
                </button>
                <span>|</span>
                <span>{model.license}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Cost Card - Fixed at bottom, only show after audio is generated */}
        {generatedAudio && totalCost > 0 && (
          <div className='absolute bottom-0 left-0 right-0 p-4'>
            <div
              style={{
                borderRadius: '16px',
                border: '4px solid #FFF',
                background: 'linear-gradient(265deg, #FFF -13.17%, #F0F7FF 133.78%)',
                boxShadow: '0px 8px 39.1px -9px rgba(0, 27, 135, 0.08)',
                padding: '1.5rem',
              }}
            >
              <div className='flex items-center justify-between w-full'>
                <div className='text-sm text-foreground flex items-center gap-1'>
                  <span>Total cost:</span>
                  {showCostShimmer ? (
                    <TextShimmer duration={1.5} className='font-semibold text-sm inline-block'>{`₹${totalCost.toFixed(6)}`}</TextShimmer>
                  ) : (
                    <span className='font-semibold text-gray-900'>₹{totalCost.toFixed(6)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MAIN CONTENT - Output/Input Layout */}
      <Card className='flex-1 flex flex-col min-h-0 relative' style={{ background: 'linear-gradient(180deg, #8e92981a 0%, #ffffff 100%)' }}>
        <CardContent className='flex-1 flex flex-col min-h-0 p-0 relative'>
          {/* Output Section - Scrollable */}
          <div className='flex-1 overflow-y-auto p-6'>
            <div className='space-y-4'>
              {!generatedAudio ? (
                <div className='flex flex-col items-center justify-center py-20 text-center'>
                  <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
                    <Volume2 className='w-8 h-8 text-gray-400' />
                  </div>
                  <p className='text-gray-500 text-sm'>Your audio will be generated here</p>
                  <p className='text-gray-400 text-xs mt-2'>
                    Enter text below and click "Generate Speech"
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {/* Header with actions */}
                  <div className='flex items-center justify-between'>
                    <h3 className='text-sm font-semibold text-gray-700'>Generated Audio</h3>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleDownload}
                      >
                        <Download className='w-4 h-4 mr-2' />
                        Download
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleClear}
                      >
                        <RotateCcw className='w-4 h-4 mr-2' />
                        Clear
                      </Button>
                    </div>
                  </div>

                  {/* Audio Player Card */}
                  <div className='bg-white rounded-lg border p-6 space-y-4'>
                    <audio
                      ref={audioRef}
                      src={generatedAudio}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                    />

                    {/* Play/Pause Button */}
                    <div className='flex items-center gap-4'>
                      <Button
                        variant='default'
                        size='lg'
                        onClick={handlePlayPause}
                        className='w-16 h-16 rounded-full'
                      >
                        {isPlaying ? (
                          <Pause className='w-6 h-6' />
                        ) : (
                          <Play className='w-6 h-6 ml-1' />
                        )}
                      </Button>

                      <div className='flex-1 space-y-2'>
                        {/* Progress Bar */}
                        <input
                          type='range'
                          min='0'
                          max={duration || 0}
                          value={currentTime}
                          onChange={handleSeek}
                          className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black'
                        />

                        {/* Time Display */}
                        <div className='flex justify-between text-xs text-gray-500'>
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics - Below audio player, aligned to right */}
                  {audioMetrics && (
                    <div className='flex justify-end'>
                      <div className='bg-muted/50 rounded-md px-3 py-1.5 text-xs text-muted-foreground'>
                        <span className='font-medium'>TTFT:</span> {audioMetrics.ttft} ms <span className='mx-1'>|</span>
                        <span className='font-medium'>Latency:</span> {audioMetrics.latency} ms <span className='mx-1'>|</span>
                        <span className='font-medium'>TPS:</span> {audioMetrics.tps} <span className='mx-1'>|</span>
                        <span className='font-medium'>Estimated Cost:</span> ₹{audioMetrics.cost.toFixed(6)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Input Section - Sticky at bottom with glow effect */}
          <div className='flex-shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
            <div className='p-6'>
              {/* Unified Input Card with Glow Effect */}
              <div className='relative w-full'>
                {/* Glow Effect Background */}
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    opacity: isInputFocused || inputText ? 0.35 : 0.2,
                    scale: isInputFocused || inputText ? 1.03 : 1.02,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <GlowEffect
                    colors={['#0894FF', '#C959DD', '#FF2E54', '#FF9004']}
                    mode='rotate'
                    blur='stronger'
                    duration={8}
                    className='rounded-[24px]'
                  />
                </motion.div>

                {/* Input Container */}
                <motion.div
                  className='relative w-full bg-white rounded-[24px] p-6 shadow-[0_2px_8px_0_rgba(0,0,0,0.08)]'
                  animate={{
                    boxShadow: isInputFocused || inputText 
                      ? "0 8px 32px 0 rgba(0,0,0,0.16)" 
                      : "0 2px 8px 0 rgba(0,0,0,0.08)"
                  }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                >
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Textarea
                        placeholder='Enter text to convert to speech...'
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        className='min-h-[80px] resize-none'
                        maxLength={maxCharacters}
                      />
                      <div className='flex items-center justify-between text-xs text-muted-foreground'>
                        <span>
                          Characters: {characterCount.toLocaleString()} / {maxCharacters.toLocaleString()}
                        </span>
                        {characterCount > maxCharacters * 0.9 && (
                          <span className='text-amber-600'>
                            {maxCharacters - characterCount} characters remaining
                          </span>
                        )}
                      </div>
                    </div>

                    <div className='flex items-end gap-3'>
                      <div className='flex-1 grid grid-cols-3 gap-3'>
                        <div className='space-y-1.5'>
                          <label className='text-xs font-medium text-gray-600'>Input Language</label>
                          <Select value={selectedInputLanguage} onValueChange={setSelectedInputLanguage}>
                            <SelectTrigger onFocus={() => setIsInputFocused(true)} onBlur={() => setIsInputFocused(false)}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {inputLanguages.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  {lang.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className='space-y-1.5'>
                          <label className='text-xs font-medium text-gray-600'>Output Language</label>
                          <Select value={selectedOutputLanguage} onValueChange={setSelectedOutputLanguage}>
                            <SelectTrigger onFocus={() => setIsInputFocused(true)} onBlur={() => setIsInputFocused(false)}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {outputLanguages.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  {lang.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className='space-y-1.5'>
                          <label className='text-xs font-medium text-gray-600'>Voice</label>
                          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                            <SelectTrigger onFocus={() => setIsInputFocused(true)} onBlur={() => setIsInputFocused(false)}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {voices.map((voice) => (
                                <SelectItem key={voice.value} value={voice.value}>
                                  {voice.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button
                        onClick={handleGenerateSpeech}
                        disabled={!inputText.trim() || isGenerating || characterCount > maxCharacters}
                        className='px-8'
                      >
                        {isGenerating ? (
                          <>
                            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                            Generating...
                          </>
                        ) : (
                          'Generate Speech'
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

