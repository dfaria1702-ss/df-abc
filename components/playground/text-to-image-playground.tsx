'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModelSelector } from '@/components/playground/model-selector';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { useToast } from '@/hooks/use-toast';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { ChatBubbleAvatar } from '@/components/ui/chat-bubble';
import { AIChatInput } from '@/components/ui/ai-chat-input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { 
  Copy, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  RotateCcw,
  User,
  ChevronUp,
  ImageIcon,
  Download,
  Sparkles
} from 'lucide-react';

interface TextToImagePlaygroundProps {
  model: {
    name: string;
    provider: string;
    license: string;
    inputPrice: string;
    outputPrice: string;
    description: string;
    tags?: string[];
    logo: React.ReactNode;
    cardGradient: string;
  };
  selectedModel: string;
  modelData: Record<string, any>;
  onModelChange: (model: string) => void;
  onOpenSetupCode: () => void;
  onOpenCreateApiKey: () => void;
}

// Sample prompts for quick actions
const samplePrompts = [
  {
    label: 'Mountain Landscape',
    prompt: 'A serene mountain landscape at sunset with vibrant colors and dramatic clouds',
  },
  {
    label: 'Futuristic City',
    prompt: 'A futuristic city with flying cars, neon lights, and towering skyscrapers',
  },
  {
    label: 'Cute Robot',
    prompt: 'A cute robot reading a book in a cozy library, digital art style',
  },
  {
    label: 'Abstract Art',
    prompt: 'An abstract artwork with flowing colors and geometric shapes',
  },
];

