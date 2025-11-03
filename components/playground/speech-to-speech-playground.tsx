'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { GlowEffect } from '@/components/ui/glow-effect';
import { ModelSelector } from '@/components/playground/model-selector';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { 
  Mic, 
  Upload, 
  Loader2, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Square,
  Play,
  Pause,
  Download,
  RotateCcw,
  Volume2
} from 'lucide-react';

interface SpeechToSpeechPlaygroundProps {
  model: {
    name: string;
    provider: string;
    license: string;
    inputPrice: string;
    outputPrice: string;
    description: string;
    tags: string[];
    cardGradient: string;
    logo: React.ReactNode;
  };
  selectedModel: string;
  modelData: any;
  onModelChange: (model: string) => void;
  onOpenSetupCode: () => void;
  onOpenCreateApiKey: () => void;
}

const languages = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'bn', label: 'Bengali' },
  { value: 'mr', label: 'Marathi' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'kn', label: 'Kannada' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'pa', label: 'Punjabi' },
  { value: 'or', label: 'Odia' },
  { value: 'as', label: 'Assamese' },
];

const voices = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
];

export function SpeechToSpeechPlayground({
  model,
  selectedModel,
  modelData,
  onModelChange,
  onOpenSetupCode,
  onOpenCreateApiKey,
}: SpeechToSpeechPlaygroundProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // State
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isCostPopoverOpen, setIsCostPopoverOpen] = useState(false);
  const [showCostShimmer, setShowCostShimmer] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Calculate cost based on audio duration
  const calculateCost = (durationInSeconds: number) => {
    const hours = durationInSeconds / 3600;
    return hours * 30; // ₹30 per hour
  };

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  // Format time for recording timer (MM:SS)
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format time for audio player
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Animated Waveform Component
  const RecordingWaveform = () => {
    const bars = 20;
    return (
      <div className='flex items-center gap-[2px] h-8'>
        {Array.from({ length: bars }).map((_, i) => (
          <motion.div
            key={i}
            className='w-[2px] bg-muted-foreground/40 rounded-full'
            animate={{
              height: ['8px', `${Math.random() * 24 + 8}px`, '8px'],
            }}
            transition={{
              duration: 0.5 + Math.random() * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.05,
            }}
          />
        ))}
      </div>
    );
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.wav')) {
      toast({
        title: 'Invalid file format',
        description: 'Please upload a WAV file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 5MB',
        variant: 'destructive',
      });
      return;
    }

    setAudioFile(file);

    // Mock: Extract audio duration (in real app, would use audio API)
    const mockDuration = Math.floor(Math.random() * 180) + 30; // 30-210 seconds
    setAudioDuration(mockDuration);

    toast({
      title: 'File uploaded',
      description: `${file.name} (${formatDuration(mockDuration)})`,
    });
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle recording (mocked)
  const handleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingTime(0);
    } else {
      setIsRecording(false);
      setAudioDuration(recordingTime);
      setAudioFile(new File([], 'recording.wav', { type: 'audio/wav' }));
      setRecordingTime(0);
    }
  };

  // Timer effect for recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Handle processing
  const handleSubmit = async () => {
    if (!audioFile) {
      toast({
        title: 'No audio file',
        description: 'Please upload or record an audio file',
        variant: 'destructive',
      });
      return;
    }

    if (!sourceLanguage) {
      toast({
        title: 'No source language selected',
        description: 'Please select a source language',
        variant: 'destructive',
      });
      return;
    }

    if (!targetLanguage) {
      toast({
        title: 'No target language selected',
        description: 'Please select a target language',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedVoice) {
      toast({
        title: 'No voice selected',
        description: 'Please select a voice',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // For demo, we'll use a placeholder audio URL
    // In production, this would be the generated audio from the API
    const demoAudio = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    setGeneratedAudio(demoAudio);

    // Calculate cost and trigger shimmer animation
    const cost = calculateCost(audioDuration);
    setTotalCost(cost);
    setShowCostShimmer(true);
    setTimeout(() => setShowCostShimmer(false), 2000);

    setIsProcessing(false);

    toast({
      title: 'Speech converted successfully',
      description: 'Your speech has been converted to the target language',
    });
  };

  // Audio player controls
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
    link.download = 'converted-speech.mp3';
    link.click();
  };

  const handleClear = () => {
    setGeneratedAudio(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setAudioFile(null);
    setAudioDuration(0);
    setSourceLanguage('');
    setTargetLanguage('');
    setSelectedVoice('');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    toast({
      title: 'Cleared',
      description: 'All data has been cleared',
    });
  };

  return (
    <div className='flex flex-col lg:flex-row gap-6 min-h-[600px] lg:h-[calc(100vh-280px)]'>
      {/* LEFT SIDEBAR */}
      <div className='w-full lg:w-80 flex-shrink-0 flex flex-col lg:h-full relative'>
        {/* Scrollable Content */}
        <div className='flex-1 space-y-3 overflow-y-auto min-h-0 pb-4 lg:pb-32'>
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
                <div className={`flex items-center ${model.outputPrice ? 'justify-between' : 'justify-start'}`}>
                  <span className='text-base font-semibold text-gray-900'>{model.inputPrice}</span>
                  {model.outputPrice ? (
                    <span className='text-base font-semibold text-gray-900'>{model.outputPrice}</span>
                  ) : null}
                </div>
                <div className={`flex items-center text-xs text-gray-500 ${model.outputPrice ? 'justify-between' : 'justify-start'}`}>
                  <span>{(model as any).inputLabel ?? 'per 1 hour of input audio'}</span>
                  {model.outputPrice ? (
                    <span>{(model as any).outputLabel ?? 'output'}</span>
                  ) : null}
                </div>
              </div>

              {/* Throughput */}
              <div className='flex items-center gap-2 py-2'>
                <span className='text-xs text-gray-500'>Throughput</span>
                <div className='flex-1 border-b border-dotted border-gray-300'></div>
                <span className='text-sm font-semibold text-gray-900'>{(model as any).throughput ?? '120 min/hour'}</span>
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

        {/* Fixed Cost Information - Only show when there's a cost */}
        {totalCost > 0 && (
          <div className='mt-3 lg:absolute lg:bottom-0 lg:left-0 lg:right-0'>
            <Popover open={isCostPopoverOpen} onOpenChange={setIsCostPopoverOpen}>
              <PopoverTrigger asChild>
                <div 
                  className='mx-3 cursor-pointer transition-all hover:shadow-lg'
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
                    {isCostPopoverOpen ? (
                      <ChevronDown className='h-4 w-4 text-muted-foreground' />
                    ) : (
                      <ChevronUp className='h-4 w-4 text-muted-foreground' />
                    )}
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent 
                className='w-80 p-0 !shadow-[rgba(31,34,37,0.09)_0px_0px_0px_0.5px,rgba(0,0,0,0.08)_0px_12px_24px_-4px,rgba(0,0,0,0.04)_0px_8px_16px_-4px] !rounded-lg border-0 bg-popover' 
                side='top' 
                align='start'
                sideOffset={8}
              >
                <div className='p-3'>
                  <div className='text-sm font-semibold mb-3 px-2'>Cost Breakdown</div>
                  <div className='space-y-1'>
                    <div className='px-2 py-1.5 flex justify-between items-center text-sm rounded-md hover:bg-muted/50 transition-colors'>
                      <span className='text-muted-foreground'>Audio Duration</span>
                      <span className='font-medium'>{formatDuration(audioDuration)}</span>
                    </div>
                    <div className='px-2 py-1.5 flex justify-between items-center text-sm rounded-md hover:bg-muted/50 transition-colors'>
                      <span className='text-muted-foreground'>Conversion Cost</span>
                      <span className='font-medium'>₹{totalCost.toFixed(6)}</span>
                    </div>
                  </div>
                  <div className='border-t my-1'></div>
                  <div className='px-2 py-1.5 flex justify-between items-center text-sm font-semibold'>
                    <span>Total</span>
                    <span>₹{totalCost.toFixed(6)}</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* MAIN CONTENT - Input/Output Layout */}
      <Card className='flex-1 flex flex-col min-h-[400px] lg:min-h-0 relative' style={{ background: 'linear-gradient(180deg, #8e92981a 0%, #ffffff 100%)' }}>
        <CardContent className='flex-1 flex flex-col min-h-0 p-0 relative'>
          {/* Output Section - Scrollable */}
          <div className='flex-1 overflow-y-auto p-6'>
            <div className='space-y-4'>
              {!generatedAudio ? (
                <div className='flex flex-col items-center justify-center py-20 text-center'>
                  <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
                    <Volume2 className='w-8 h-8 text-gray-400' />
                  </div>
                  <p className='text-gray-500 text-sm'>Your converted audio will be generated here</p>
                  <p className='text-gray-400 text-xs mt-2'>
                    Upload or record audio and select languages below
                  </p>
                </div>
              ) : isProcessing ? (
                <div className='flex items-center justify-center min-h-[400px]'>
                  <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                  <span className='ml-2 text-muted-foreground'>Processing...</span>
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

                    {/* Cost Info */}
                    <div className='flex items-center justify-between gap-4'>
                      <div className='text-xs text-muted-foreground'>
                        Audio duration: {formatDuration(audioDuration)}
                      </div>
                      <div className='text-sm font-medium'>
                        Estimated Cost: ₹{totalCost.toFixed(6)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Section - Sticky at bottom with glow effect like chat input */}
          <div className='flex-shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
            <div className='p-6'>
              {/* Unified Input Card with Glow Effect */}
              <div className='relative w-full'>
                {/* Glow Effect Background */}
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    opacity: isInputFocused || audioFile ? 0.35 : 0.2,
                    scale: isInputFocused || audioFile ? 1.03 : 1.02,
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
                  className='relative w-full bg-white rounded-[24px] p-4 shadow-[0_2px_8px_0_rgba(0,0,0,0.08)]'
                  animate={{
                    boxShadow: isInputFocused || audioFile 
                      ? "0 8px 32px 0 rgba(0,0,0,0.16)" 
                      : "0 2px 8px 0 rgba(0,0,0,0.08)"
                  }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='.wav'
                    onChange={handleFileChange}
                    className='hidden'
                  />
                  
                  {/* Single Row Layout - All elements horizontally aligned */}
                  {!audioFile ? (
                    <div className='space-y-4'>
                      {/* Recording/Upload Section */}
                      <div className='flex items-center justify-between gap-6'>
                        {/* Left: Recording Button or Recording Waveform */}
                        <div className='flex items-center gap-3'>
                          {!isRecording ? (
                            <>
                              <TooltipWrapper content='Click to start recording'>
                                <button
                                  onClick={handleRecording}
                                  onFocus={() => setIsInputFocused(true)}
                                  className='flex items-center justify-center w-12 h-12 rounded-full transition-all flex-shrink-0 bg-white border-2 border-border hover:border-[#10A554]'
                                >
                                  <Mic className='h-5 w-5 text-foreground' />
                                </button>
                              </TooltipWrapper>
                              <span className='text-xs text-muted-foreground font-medium'>
                                Click to start speaking
                              </span>
                            </>
                          ) : (
                            <div className='flex items-center gap-3 bg-white rounded-full px-4 py-2 border-2 border-border'>
                              <span className='text-sm font-mono font-medium text-foreground'>
                                {formatRecordingTime(recordingTime)}
                              </span>
                              <RecordingWaveform />
                              <TooltipWrapper content='Stop recording'>
                                <button
                                  onClick={handleRecording}
                                  className='flex items-center justify-center w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 transition-all flex-shrink-0'
                                >
                                  <Square className='h-4 w-4 text-white fill-white' />
                                </button>
                              </TooltipWrapper>
                            </div>
                          )}
                        </div>

                        {/* OR Divider - Only show when not recording */}
                        {!isRecording && <span className='text-sm text-muted-foreground/60 font-medium'>OR</span>}

                        {/* Center: Upload Section */}
                        {!isRecording && (
                          <div className='flex items-center gap-3'>
                            <TooltipWrapper content='Upload audio file'>
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                onFocus={() => setIsInputFocused(true)}
                                className='flex items-center justify-center w-12 h-12 rounded-full border-2 border-border hover:border-[#10A554] transition-all bg-white flex-shrink-0'
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 18 18" className='text-foreground'>
                                  <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke="currentColor">
                                    <path d="M6.75 10.5L9 8.25L11.25 10.5"></path>
                                    <path d="M9 8.25V14.25"></path>
                                    <path d="M12 14.25H12.5C14.571 14.25 16.25 12.571 16.25 10.5C16.25 8.7639 15.065 7.31791 13.464 6.89111C13.278 4.57711 11.362 2.75 9 2.75C6.515 2.75 4.5 4.7651 4.5 7.25C4.5 7.6001 4.54899 7.93598 4.62399 8.26288C3.02699 8.32998 1.75 9.6369 1.75 11.25C1.75 12.907 3.093 14.25 4.75 14.25H6"></path>
                                  </g>
                                </svg>
                              </button>
                            </TooltipWrapper>
                            <div className='whitespace-nowrap'>
                              <p className='text-xs text-muted-foreground font-medium'>Upload File</p>
                              <p className='text-xs text-muted-foreground/70'>WAV format • File size 5MB • Below 16khz</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom Row: Source Language, Target Language, Select Voice, Submit button - All in one row */}
                      <div className='flex items-end gap-3'>
                        <div className='flex-1 grid grid-cols-3 gap-3'>
                          <div className='space-y-1.5'>
                            <label className='text-xs font-medium text-gray-600'>Source Language</label>
                            <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                              <SelectTrigger className='h-10' onFocus={() => setIsInputFocused(true)}>
                                <SelectValue placeholder='Select' />
                              </SelectTrigger>
                              <SelectContent>
                                {languages.map((lang) => (
                                  <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className='space-y-1.5'>
                            <label className='text-xs font-medium text-gray-600'>Target Language</label>
                            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                              <SelectTrigger className='h-10' onFocus={() => setIsInputFocused(true)}>
                                <SelectValue placeholder='Select' />
                              </SelectTrigger>
                              <SelectContent>
                                {languages.map((lang) => (
                                  <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className='space-y-1.5'>
                            <label className='text-xs font-medium text-gray-600'>Select Voice</label>
                            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                              <SelectTrigger className='h-10' onFocus={() => setIsInputFocused(true)}>
                                <SelectValue placeholder='Select' />
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
                          onClick={handleSubmit}
                          disabled={!audioFile || !sourceLanguage || !targetLanguage || !selectedVoice || isProcessing}
                          className='px-8 h-10'
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                              Processing...
                            </>
                          ) : (
                            'Submit'
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* File Uploaded State */
                    <div className='space-y-4'>
                      {/* File Info */}
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-lg bg-[#10A554]/10 flex items-center justify-center flex-shrink-0'>
                          <Mic className='h-5 w-5 text-[#10A554]' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium truncate'>{audioFile.name}</p>
                          <p className='text-xs text-muted-foreground'>
                            Duration: {formatDuration(audioDuration)}
                          </p>
                        </div>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={(e) => {
                            e.stopPropagation();
                            setAudioFile(null);
                            setAudioDuration(0);
                            setGeneratedAudio(null);
                            setTotalCost(0);
                          }}
                          className='h-8 w-8 p-0 flex-shrink-0'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>

                      {/* Bottom Row: Source Language, Target Language, Select Voice, Submit button */}
                      <div className='flex items-end gap-3'>
                        <div className='flex-1 grid grid-cols-3 gap-3'>
                          <div className='space-y-1.5'>
                            <label className='text-xs font-medium text-gray-600'>Source Language</label>
                            <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                              <SelectTrigger className='h-10' onFocus={() => setIsInputFocused(true)}>
                                <SelectValue placeholder='Select' />
                              </SelectTrigger>
                              <SelectContent>
                                {languages.map((lang) => (
                                  <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className='space-y-1.5'>
                            <label className='text-xs font-medium text-gray-600'>Target Language</label>
                            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                              <SelectTrigger className='h-10' onFocus={() => setIsInputFocused(true)}>
                                <SelectValue placeholder='Select' />
                              </SelectTrigger>
                              <SelectContent>
                                {languages.map((lang) => (
                                  <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className='space-y-1.5'>
                            <label className='text-xs font-medium text-gray-600'>Select Voice</label>
                            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                              <SelectTrigger className='h-10' onFocus={() => setIsInputFocused(true)}>
                                <SelectValue placeholder='Select' />
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
                          onClick={handleSubmit}
                          disabled={!audioFile || !sourceLanguage || !targetLanguage || !selectedVoice || isProcessing}
                          className='px-8 h-10'
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                              Processing...
                            </>
                          ) : (
                            'Submit'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

