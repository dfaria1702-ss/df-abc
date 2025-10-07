'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { useToast } from '@/hooks/use-toast';
import { Mic, Upload, Copy, Loader2 } from 'lucide-react';

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
      toast({
        title: 'Recording started',
        description: 'Speak into your microphone',
      });

      // Mock: Stop recording after 3 seconds
      setTimeout(() => {
        setIsRecording(false);
        const mockDuration = Math.floor(Math.random() * 60) + 10; // 10-70 seconds
        setAudioDuration(mockDuration);
        setAudioFile(new File([], 'recording.wav', { type: 'audio/wav' }));
        toast({
          title: 'Recording stopped',
          description: `Duration: ${formatDuration(mockDuration)}`,
        });
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

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

    // Calculate cost
    const cost = calculateCost(audioDuration);
    setTotalCost(cost);

    setIsTranscribing(false);

    toast({
      title: 'Transcription complete',
      description: `Cost: ₹${cost.toFixed(6)}`,
    });
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
    <div className='grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6'>
      {/* LEFT SIDEBAR */}
      <div className='space-y-6'>
        {/* Model Selector */}
        <div>
          <label className='text-sm font-medium mb-2 block'>Model</label>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
        <Card className={model.cardGradient}>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>Model Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Pricing */}
            <div>
              <div className='text-xs text-muted-foreground mb-2'>Pricing</div>
              <div className='space-y-1'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Input</span>
                  <span className='text-sm font-semibold'>₹{model.inputPrice}</span>
                </div>
                <div className='text-xs text-muted-foreground'>Per Hour of Audio</div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className='text-xs text-muted-foreground mb-2'>Tags</div>
              <div className='flex flex-wrap gap-2'>
                {model.tags.map((tag) => (
                  <Badge key={tag} variant='secondary' className='text-xs'>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* License */}
            <div>
              <div className='text-xs text-muted-foreground mb-1'>License</div>
              <div className='text-sm'>{model.license}</div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className='space-y-2'>
          <Button
            variant='outline'
            className='w-full justify-start'
            onClick={onOpenCreateApiKey}
          >
            Get API key
          </Button>
          <Button
            variant='outline'
            className='w-full justify-start'
            onClick={onOpenSetupCode}
          >
            View code
          </Button>
        </div>

        {/* Total Cost Card */}
        {totalCost > 0 && (
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm'>Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>₹{totalCost.toFixed(6)}</div>
              <div className='text-xs text-muted-foreground mt-1'>
                For {formatDuration(audioDuration)} of audio
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className='space-y-6'>
        {/* Output Card - TOP */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Output</CardTitle>
            {transcribedText && (
              <TooltipWrapper content='Copy transcription'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleCopyTranscription}
                >
                  <Copy className='h-4 w-4' />
                </Button>
              </TooltipWrapper>
            )}
          </CardHeader>
          <CardContent>
            <div className='min-h-[300px] p-4 bg-muted/30 rounded-lg text-sm'>
              {isTranscribing ? (
                <div className='flex items-center justify-center h-full'>
                  <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                  <span className='ml-2 text-muted-foreground'>Transcribing...</span>
                </div>
              ) : transcribedText ? (
                <p className='whitespace-pre-wrap'>{transcribedText}</p>
              ) : (
                <p className='text-muted-foreground'>
                  Your output text will be generated here
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Input Card - BOTTOM */}
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Recording Button */}
            <div className='flex items-center gap-4'>
              <TooltipWrapper content={isRecording ? 'Stop recording' : 'Tap to start speaking'}>
                <button
                  onClick={handleRecording}
                  className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                      : 'bg-[#10A554] hover:bg-[#0d8a45]'
                  }`}
                >
                  <Mic className='h-5 w-5 text-white' />
                </button>
              </TooltipWrapper>
              <span className='text-sm text-muted-foreground'>
                {isRecording ? 'Recording...' : 'Tap to start speaking'}
              </span>
            </div>

            {/* OR Divider */}
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-border'></div>
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-background px-2 text-muted-foreground'>OR</span>
              </div>
            </div>

            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type='file'
                accept='.wav'
                onChange={handleFileChange}
                className='hidden'
              />
              <Upload className='h-8 w-8 mx-auto mb-3 text-muted-foreground' />
              <button className='text-[#10A554] hover:text-[#0d8a45] font-medium underline mb-2'>
                Upload File
              </button>
              <p className='text-sm text-muted-foreground'>
                Supports WAV format
              </p>
              <p className='text-sm text-muted-foreground'>
                Max file size 5MB and below 16khz
              </p>
              {audioFile && (
                <div className='mt-4 p-3 bg-muted rounded-lg'>
                  <p className='text-sm font-medium'>{audioFile.name}</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Duration: {formatDuration(audioDuration)}
                  </p>
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                Please select the target language
              </label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder='Select a language' />
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

            {/* Transcribe Button */}
            <Button
              onClick={handleTranscribe}
              disabled={!audioFile || !selectedLanguage || isTranscribing}
              className='w-full'
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
