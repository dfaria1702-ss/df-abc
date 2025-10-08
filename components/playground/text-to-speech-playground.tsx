'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { 
  Volume2, 
  Download, 
  Play, 
  Pause, 
  RotateCcw,
  Info,
  ExternalLink,
  Sparkles
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
  const [selectedVoice, setSelectedVoice] = useState('female-en');
  const [selectedSpeed, setSelectedSpeed] = useState('1.0');
  const audioRef = useRef<HTMLAudioElement>(null);

  const maxCharacters = 5000;
  const characterCount = inputText.length;

  // Voice options
  const voices = [
    { value: 'female-en', label: 'Female (English)' },
    { value: 'male-en', label: 'Male (English)' },
    { value: 'female-hi', label: 'Female (Hindi)' },
    { value: 'male-hi', label: 'Male (Hindi)' },
    { value: 'female-ta', label: 'Female (Tamil)' },
    { value: 'male-ta', label: 'Male (Tamil)' },
  ];

  // Speed options
  const speeds = [
    { value: '0.5', label: '0.5x (Slow)' },
    { value: '0.75', label: '0.75x' },
    { value: '1.0', label: '1.0x (Normal)' },
    { value: '1.25', label: '1.25x' },
    { value: '1.5', label: '1.5x (Fast)' },
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
            <div className='relative z-50'>
              <Select value={selectedModel} onValueChange={onModelChange}>
                <SelectTrigger className='w-full bg-white border-gray-200'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(modelData).map(([key, data]: [string, any]) => (
                    <SelectItem key={key} value={key}>
                      <div className='flex items-center gap-2'>
                        {data.logo}
                        <span className='font-medium'>{data.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pricing Card */}
            <Card>
              <CardContent className='p-4 space-y-3'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-2xl font-bold'>₹{model.inputPrice}</div>
                    <div className='text-xs text-muted-foreground'>Per 1M Characters</div>
                  </div>
                  <div className='text-right'>
                    <div className='text-2xl font-bold'>₹{model.outputPrice}</div>
                    <div className='text-xs text-muted-foreground'>Output</div>
                  </div>
                </div>

                {/* Tags */}
                <div className='flex flex-wrap gap-1.5'>
                  {model.tags?.map((tag) => (
                    <Badge
                      key={tag}
                      variant='secondary'
                      className='text-xs px-2 py-0.5 bg-gray-100 text-gray-700 hover:bg-gray-200'
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Links */}
                <div className='flex items-center gap-3 text-xs pt-2 border-t'>
                  <button className='text-blue-600 hover:text-blue-700 flex items-center gap-1'>
                    Learn more
                    <ExternalLink className='w-3 h-3' />
                  </button>
                  <span className='text-gray-400'>|</span>
                  <span className='text-gray-600'>{model.license}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cost Summary - Fixed at bottom */}
        {inputText.trim() && (
          <div className='absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4'>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full justify-between'
                >
                  <span className='flex items-center gap-2'>
                    <Sparkles className='w-4 h-4 text-yellow-500' />
                    <span className='font-semibold'>
                      Est. ₹{((characterCount / 1000000) * parseFloat(model.inputPrice)).toFixed(6)}
                    </span>
                  </span>
                  <Info className='w-4 h-4 text-muted-foreground' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-64'>
                <div className='space-y-2'>
                  <h4 className='font-semibold text-sm'>Cost Breakdown</h4>
                  <div className='space-y-1 text-xs'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Characters:</span>
                      <span className='font-medium'>{characterCount.toLocaleString()}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Rate:</span>
                      <span className='font-medium'>₹{model.inputPrice}/1M chars</span>
                    </div>
                    <div className='flex justify-between pt-2 border-t'>
                      <span className='font-semibold'>Total:</span>
                      <span className='font-semibold'>
                        ₹{((characterCount / 1000000) * parseFloat(model.inputPrice)).toFixed(6)}
                      </span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* MAIN CONTENT - Output/Input Layout */}
      <Card className='flex-1 flex flex-col min-h-0 relative' style={{ background: 'linear-gradient(180deg, #8e92981a 0%, #ffffff 100%)' }}>
        <CardContent className='flex-1 flex flex-col min-h-0 p-0 relative'>
          {/* Output Section - Scrollable */}
          <div className='flex-1 overflow-y-auto p-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-semibold text-gray-700'>Generated Audio</h3>
                {generatedAudio && (
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
                )}
              </div>

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

                  {/* Audio Info */}
                  <div className='flex items-center gap-4 pt-4 border-t text-xs text-gray-600'>
                    <div className='flex items-center gap-2'>
                      <span className='text-muted-foreground'>Voice:</span>
                      <span className='font-medium'>
                        {voices.find((v) => v.value === selectedVoice)?.label}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-muted-foreground'>Speed:</span>
                      <span className='font-medium'>{selectedSpeed}x</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-muted-foreground'>Characters:</span>
                      <span className='font-medium'>{characterCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Section - Sticky at bottom */}
          <div className='border-t bg-white p-6 space-y-4'>
            <div className='space-y-2'>
              <Textarea
                placeholder='Enter text to convert to speech...'
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className='min-h-[120px] resize-none'
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

            <div className='flex items-center gap-3'>
              <div className='flex-1 grid grid-cols-2 gap-3'>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select Voice' />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice.value} value={voice.value}>
                        {voice.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSpeed} onValueChange={setSelectedSpeed}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select Speed' />
                  </SelectTrigger>
                  <SelectContent>
                    {speeds.map((speed) => (
                      <SelectItem key={speed.value} value={speed.value}>
                        {speed.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <>
                    <Volume2 className='w-4 h-4 mr-2' />
                    Generate Speech
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

