'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ModelSelector } from '@/components/playground/model-selector';
import { useToast } from '@/hooks/use-toast';
import { GlowEffect } from '@/components/ui/glow-effect';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Copy, RotateCcw, Heart } from 'lucide-react';

interface SentimentAnalysisPlaygroundProps {
  model: {
    name: string;
    provider: string;
    license: string;
    inputPrice: string;
    outputPrice: string;
    description: string;
    tags?: string[];
    cardGradient?: string;
    logo?: React.ReactNode;
  };
  selectedModel: string;
  modelData: Record<string, any>;
  onModelChange: (modelId: string) => void;
}

export function SentimentAnalysisPlayground({
  model,
  selectedModel,
  modelData,
  onModelChange,
}: SentimentAnalysisPlaygroundProps) {
  const { toast } = useToast();
  const [inputText, setInputText] = useState('');
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [showCostShimmer, setShowCostShimmer] = useState(false);
  const [metrics, setMetrics] = useState<{
    ttft: number;
    latency: number;
    tps: number;
    cost: number;
  } | null>(null);

  const maxCharacters = 5000;
  const characterCount = inputText.length;

  const handleAnalyze = () => {
    if (!inputText.trim()) {
      toast({ title: 'No text provided', description: 'Please enter some text to analyze.', variant: 'destructive' });
      return;
    }
    if (characterCount > maxCharacters) {
      toast({ title: 'Text too long', description: `Please limit your text to ${maxCharacters} characters.`, variant: 'destructive' });
      return;
    }
    setIsAnalyzing(true);
    setTimeout(() => {
      const m = {
        ttft: Math.floor(Math.random() * 200) + 50,
        latency: Math.floor(Math.random() * 500) + 300,
        tps: Math.floor(Math.random() * 100) + 100,
        cost: parseFloat(((characterCount / 1000000) * parseFloat(model.inputPrice)).toFixed(6)),
      };
      setMetrics(m);
      setTotalCost(prev => prev + m.cost);
      setShowCostShimmer(true);
      setTimeout(() => setShowCostShimmer(false), 2000);

      const output = `Analysis Result\n\n` +
        `Input Preview:\n${inputText.slice(0, 200)}${inputText.length > 200 ? '…' : ''}\n\n` +
        `Result:\n- Sentiment: Positive (mock)\n- Confidence: 0.93`;
      setAnalysisText(output);
      setIsAnalyzing(false);
      toast({ title: 'Analysis complete', description: 'Sentiment analysis generated.' });
    }, 1500);
  };

  const handleCopy = async () => {
    if (!analysisText) return;
    await navigator.clipboard.writeText(analysisText);
    toast({ title: 'Copied', description: 'Analysis result copied to clipboard.' });
  };

  const handleClear = () => {
    setAnalysisText(null);
    setMetrics(null);
  };

  return (
    <div className='flex flex-col lg:flex-row gap-6 min-h-[600px] lg:h-[calc(100vh-280px)]'>
      <div className='w-full lg:w-80 flex-shrink-0 flex flex-col lg:h-full relative'>
        <div className='flex-1 space-y-3 overflow-y-auto min-h-0 pb-4 lg:pb-32'>
          <div className='space-y-3'>
            <ModelSelector value={selectedModel} onChange={onModelChange} modelData={modelData} />
            <div className={`rounded-lg border p-4 space-y-4 ${model.cardGradient ?? ''}`}>
              <div className='space-y-1'>
                <div className={`flex items-center ${model.outputPrice ? 'justify-between' : 'justify-start'}`}>
                  <span className='text-base font-semibold text-gray-900'>{model.inputPrice}</span>
                  {model.outputPrice ? (
                    <span className='text-base font-semibold text-gray-900'>{model.outputPrice}</span>
                  ) : null}
                </div>
                <div className={`flex items-center text-xs text-gray-500 ${model.outputPrice ? 'justify-between' : 'justify-start'}`}>
                  <span>{(model as any).inputLabel ?? 'per 1M input characters'}</span>
                  {model.outputPrice ? (
                    <span>{(model as any).outputLabel ?? 'output'}</span>
                  ) : null}
                </div>
              </div>

              {/* Throughput */}
              <div className='flex items-center gap-2 py-2'>
                <span className='text-xs text-gray-500'>Throughput</span>
                <div className='flex-1 border-b border-dotted border-gray-300'></div>
                <span className='text-sm font-semibold text-gray-900'>{(model as any).throughput ?? '12,000 tokens/sec'}</span>
              </div>

              <div className='flex flex-wrap gap-2'>
                {model.tags?.map((tag: string, index: number) => (
                  <span key={index} className='px-2 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded font-medium'>
                    {tag}
                  </span>
                ))}
              </div>
              <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                <span>License: {model.license}</span>
              </div>
            </div>
          </div>
        </div>

        {analysisText && totalCost > 0 && (
          <div className='mt-3 p-3 lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:p-4'>
            <div style={{ borderRadius: '16px', border: '4px solid #FFF', background: 'linear-gradient(265deg, #FFF -13.17%, #F0F7FF 133.78%)', boxShadow: '0px 8px 39.1px -9px rgba(0, 27, 135, 0.08)', padding: '1.5rem' }}>
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

      <Card className='flex-1 flex flex-col min-h-[400px] lg:min-h-0 relative' style={{ background: 'linear-gradient(180deg, #8e92981a 0%, #ffffff 100%)' }}>
        <CardContent className='flex-1 flex flex-col min-h-0 p-0 relative'>
          <div className='flex-1 overflow-y-auto p-6'>
            <div className='space-y-4'>
              {!analysisText ? (
                <div className='flex flex-col items-center justify-center py-20 text-center'>
                  <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
                    <Heart className='w-8 h-8 text-gray-400' />
                  </div>
                  <p className='text-gray-500 text-sm'>Analysis result will appear here</p>
                  <p className='text-gray-400 text-xs mt-2'>Enter text below and click "Analyze"</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-sm font-semibold text-gray-700'>Analysis Result</h3>
                    <div className='flex items-center gap-2'>
                      <Button variant='outline' size='sm' onClick={handleCopy}>
                        <Copy className='w-4 h-4 mr-2' />
                        Copy
                      </Button>
                      <Button variant='outline' size='sm' onClick={handleClear}>
                        <RotateCcw className='w-4 h-4 mr-2' />
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className='bg-white rounded-lg border p-6 whitespace-pre-wrap text-sm text-gray-800'>
                    {analysisText}
                  </div>
                  {metrics && (
                    <div className='flex justify-end'>
                      <div className='bg-muted/50 rounded-md px-3 py-1.5 text-xs text-muted-foreground'>
                        <span className='font-medium'>TTFT:</span> {metrics.ttft} ms <span className='mx-1'>|</span>
                        <span className='font-medium'>Latency:</span> {metrics.latency} ms <span className='mx-1'>|</span>
                        <span className='font-medium'>TPS:</span> {metrics.tps} <span className='mx-1'>|</span>
                        <span className='font-medium'>Estimated Cost:</span> ₹{metrics.cost.toFixed(6)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className='flex-shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
            <div className='p-6'>
              <div className='relative w-full'>
                <motion.div className='absolute inset-0' animate={{ opacity: isInputFocused || inputText ? 0.35 : 0.2, scale: isInputFocused || inputText ? 1.03 : 1.02 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
                  <GlowEffect colors={['#0894FF', '#C959DD', '#FF2E54', '#FF9004']} mode='rotate' blur='stronger' duration={8} className='rounded-[24px]' />
                </motion.div>

                <motion.div className='relative w-full bg-white rounded-[24px] p-6 shadow-[0_2px_8px_0_rgba(0,0,0,0.08)]' animate={{ boxShadow: isInputFocused || inputText ? '0 8px 32px 0 rgba(0,0,0,0.16)' : '0 2px 8px 0 rgba(0,0,0,0.08)' }} transition={{ type: 'spring', stiffness: 120, damping: 18 }}>
                  <div className='space-y-4'>
                    <div className='flex items-start gap-3'>
                      <div className='flex-1 space-y-2'>
                        <Textarea
                          placeholder='Enter text to analyze sentiment...'
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onFocus={() => setIsInputFocused(true)}
                          onBlur={() => setIsInputFocused(false)}
                          className='min-h-[80px] resize-none placeholder:text-muted-foreground'
                          maxLength={maxCharacters}
                        />
                        <div className='flex items-center justify-between text-xs text-muted-foreground'>
                          <span>Characters: {characterCount.toLocaleString()} / {maxCharacters.toLocaleString()}</span>
                          {characterCount > maxCharacters * 0.9 && (
                            <span className='text-amber-600'>{maxCharacters - characterCount} characters remaining</span>
                          )}
                        </div>
                      </div>
                      <Button onClick={handleAnalyze} disabled={!inputText.trim() || isAnalyzing} className='px-8'>
                        {isAnalyzing ? (
                          <>
                            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                            Analyzing...
                          </>
                        ) : (
                          'Analyze'
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


