'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { useToast } from '@/hooks/use-toast';
import { Mic, Upload, Copy, Loader2, ExternalLink, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

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

    // Calculate cost and trigger shimmer animation
    const cost = calculateCost(audioDuration);
    setTotalCost(cost);
    setShowCostShimmer(true);
    setTimeout(() => setShowCostShimmer(false), 2000);

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

          {/* Parameters Section */}
          <div className='space-y-3'>
            <h3 className='text-sm font-medium text-foreground'>Parameters</h3>
            
            {/* Temperature */}
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <label className='text-sm text-muted-foreground'>Temperature</label>
                  <TooltipWrapper content="Controls randomness in the model's output. Higher values make output more random, lower values make it more focused and deterministic.">
                    <div className='w-4 h-4 rounded-full border border-muted-foreground/30 flex items-center justify-center text-xs'>
                      ?
                    </div>
                  </TooltipWrapper>
                </div>
                <span className='text-sm font-medium text-foreground'>{temperature[0]}</span>
              </div>
              
              <div className='px-2'>
                <Slider
                  value={temperature}
                  onValueChange={setTemperature}
                  max={2}
                  min={0}
                  step={0.1}
                  className='w-full'
                />
                <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                  <span>0</span>
                  <span>2</span>
                </div>
              </div>
            </div>

            {/* Advanced Parameters */}
            <div className='mt-6'>
              <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                <CollapsibleTrigger className='flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground'>
                  <span>Advanced parameters</span>
                  {isAdvancedOpen ? <ChevronDown className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
                </CollapsibleTrigger>
                <CollapsibleContent className='mt-4'>
                  <Card>
                    <CardContent className='p-4 space-y-4'>
                      {/* Maximum tokens */}
                      <div className='space-y-3'>
                        <div className='flex items-center gap-2'>
                          <label className='text-sm text-muted-foreground'>Maximum tokens</label>
                          <TooltipWrapper content="The maximum number of tokens that can be generated.">
                            <div className='w-4 h-4 rounded-full border border-muted-foreground/30 flex items-center justify-center text-xs'>
                              ?
                            </div>
                          </TooltipWrapper>
                        </div>
                        
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <input type="checkbox" id="unlimited" className='h-4 w-4' />
                            <label htmlFor="unlimited" className='text-sm text-muted-foreground'>Unlimited</label>
                          </div>
                          <Input 
                            value="1,024"
                            readOnly 
                            className='text-center'
                          />
                          <div className='px-2'>
                            <Slider
                              defaultValue={[1024]}
                              max={128000}
                              min={0}
                              step={1}
                              className='w-full'
                            />
                            <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                              <span>0</span>
                              <span>1,024</span>
                              <span>128000</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Top-p threshold */}
                      <div className='space-y-3'>
                        <div className='flex items-center gap-2'>
                          <label className='text-sm text-muted-foreground'>Top-p threshold</label>
                          <TooltipWrapper content="An alternative to sampling with temperature, called nucleus sampling.">
                            <div className='w-4 h-4 rounded-full border border-muted-foreground/30 flex items-center justify-center text-xs'>
                              ?
                            </div>
                          </TooltipWrapper>
                        </div>
                        
                        <div className='space-y-2'>
                          <Input 
                            value="0.9"
                            readOnly 
                            className='text-center'
                          />
                          <div className='px-2'>
                            <Slider
                              defaultValue={[0.9]}
                              max={1}
                              min={0}
                              step={0.1}
                              className='w-full'
                            />
                            <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                              <span>0</span>
                              <span>0.9</span>
                              <span>1</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
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
      <Card className='flex-1 flex flex-col min-h-0 relative overflow-hidden' style={{ background: 'linear-gradient(180deg, #8e92981a 0%, #ffffff 100%)' }}>
        <CardContent className='flex-1 flex flex-col min-h-0 p-0 overflow-hidden relative'>
          {/* Output Section - Scrollable */}
          <div className='flex-1 overflow-y-auto p-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-medium text-foreground'>Output</h3>
                {transcribedText && (
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
                )}
              </div>
              
              {isTranscribing ? (
                <div className='flex items-center justify-center min-h-[400px]'>
                  <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                  <span className='ml-2 text-muted-foreground'>Transcribing...</span>
                </div>
              ) : transcribedText ? (
                <div className='p-4 bg-white rounded-lg border text-sm'>
                  <p className='whitespace-pre-wrap'>{transcribedText}</p>
                </div>
              ) : (
                <div className='flex items-center justify-center min-h-[400px]'>
                  <p className='text-muted-foreground'>
                    Your output text will be generated here
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Input Section - Sticky at bottom with highlight - Compact horizontal design */}
          <div className='flex-shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
            <div className='p-6'>
              {/* Unified Input Card */}
              <div
                className={`border rounded-lg p-4 transition-colors ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background'
                }`}
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
                
                <div className='space-y-3'>
                  {/* Top Row: Recording and Upload buttons side by side */}
                  {!audioFile ? (
                    <div className='flex items-center gap-4'>
                      {/* Recording Button */}
                      <TooltipWrapper content={isRecording ? 'Stop recording' : 'Tap to start speaking'}>
                        <button
                          onClick={handleRecording}
                          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all flex-shrink-0 ${
                            isRecording
                              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                              : 'bg-[#10A554] hover:bg-[#0d8a45]'
                          }`}
                        >
                          <Mic className='h-4 w-4 text-white' />
                        </button>
                      </TooltipWrapper>
                      
                      <span className='text-sm text-muted-foreground'>
                        {isRecording ? 'Recording...' : 'Tap to start speaking'}
                      </span>

                      {/* Vertical Divider */}
                      <div className='h-8 w-px bg-border'></div>

                      {/* Upload Button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className='flex items-center gap-2 text-sm text-[#10A554] hover:text-[#0d8a45] font-medium'
                      >
                        <Upload className='h-4 w-4' />
                        Upload File
                      </button>

                      <span className='text-xs text-muted-foreground ml-auto'>
                        WAV • Max 5MB • 16khz
                      </span>
                    </div>
                  ) : (
                    /* File Info Display - Horizontal */
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-lg bg-[#10A554]/10 flex items-center justify-center flex-shrink-0'>
                        <Mic className='h-4 w-4 text-[#10A554]' />
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
                  )}

                  {/* Bottom Row: Language Selector and Transcribe Button */}
                  <div className='flex items-center gap-3 pt-2 border-t'>
                    <div className='flex-1'>
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className='h-9'>
                          <SelectValue placeholder='Select target language' />
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

                    <Button
                      onClick={handleTranscribe}
                      disabled={!audioFile || !selectedLanguage || isTranscribing}
                      size='sm'
                      className='px-6'
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
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