export function TextToImagePlayground({
  model,
  selectedModel,
  modelData,
  onModelChange,
  onOpenSetupCode,
  onOpenCreateApiKey,
}: TextToImagePlaygroundProps) {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isSystemPromptVisible, setIsSystemPromptVisible] = useState(true);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    isThinking?: boolean;
    imageUrl?: string;
    responseMetrics?: {
      ttft: number;
      latency: number;
      cost: number;
    };
  }>>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [showCostShimmer, setShowCostShimmer] = useState(false);
  const [isCostPopoverOpen, setIsCostPopoverOpen] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Image generation parameters
  const [imageSize, setImageSize] = useState('1024x1024');
  const [quality, setQuality] = useState('standard');
  const [steps, setSteps] = useState([50]);
  const [guidanceScale, setGuidanceScale] = useState([7.5]);

  // Image size options
  const imageSizes = [
    { value: '512x512', label: '512 × 512' },
    { value: '768x768', label: '768 × 768' },
    { value: '1024x1024', label: '1024 × 1024' },
    { value: '1024x1792', label: '1024 × 1792 (Portrait)' },
    { value: '1792x1024', label: '1792 × 1024 (Landscape)' },
  ];

  // Quality options
  const qualityOptions = [
    { value: 'standard', label: 'Standard' },
    { value: 'hd', label: 'HD' },
  ];

  const handleClearChat = () => {
    setChatHistory([]);
    setTotalCost(0);
    setIsSystemPromptVisible(true);
    toast({
      title: "Chat cleared",
      description: "All conversation history has been cleared.",
    });
  };

  const handleCopySystemPrompt = async () => {
    try {
      await navigator.clipboard.writeText(systemPrompt);
      toast({
        title: "System prompt copied",
        description: "The system prompt has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Hide system prompt after first user message
    if (isSystemPromptVisible) {
      setIsSystemPromptVisible(false);
    }
    
    // Add user message to chat
    const newMessage = { 
      role: 'user' as const, 
      content: message,
    };
    setChatHistory(prev => [...prev, newMessage]);
    
    // Clear input
    setMessage('');
    
    // Add thinking state
    const thinkingMessage = { 
      role: 'assistant' as const, 
      content: '', 
      isThinking: true 
    };
    setChatHistory(prev => [...prev, thinkingMessage]);
    
    // Simulate image generation (in real app, this would call the API)
    setTimeout(() => {
      // Generate mock metrics for response
      const responseMetrics = {
        ttft: Math.floor(Math.random() * 500) + 500, // 500-1000ms
        latency: Math.floor(Math.random() * 2000) + 2000, // 2-4s
        cost: parseFloat(model.inputPrice) * 0.001, // Mock cost
      };

      // Update totals
      setTotalCost(prev => prev + responseMetrics.cost);
      setShowCostShimmer(true);
      setTimeout(() => setShowCostShimmer(false), 2000);

      // Generate mock image using placeholder service
      const mockImage = `https://picsum.photos/seed/${Date.now()}/1024/1024`;

      // Remove thinking message and add actual response with image
      setChatHistory(prev => {
        const withoutThinking = prev.slice(0, -1);
        const aiResponse = { 
          role: 'assistant' as const, 
          content: newMessage.content,
          imageUrl: mockImage,
          responseMetrics: responseMetrics
        };
        return [...withoutThinking, aiResponse];
      });

      toast({
        title: 'Image Generated',
        description: 'Your image has been successfully generated!',
      });
    }, 3000);
  };

  const handleQuickAction = (actionLabel: string) => {
    const action = samplePrompts.find(a => a.label === actionLabel);
    if (!action) return;

    // Hide system prompt after first user message
    if (isSystemPromptVisible) {
      setIsSystemPromptVisible(false);
    }

    // Add user message
    const userMessage = {
      role: 'user' as const,
      content: action.prompt,
    };

    // Add thinking state
    const thinkingMessage = {
      role: 'assistant' as const,
      content: '',
      isThinking: true,
    };

    setChatHistory(prev => [...prev, userMessage, thinkingMessage]);

    // Simulate image generation
    setTimeout(() => {
      const responseMetrics = {
        ttft: Math.floor(Math.random() * 500) + 500,
        latency: Math.floor(Math.random() * 2000) + 2000,
        cost: parseFloat(model.inputPrice) * 0.001,
      };

      setTotalCost(prev => prev + responseMetrics.cost);
      setShowCostShimmer(true);
      setTimeout(() => setShowCostShimmer(false), 2000);

      const mockImage = `https://picsum.photos/seed/${Date.now()}/1024/1024`;

      setChatHistory(prev => {
        const withoutThinking = prev.filter(msg => !msg.isThinking);
        const aiResponse = {
          role: 'assistant' as const,
          content: action.prompt,
          imageUrl: mockImage,
          responseMetrics: responseMetrics
        };
        return [...withoutThinking, aiResponse];
      });
    }, 3000);
  };

  const handleRegenerateResponse = (index: number) => {
    // Get the prompt from the user message before this assistant response
    const userMessage = chatHistory[index - 1];
    if (!userMessage || userMessage.role !== 'user') return;

    // Add a new "thinking" state after the current response
    setChatHistory(prev => {
      const newHistory = [...prev];
      newHistory.splice(index + 1, 0, { 
        role: 'assistant' as const, 
        content: '', 
        isThinking: true 
      });
      return newHistory;
    });

    // Simulate regeneration
    setTimeout(() => {
      const responseMetrics = {
        ttft: Math.floor(Math.random() * 500) + 500,
        latency: Math.floor(Math.random() * 2000) + 2000,
        cost: parseFloat(model.inputPrice) * 0.001,
      };

      setTotalCost(prev => prev + responseMetrics.cost);
      setShowCostShimmer(true);
      setTimeout(() => setShowCostShimmer(false), 2000);

      const mockImage = `https://picsum.photos/seed/${Date.now() + Math.random()}/1024/1024`;

      setChatHistory(prev => {
        const withoutThinking = prev.filter(msg => !msg.isThinking);
        const aiResponse = {
          role: 'assistant' as const,
          content: userMessage.content,
          imageUrl: mockImage,
          responseMetrics: responseMetrics
        };
        // Insert after the original response
        withoutThinking.splice(index + 1, 0, aiResponse);
        return withoutThinking;
      });
    }, 3000);
  };

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Message copied",
        description: "The message has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadImage = (imageUrl: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Downloaded',
      description: 'Image downloaded successfully',
    });
  };

  // Check if chat container is scrollable
  useEffect(() => {
    const checkScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        setShowScrollIndicator(scrollHeight > clientHeight && scrollTop + clientHeight < scrollHeight - 20);
      }
    };

    const container = chatContainerRef.current;
    if (container) {
      checkScroll();
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [chatHistory]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className='flex flex-col lg:flex-row gap-6 min-h-[600px] lg:h-[calc(100vh-280px)]'>
      {/* Left Sidebar */}
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
                <div className='flex items-center justify-between'>
                  <span className='text-base font-semibold text-gray-900'>₹{model.inputPrice}</span>
                  <span className='text-base font-semibold text-gray-900'>₹{model.outputPrice}</span>
                </div>
                <div className='flex items-center justify-between text-xs text-gray-500'>
                  <span>Per 1M Input Tokens</span>
                  <span>Per 1M Output Tokens</span>
                </div>
              </div>

              {/* Throughput */}
              <div className='flex items-center gap-2 py-2'>
                <span className='text-xs text-gray-500'>Throughput</span>
                <div className='flex-1 border-b border-dotted border-gray-300'></div>
                <span className='text-sm font-semibold text-gray-900'>{(model as any).throughput ?? '25 images/min'}</span>
              </div>

              {/* Tags */}
              {model.tags && model.tags.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {model.tags.map((tag, index) => (
                    <span key={index} className='px-2 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded font-medium'>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

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
            
            {/* Image Size */}
            <div className='space-y-2'>
              <label className='text-sm text-muted-foreground'>Image Size</label>
              <Select value={imageSize} onValueChange={setImageSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {imageSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quality */}
            <div className='space-y-2'>
              <label className='text-sm text-muted-foreground'>Quality</label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {qualityOptions.map((q) => (
                    <SelectItem key={q.value} value={q.value}>
                      {q.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                      {/* Guidance Scale */}
                      <div className='space-y-3'>
                        <div className='flex items-center gap-2'>
                          <label className='text-sm text-muted-foreground'>Guidance Scale</label>
                          <TooltipWrapper content="Controls how closely the image matches the prompt. Higher values mean more adherence to prompt.">
                            <div className='w-4 h-4 rounded-full border border-muted-foreground/30 flex items-center justify-center text-xs'>
                              ?
                            </div>
                          </TooltipWrapper>
                        </div>
                        
                        <div className='space-y-2'>
                          <Input 
                            value={guidanceScale[0]}
                            readOnly 
                            className='text-center'
                          />
                          <div className='px-2'>
                            <Slider
                              value={guidanceScale}
                              onValueChange={setGuidanceScale}
                              max={20}
                              min={1}
                              step={0.5}
                              className='w-full'
                            />
                            <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                              <span>1</span>
                              <span>7.5</span>
                              <span>20</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Steps */}
                      <div className='space-y-3'>
                        <div className='flex items-center gap-2'>
                          <label className='text-sm text-muted-foreground'>Steps</label>
                          <TooltipWrapper content="Number of denoising steps. More steps generally produce better quality but take longer.">
                            <div className='w-4 h-4 rounded-full border border-muted-foreground/30 flex items-center justify-center text-xs'>
                              ?
                            </div>
                          </TooltipWrapper>
                        </div>
                        
                        <div className='space-y-2'>
                          <Input 
                            value={steps[0]}
                            readOnly 
                            className='text-center'
                          />
                          <div className='px-2'>
                            <Slider
                              value={steps}
                              onValueChange={setSteps}
                              max={100}
                              min={10}
                              step={5}
                              className='w-full'
                            />
                            <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                              <span>10</span>
                              <span>50</span>
                              <span>100</span>
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

        {/* Fixed Cost Information */}
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
                <div className='p-1'>
                  <div className='py-1.5 px-2 text-xs font-medium text-muted-foreground'>
                    Cost Breakdown
                  </div>
                  <div className='border-t my-1'></div>
                  <div className='px-2 py-1.5 flex justify-between items-center text-sm'>
                    <span className='text-muted-foreground'>Total Images Generated</span>
                    <span className='font-medium'>{chatHistory.filter(msg => msg.role === 'assistant' && !msg.isThinking).length}</span>
                  </div>
                  <div className='border-t my-1'></div>
                  <div className='px-2 py-1.5 flex justify-between items-center text-sm font-semibold'>
                    <span>Total Cost</span>
                    <span>₹{totalCost.toFixed(6)}</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Right Panel */}
      <Card className='flex-1 flex flex-col min-h-[400px] lg:min-h-0 relative overflow-hidden' style={{ background: 'linear-gradient(180deg, #8e92981a 0%, #ffffff 100%)' }}>
        <CardContent className='flex-1 flex flex-col min-h-0 p-0 overflow-hidden relative'>
          {/* System Prompt Section */}
          <div className='flex-shrink-0 space-y-3 p-6 pb-0'>
            {isSystemPromptVisible ? (
              <>
                <div className='flex items-center justify-between'>
                  <h3 className='text-sm font-medium text-foreground'>
                    System Prompt
                  </h3>
                  <div className='flex items-center gap-2'>
                    {chatHistory.length > 0 && (
                      <TooltipWrapper content="Clear all messages and start fresh">
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={handleClearChat}
                          className='h-7 px-3 text-xs'
                        >
                          Clear chat
                        </Button>
                      </TooltipWrapper>
                    )}
                    {systemPrompt.trim() && (
                      <TooltipWrapper content="Copy system prompt to clipboard">
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={handleCopySystemPrompt}
                          className='h-6 w-6 p-0'
                        >
                          <Copy className='h-3 w-3' />
                        </Button>
                      </TooltipWrapper>
                    )}
                    {chatHistory.length > 0 && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setIsSystemPromptVisible(false)}
                        className='h-7 px-3 text-xs text-muted-foreground hover:text-foreground'
                      >
                        Hide System Prompt
                      </Button>
                    )}
                  </div>
                </div>
                
                <textarea
                  placeholder="Enter style instructions, quality settings, or any general guidelines for image generation (e.g., 'high quality, detailed, 8k resolution, professional photography')"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className='w-full min-h-[60px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none'
                />
              </>
            ) : (
              <div className='flex items-center justify-between'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setIsSystemPromptVisible(true)}
                  className='h-7 px-3 text-xs text-muted-foreground hover:text-foreground'
                >
                  Show System Prompt
                </Button>
                {chatHistory.length > 0 && (
                  <TooltipWrapper content="Clear all messages and start fresh">
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleClearChat}
                      className='h-7 px-3 text-xs'
                    >
                      Clear chat
                    </Button>
                  </TooltipWrapper>
                )}
              </div>
            )}
          </div>

          {/* Chat History */}
          <div className='flex-1 flex flex-col mt-6 min-h-0 px-6 relative'>
            {chatHistory.length === 0 ? (
              <div className='flex-1 flex items-center justify-center'>
                <div className='text-center space-y-4 text-muted-foreground'>
                  <div className='flex flex-col items-center space-y-3'>
                    <ImageIcon className='h-8 w-8 text-muted-foreground' />
                    <div>
                      <div className='text-base font-semibold mb-1 text-gray-900'>Generate an image</div>
                      <div className='text-sm'>Enter a prompt below or use one of the quick actions</div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className='flex flex-wrap gap-2 justify-center'>
                    {samplePrompts.map((action, index) => (
                      <Button
                        key={index}
                        variant='outline'
                        size='sm'
                        onClick={() => handleQuickAction(action.label)}
                        className='text-xs'
                      >
                        <Sparkles className='h-3 w-3 mr-1' />
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div ref={chatContainerRef} className='flex-1 overflow-y-auto pr-2'>
                {chatHistory.map((msg, index) => (
                  <div key={index} className='py-6 first:pt-0 last:pb-0'>
                    {msg.role === 'user' ? (
                      <div className='flex gap-3 justify-end group'>
                        <div className='flex-1 flex flex-col items-end gap-2'>
                          <div className='flex items-start gap-2'>
                            {/* Copy Button */}
                            <div className='opacity-0 group-hover:opacity-100 transition-opacity pt-3'>
                              <TooltipWrapper content="Copy prompt">
                                <button
                                  onClick={() => handleCopyMessage(msg.content)}
                                  className='p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'
                                >
                                  <Copy className='h-[18px] w-[18px]' />
                                </button>
                              </TooltipWrapper>
                            </div>
                            <div className='rounded-lg p-3 text-sm max-w-[85%]' style={{ backgroundColor: '#ffffff' }}>
                              {msg.content}
                            </div>
                          </div>
                        </div>
                        <ChatBubbleAvatar className='h-8 w-8 bg-muted'>
                          <User className='h-4 w-4 text-muted-foreground' />
                        </ChatBubbleAvatar>
                      </div>
                    ) : msg.isThinking ? (
                      <div className='flex gap-3'>
                        <ChatBubbleAvatar className='h-8 w-8'>
                          {model.logo}
                        </ChatBubbleAvatar>
                        <div className='flex-1'>
                          <TextShimmer duration={1.5} className='text-sm font-medium'>
                            Generating image...
                          </TextShimmer>
                        </div>
                      </div>
                    ) : (
                      <div className='flex gap-3 group'>
                        <ChatBubbleAvatar className='h-8 w-8'>
                          {model.logo}
                        </ChatBubbleAvatar>
                        <div className='flex-1 space-y-3'>
                          {/* Generated Image */}
                          {msg.imageUrl && (
                            <div className='rounded-lg overflow-hidden border border-gray-200 bg-white max-w-2xl'>
                              <img 
                                src={msg.imageUrl} 
                                alt='Generated' 
                                className='w-full h-auto cursor-pointer hover:opacity-90 transition-opacity'
                                onClick={() => setSelectedImage(msg.imageUrl || null)}
                              />
                            </div>
                          )}
                          
                          {/* Action Icons and Metrics */}
                          <div className='flex items-center justify-between gap-4'>
                            <div className='flex items-center gap-1'>
                              <TooltipWrapper content="Regenerate image">
                                <button
                                  onClick={() => handleRegenerateResponse(index)}
                                  className='p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'
                                >
                                  <RotateCcw className='h-[18px] w-[18px]' />
                                </button>
                              </TooltipWrapper>
                              {msg.imageUrl && (
                                <TooltipWrapper content="Download image">
                                  <button
                                    onClick={() => handleDownloadImage(msg.imageUrl!, msg.content)}
                                    className='p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'
                                  >
                                    <Download className='h-[18px] w-[18px]' />
                                  </button>
                                </TooltipWrapper>
                              )}
                            </div>
                            
                            {/* Performance Metrics */}
                            {msg.responseMetrics && (
                              <div className='bg-muted/50 rounded-md px-3 py-1.5 text-xs text-muted-foreground'>
                                <span className='font-medium'>TTFT:</span> {msg.responseMetrics.ttft} ms <span className='mx-1'>|</span>
                                <span className='font-medium'>Latency:</span> {msg.responseMetrics.latency} ms <span className='mx-1'>|</span>
                                <span className='font-medium'>Cost:</span> ₹{msg.responseMetrics.cost.toFixed(6)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Scroll Indicator */}
            {showScrollIndicator && chatHistory.length > 0 && (
              <div className='absolute bottom-4 left-1/2 -translate-x-1/2 z-10'>
                <button
                  onClick={scrollToBottom}
                  className='bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-gray-300'
                >
                  <ChevronDown className='h-5 w-5 text-gray-600 animate-bounce' />
                </button>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className='pt-4 flex-shrink-0 px-6 pb-6'>
            <AIChatInput
              value={message}
              onChange={setMessage}
              onSend={handleSendMessage}
              placeholder={[
                "A serene mountain landscape at sunset",
                "A futuristic city with neon lights",
                "A cute robot in a library",
                "An abstract artwork with flowing colors",
                "A magical forest with glowing trees",
                "A steampunk airship in the clouds"
              ]}
              className="p-0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className='max-w-4xl p-0 bg-transparent border-none'>
            <DialogClose className='absolute right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground bg-white p-2'>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              <span className='sr-only'>Close</span>
            </DialogClose>
            <img src={selectedImage} alt='Preview' className='w-full h-auto rounded-lg' />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
