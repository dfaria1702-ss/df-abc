'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, Copy, ExternalLink, FileText } from 'lucide-react';
import { ModelSelector } from '@/components/playground/model-selector';
import { GlowEffect } from '@/components/ui/glow-effect';
import { motion } from 'framer-motion';

interface ExtractTextPlaygroundProps {
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
}

export function ExtractTextPlayground({ model, selectedModel, modelData, onModelChange }: ExtractTextPlaygroundProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extracted, setExtracted] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [entityType, setEntityType] = useState<string>('');
  const [summaryLength, setSummaryLength] = useState<string>('');

  const needsEntities = selectedModel === 'extract-info';
  const isPII = selectedModel === 'pii-masking';
  const needsSummaryLength = selectedModel === 'doc-summarization';
  const isReady = useMemo(() => {
    if (!file || !fileType || !language) return false;
    if (needsEntities && !entityType) return false;
    return true;
  }, [file, fileType, language, entityType, needsEntities]);

  // Default file type for PII masking
  useEffect(() => {
    if (isPII) {
      setFileType((prev) => (prev ? prev : 'digital'));
    } else if (fileType === 'digital') {
      setFileType('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPII]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setError('');
    setExtracted('');
    if (!selected) {
      setFile(null);
      return;
    }
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(selected.type)) {
      setError('Only JPG, JPEG, PNG files are supported');
      setFile(null);
      return;
    }
    if (selected.size > 2 * 1024 * 1024) {
      setError('Max file size is 2 MB');
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleExtract = () => {
    if (!isReady) return;
    setIsExtracting(true);
    setError('');
    setTimeout(() => {
      const mock = `Extracted Text (Language: ${language}, File Type: ${fileType}${needsEntities ? `, Entities: ${entityType}` : ''}${needsSummaryLength && summaryLength ? `, Length: ~${summaryLength} words` : ''})\n\n` +
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.';
      setExtracted(mock);
      setIsExtracting(false);
    }, 1200);
  };

  const handleCopy = async () => {
    if (!extracted) return;
    try {
      await navigator.clipboard.writeText(extracted);
    } catch {}
  };

  return (
    <div className='flex flex-col lg:flex-row gap-6 min-h-[600px] lg:h-[calc(100vh-280px)]'>
      {/* LEFT SIDEBAR */}
      <div className='w-full lg:w-80 flex-shrink-0 flex flex-col lg:h-full relative'>
        <div className='flex-1 space-y-3 overflow-y-auto min-h-0 pb-4 lg:pb-10'>
          {/* Model Section */}
          <div className='space-y-3'>
            <ModelSelector value={selectedModel} onChange={onModelChange} modelData={modelData} />

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
                  <span>{(model as any).inputLabel ?? 'per Document'}</span>
                  {model.outputPrice ? (
                    <span>{(model as any).outputLabel ?? 'per OCR'}</span>
                  ) : null}
                </div>
              </div>

              {/* Throughput */}
              <div className='flex items-center gap-2 py-2'>
                <span className='text-xs text-gray-500'>Throughput</span>
                <div className='flex-1 border-b border-dotted border-gray-300'></div>
                <span className='text-sm font-semibold text-gray-900'>{(model as any).throughput ?? '10,000 tokens/sec'}</span>
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
      </div>

      {/* MAIN CONTENT - Output + Input sticky at bottom */}
      <Card className='flex-1 flex flex-col min-h-[400px] lg:min-h-0 relative' style={{ background: 'linear-gradient(180deg, #8e92981a 0%, #ffffff 100%)' }}>
        <CardContent className='flex-1 flex flex-col min-h-0 p-0 relative'>
          {/* Output Section */}
          <div className='flex-1 overflow-y-auto p-6'>
            <div className='space-y-4'>
              {!extracted && !isExtracting ? (
                <div className='flex flex-col items-center justify-center py-20 text-center'>
                  <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
                    <FileText className='w-8 h-8 text-gray-400' />
                  </div>
                  <p className='text-gray-500 text-sm'>Your extracted text will appear here</p>
                  <p className='text-gray-400 text-xs mt-2'>Upload an image and select file type and language below</p>
                </div>
              ) : isExtracting ? (
                <div className='flex items-center justify-center min-h-[300px]'>
                  <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                  <span className='ml-2 text-muted-foreground'>Extracting...</span>
                </div>
              ) : (
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-sm font-semibold text-gray-700'>Extracted Text</h3>
                    {extracted && (
                      <Button variant='outline' size='sm' onClick={handleCopy}>
                        <Copy className='w-4 h-4 mr-2' /> Copy
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={extracted}
                    onChange={() => {}}
                    placeholder='Your extracted text will appear here.'
                    className='min-h-[260px] whitespace-pre-wrap'
                  />
                </div>
              )}
            </div>
          </div>

          {/* Input Section */}
          <div className='flex-shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
            <div className='p-6'>
              <div className='relative w-full'>
                <motion.div
                  className='absolute inset-0'
                  animate={{
                    opacity: isInputFocused || file ? 0.35 : 0.2,
                    scale: isInputFocused || file ? 1.03 : 1.02,
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <GlowEffect
                    colors={['#0894FF', '#C959DD', '#FF2E54', '#FF9004']}
                    mode='rotate'
                    blur='stronger'
                    duration={8}
                    className='rounded-[24px]'
                  />
                </motion.div>

                <motion.div
                  className='relative w-full bg-white rounded-[24px] p-4 shadow-[0_2px_8px_0_rgba(0,0,0,0.08)]'
                  animate={{
                    boxShadow: isInputFocused || file
                      ? '0 8px 32px 0 rgba(0,0,0,0.16)'
                      : '0 2px 8px 0 rgba(0,0,0,0.08)'
                  }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                >
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.jpg,.jpeg,.png,image/jpeg,image/png'
                    onChange={handleFileChange}
                    className='hidden'
                  />

                  <div className='space-y-4'>
                    {/* Upload */}
                    <div className='flex items-center gap-3'>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        onFocus={() => setIsInputFocused(true)}
                        className='flex items-center justify-center w-12 h-12 rounded-full border-2 border-border hover:border-[#10A554] transition-all bg-white flex-shrink-0'
                      >
                        <Upload className='h-5 w-5' />
                      </button>
                      <div className='whitespace-nowrap'>
                        <p className='text-xs text-muted-foreground font-medium'>Upload File</p>
                        <p className='text-xs text-muted-foreground/70'>JPG, JPEG, PNG • Max 2 MB • Up to 2 pages</p>
                      </div>
                      {file && <div className='ml-auto text-xs'>{file.name}</div>}
                    </div>

                    {/* Controls */}
                    <div className='flex items-end gap-3'>
                      <div className={`flex-1 grid gap-3 ${needsEntities || needsSummaryLength ? 'grid-cols-3' : 'grid-cols-2'}`}>
                        <div className='space-y-1.5'>
                          <label className='text-xs font-medium text-gray-600'>File Type</label>
                          <Select value={fileType} onValueChange={setFileType}>
                            <SelectTrigger className='h-10' onFocus={() => setIsInputFocused(true)}>
                              <SelectValue placeholder='Select' />
                            </SelectTrigger>
                              <SelectContent>
                                {isPII ? (
                                  <SelectItem value='digital'>Digital</SelectItem>
                                ) : (
                                  <>
                                    <SelectItem value='jpg'>JPG</SelectItem>
                                    <SelectItem value='jpeg'>JPEG</SelectItem>
                                    <SelectItem value='png'>PNG</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                          </Select>
                        </div>
                        <div className='space-y-1.5'>
                          <label className='text-xs font-medium text-gray-600'>Language</label>
                          <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger className='h-10' onFocus={() => setIsInputFocused(true)}>
                              <SelectValue placeholder='Select' />
                            </SelectTrigger>
                            <SelectContent>
                              {isPII ? (
                                <SelectItem value='English'>English</SelectItem>
                              ) : (
                                <>
                                  <SelectItem value='English'>English</SelectItem>
                                  <SelectItem value='Hindi'>Hindi</SelectItem>
                                  <SelectItem value='Tamil'>Tamil</SelectItem>
                                  <SelectItem value='Bengali'>Bengali</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        {needsEntities && (
                          <div className='space-y-1.5'>
                            <label className='text-xs font-medium text-gray-600'>Entities</label>
                            <Select value={entityType} onValueChange={setEntityType}>
                              <SelectTrigger className='h-10' onFocus={() => setIsInputFocused(true)}>
                                <SelectValue placeholder='Select' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='NER'>Named Entity Recognition (NER)</SelectItem>
                                <SelectItem value='PII'>Personally Identifiable Information (PII)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        {needsSummaryLength && (
                          <div className='space-y-1.5'>
                            <label className='text-xs font-medium text-gray-600'>Length (approx. words)</label>
                            <Input
                              type='number'
                              min={1}
                              placeholder='e.g., 200'
                              value={summaryLength}
                              onChange={(e) => setSummaryLength(e.target.value)}
                              className='h-10'
                              onFocus={() => setIsInputFocused(true)}
                            />
                          </div>
                        )}
                      </div>
                      <Button onClick={handleExtract} disabled={!isReady || isExtracting} className='px-8 h-10'>
                        {isExtracting ? (
                          <>
                            <Loader2 className='h-4 w-4 mr-2 animate-spin' /> Extracting...
                          </>
                        ) : (
                          'Extract Text'
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


