'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { GlowEffect } from '@/components/ui/glow-effect';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Mic, Upload, Copy, Loader2, ExternalLink, ChevronRight, ChevronDown, ChevronUp, X, Square } from 'lucide-react';

interface SpeechToTextPlaygroundProps {
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

export function SpeechToTextPlayground({
  model,
  selectedModel,
  modelData,
  onModelChange,
  onOpenSetupCode,
  onOpenCreateApiKey,
}: SpeechToTextPlaygroundProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [transcribedText, setTranscribedText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [temperature, setTemperature] = useState([1]);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isCostPopoverOpen, setIsCostPopoverOpen] = useState(false);
  const [showCostShimmer, setShowCostShimmer] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Calculate cost based on audio duration
  const calculateCost = (durationInSeconds: number) => {
    const hours = durationInSeconds / 3600;
    return hours * 24; // ₹24 per hour
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

  // Handle transcription
  const handleTranscribe = async () => {
    if (!audioFile) {
      toast({
        title: 'No audio file',
        description: 'Please upload or record an audio file',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedLanguage) {
      toast({
        title: 'No language selected',
        description: 'Please select a target language',
        variant: 'destructive',
      });
      return;
    }

    setIsTranscribing(true);

    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock transcribed text
    const mockTranscriptions: Record<string, string> = {
      en: "This is a sample transcription of your audio file. The Krutrim-Dhwani model has successfully converted your speech to text with high accuracy. This demonstration shows how the speech-to-text functionality works in the playground environment.",
      hi: "यह आपकी ऑडियो फ़ाइल का एक नमूना ट्रांसक्रिप्शन है। Krutrim-Dhwani मॉडल ने आपके भाषण को उच्च सटीकता के साथ टेक्स्ट में सफलतापूर्वक परिवर्तित कर दिया है।",
      ta: "இது உங்கள் ஆடியோ கோப்பின் மாதிரி படியெடுப்பு ஆகும். Krutrim-Dhwani மாதிரி உங்கள் பேச்சை உயர் துல்லியத்துடன் உரையாக வெற்றிகரமாக மாற்றியுள்ளது.",
      te: "ఇది మీ ఆడియో ఫైల్ యొక్క నమూనా ట్రాన్స్క్రిప్షన్. Krutrim-Dhwani మోడల్ మీ ప్రసంగాన్ని అధిక ఖచ్చితత్వంతో టెక్స్ట్‌గా విజయవంతంగా మార్చింది.",
    };

    const transcription = mockTranscriptions[selectedLanguage] || mockTranscriptions.en;
    setTranscribedText(transcription);

    // Calculate cost and trigger shimmer animation
    const cost = calculateCost(audioDuration);
    setTotalCost(cost);
    setShowCostShimmer(true);
    setTimeout(() => setShowCostShimmer(false), 2000);

    setIsTranscribing(false);
  };

  // Handle copy transcription
  const handleCopyTranscription = () => {
    if (transcribedText) {
      navigator.clipboard.writeText(transcribedText);
      toast({
        title: 'Copied to clipboard',
        description: 'Transcription text copied successfully',
      });
    }
  };

  return (
    <div className='flex gap-6 h-[calc(100vh-280px)]'>
      {/* LEFT SIDEBAR - Exact same as text generation */}
      <div className='w-80 flex-shrink-0 flex flex-col h-full relative'>
        {/* Scrollable Content */}
        <div className='flex-1 space-y-3 overflow-y-auto min-h-0 pb-32'>
          {/* Model Section */}
          <div className='space-y-3'>
            <div className='relative z-50'>
              <Select value={selectedModel} onValueChange={onModelChange}>
                <SelectTrigger className='w-full h-auto min-h-[40px] py-3'>
                  <SelectValue>
                    <div className='flex items-center gap-2 w-full'>
                      {model.logo}
                      <span className='truncate text-left flex-1'>{model.name}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent 
                  className='z-[100] max-h-60 w-[var(--radix-select-trigger-width)]'
                  position="popper"
                  side="bottom"
                  align="start"
                  sideOffset={4}
                >
                  {Object.entries(modelData).map(([key, data]: [string, any]) => (
                    <SelectItem key={key} value={key} className='py-3'>
                      <div className='flex items-center gap-2 w-full'>
                        {data.logo}
                        <span className='text-sm'>{data.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model Info Card */}
            <div className={`rounded-lg border p-4 space-y-4 ${model.cardGradient}`}>
              {/* Pricing */}
              <div className='space-y-1'>
                <div className='flex items-center justify-between'>
                  <span className='text-base font-semibold text-gray-900'>₹{model.inputPrice}</span>
                  <span className='text-base font-semibold text-gray-900'>₹{model.outputPrice}</span>
                </div>
                <div className='flex items-center justify-between text-xs text-gray-500'>
                  <span>Per Hour of Audio</span>
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

          {/* Parameters Section - Hidden for speech-to-text model */}
          {/* NOTE: Parameters are not applicable for Krutrim-Dhwani speech-to-text model */}
        </div>

        {/* Fixed Cost Information - Only show when there's a cost */}
        {totalCost > 0 && (
          <div className='absolute bottom-0 left-0 right-0'>
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
                      <span className='text-muted-foreground'>Transcription Cost</span>
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

      {/* MAIN CONTENT - Same design as text generation playground */}
      <Card className='flex-1 flex flex-col min-h-0 relative' style={{ background: 'linear-gradient(180deg, #8e92981a 0%, #ffffff 100%)' }}>
        <CardContent className='flex-1 flex flex-col min-h-0 p-0 relative'>
          {/* Output Section - Scrollable */}
          <div className='flex-1 overflow-y-auto p-6'>
            <div className='space-y-4'>
              {/* Header - Only show when there's transcribed text */}
              {transcribedText && (
                <div className='flex items-center justify-between'>
                  <h3 className='text-sm font-medium text-foreground'>Output</h3>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        setTranscribedText('');
                        setAudioFile(null);
                        setAudioDuration(0);
                        setTotalCost(0);
                        setSelectedLanguage('');
                        toast({
                          title: 'Chat cleared',
                          description: 'All transcriptions have been cleared',
                        });
                      }}
                      className='h-7 px-3 text-xs'
                    >
                      Clear chat
                    </Button>
                    <TooltipWrapper content='Copy transcription'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={handleCopyTranscription}
                        className='h-6 w-6 p-0'
                      >
                        <Copy className='h-3 w-3' />
                      </Button>
                    </TooltipWrapper>
                  </div>
                </div>
              )}
              
              {isTranscribing ? (
                <div className='flex items-center justify-center min-h-[400px]'>
                  <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                  <span className='ml-2 text-muted-foreground'>Transcribing...</span>
                </div>
              ) : transcribedText ? (
                <div className='space-y-3'>
                  <div className='p-4 bg-white rounded-lg border text-sm'>
                    <p className='whitespace-pre-wrap'>{transcribedText}</p>
                  </div>
                  {/* Cost Info */}
                  <div className='flex items-center justify-end gap-4 text-xs text-muted-foreground'>
                    <span>Estimated Cost: ₹{totalCost.toFixed(6)}</span>
                  </div>
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center min-h-[400px] gap-3'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 18 18" className='text-muted-foreground/40'>
                    <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" stroke="currentColor">
                      <path d="M8 11.75H2.75"></path> 
                      <path d="M15.205 7.75H2.75"></path> 
                      <path d="M15.25 3.75H2.75"></path> 
                      <path d="M16.4873 12.5381L14.5928 11.9072L13.9615 10.0127C13.8594 9.707 13.5728 9.5 13.2501 9.5C12.9274 9.5 12.6407 9.707 12.5387 10.0127L11.9074 11.9072L10.0129 12.5381C9.70668 12.6406 9.50018 12.9268 9.50018 13.25C9.50018 13.5732 9.70668 13.8594 10.0129 13.9619L11.9074 14.5928L12.5387 16.4873C12.6408 16.793 12.9274 17 13.2501 17C13.5728 17 13.8595 16.793 13.9615 16.4873L14.5928 14.5928L16.4873 13.9619C16.7935 13.8594 17 13.5732 17 13.25C17 12.9268 16.7935 12.6406 16.4873 12.5381Z" fill="currentColor" data-stroke="none" stroke="none"></path>
                    </g>
                  </svg>
                  <p className='text-muted-foreground'>
                    Your output text will be generated here
                  </p>
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

                      {/* Right: Language Selector and Transcribe Button */}
                      <div className='flex flex-col gap-2 min-w-[280px]'>
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                          <SelectTrigger className='h-10' onFocus={() => setIsInputFocused(true)}>
                            <SelectValue placeholder='Select Target Language' />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          onClick={handleTranscribe}
                          disabled={!audioFile || !selectedLanguage || isTranscribing}
                          size='lg'
                          className='w-full h-10'
                        >
                          {isTranscribing ? (
                            <>
                              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                              Transcribing...
                            </>
                          ) : (
                            'Transcribe'
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* File Uploaded State */
                    <div className='flex items-center gap-6'>
                      {/* File Info */}
                      <div className='flex items-center gap-3 flex-1'>
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
                            setTranscribedText('');
                            setTotalCost(0);
                          }}
                          className='h-8 w-8 p-0 flex-shrink-0'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>

                      {/* Right: Language Selector and Transcribe Button */}
                      <div className='flex flex-col gap-2 min-w-[280px]'>
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                          <SelectTrigger className='h-10' onFocus={() => setIsInputFocused(true)}>
                            <SelectValue placeholder='Select Target Language' />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          onClick={handleTranscribe}
                          disabled={!audioFile || !selectedLanguage || isTranscribing}
                          size='lg'
                          className='w-full h-10'
                        >
                          {isTranscribing ? (
                            <>
                              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                              Transcribing...
                            </>
                          ) : (
                            'Transcribe'
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

