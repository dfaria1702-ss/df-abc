'use client';

import { useEffect, useState } from 'react';
import type React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  Mic,
  Volume2,
  AudioLines,
  Languages,
  SearchCheck,
  FileText,
  Heart,
  ScrollText,
} from 'lucide-react';
import { PageShell } from '@/components/page-shell';
import { VercelTabs } from '@/components/ui/vercel-tabs';
import { Button } from '@/components/ui/button';
import { generateBreadcrumbs } from '@/lib/generate-breadcrumbs';

interface ServiceCardData {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: 'Speech' | 'Text';
  tags: string[];
  playgroundUrl: string;
  // Model-catalog style
  logo: React.ReactNode;
  gradient: string;
  inputPrice: string; // display string e.g., '₹4.2' or '—'
  outputPrice: string; // display string e.g., '₹16.7' or '—'
  pricingType: 'audio' | 'text';
}

const speechCards: ServiceCardData[] = [
  {
    id: 'tts',
    title: 'Text to Speech',
    description:
      'Transform written text into natural-sounding speech in multiple languages',
    icon: Volume2,
    category: 'Speech',
    tags: ['Neural voices', 'Multilingual'],
    playgroundUrl: '/playground/text-to-speech',
    logo: <Volume2 className='w-8 h-8 text-gray-700' />,
    gradient: 'from-green-100/50 via-emerald-50/30 to-white',
    inputPrice: '₹4.2',
    outputPrice: '—',
    pricingType: 'text',
  },
  {
    id: 'stt',
    title: 'Speech to Text',
    description:
      'Precisely capture and transcribe audio into text, making it easy to record and analyse spoken content',
    icon: Mic,
    category: 'Speech',
    tags: ['Streaming', 'Speaker diarization'],
    playgroundUrl: '/playground/speech-to-text',
    logo: <Mic className='w-8 h-8 text-gray-700' />,
    gradient: 'from-slate-100/50 via-white/80 to-white',
    inputPrice: '₹24',
    outputPrice: '—',
    pricingType: 'audio',
  },
  {
    id: 'sts',
    title: 'Speech to Speech',
    description:
      'Directly translate spoken language into another, enabling smooth conversations across languages',
    icon: AudioLines,
    category: 'Speech',
    tags: ['Real-time translation', 'Voice adaptation'],
    playgroundUrl: '/playground/speech-to-speech',
    logo: <AudioLines className='w-8 h-8 text-gray-700' />,
    gradient: 'from-indigo-100/50 via-purple-50/30 to-white',
    inputPrice: '₹30',
    outputPrice: '₹30',
    pricingType: 'audio',
  },
];

const textCards: ServiceCardData[] = [
  {
    id: 'translation',
    title: 'Text Translation',
    description: 'Translate written content between languages',
    icon: Languages,
    category: 'Text',
    tags: ['Neural', 'Batch & streaming'],
    playgroundUrl: '/playground/text-translation',
    logo: <Languages className='w-8 h-8 text-gray-700' />,
    gradient: 'from-slate-100/50 via-white/80 to-white',
    inputPrice: '₹3.0',
    outputPrice: '₹12.0',
    pricingType: 'text',
  },
  {
    id: 'detection',
    title: 'Language Detection',
    description: 'Detect the language present in the text',
    icon: SearchCheck,
    category: 'Text',
    tags: ['Fast', 'Short & long form'],
    playgroundUrl: '/playground/language-detection',
    logo: <SearchCheck className='w-8 h-8 text-gray-700' />,
    gradient: 'from-indigo-100/50 via-purple-50/30 to-white',
    inputPrice: '₹0.5',
    outputPrice: '—',
    pricingType: 'text',
  },
  {
    id: 'extraction',
    title: 'Extraction',
    description: 'Extract the set of defined entities from the text',
    icon: FileText,
    category: 'Text',
    tags: ['Custom schema', 'Structured output'],
    playgroundUrl: '/playground/text-extraction',
    logo: <FileText className='w-8 h-8 text-gray-700' />,
    gradient: 'from-slate-100/50 via-white/80 to-white',
    inputPrice: '₹2.5',
    outputPrice: '—',
    pricingType: 'text',
  },
  {
    id: 'sentiment',
    title: 'Sentiment Analysis',
    description:
      'Dominant sentiment detection for overall content and specific entity within',
    icon: Heart,
    category: 'Text',
    tags: ['Entity-level', 'Multilingual'],
    playgroundUrl: '/playground/sentiment-analysis',
    logo: <Heart className='w-8 h-8 text-gray-700' />,
    gradient: 'from-orange-100/40 via-amber-50/30 to-white',
    inputPrice: '₹1.2',
    outputPrice: '—',
    pricingType: 'text',
  },
  {
    id: 'summarization',
    title: 'Summarization',
    description: 'Summarize the main points and essence of a text',
    icon: ScrollText,
    category: 'Text',
    tags: ['Abstractive', 'Configurable length'],
    playgroundUrl: '/playground/text-summarization',
    logo: <ScrollText className='w-8 h-8 text-gray-700' />,
    gradient: 'from-green-100/40 via-emerald-50/30 to-white',
    inputPrice: '₹6.0',
    outputPrice: '₹18.0',
    pricingType: 'text',
  },
];

function ServiceCard({ data }: { data: ServiceCardData }) {
  const borderClass = data.gradient.includes('indigo')
    ? 'border-indigo-200/60'
    : data.gradient.includes('green')
    ? 'border-green-200/60'
    : 'border-slate-200';
  return (
    <div className={`bg-gradient-to-bl ${data.gradient} rounded-xl border ${borderClass} p-6 flex flex-col h-full`}>
      {/* Top Content - Flexible */}
      <div className='flex-1 flex flex-col'>
        {/* Logo/Icon */}
        <div className='flex justify-start mb-4'>
          <div className='w-8 h-8 flex items-center justify-center'>
            {data.logo}
          </div>
        </div>

        {/* Title and description */}
        <div className='space-y-1 mb-10'>
          <h3 className='text-lg font-semibold text-gray-900'>{data.title}</h3>
          <p className='text-sm text-gray-600'>{data.description}</p>
        </div>
      </div>

      {/* Bottom Content - Fixed to bottom */}
      <div className='mt-auto space-y-4'>
        {/* Pricing */}
        <div className='space-y-1'>
          <div className='flex items-center justify-between'>
            <span className='text-lg font-semibold text-gray-900'>{data.inputPrice}</span>
            <span className={`text-lg font-semibold ${data.outputPrice === '—' ? 'text-gray-400' : 'text-gray-900'}`}>{data.outputPrice}</span>
          </div>
          <div className='flex items-center justify-between text-xs text-gray-500'>
            <span>{data.pricingType === 'audio' ? 'Per Hour of Input Audio' : 'Per 1M Input Tokens'}</span>
            <span>{data.pricingType === 'audio' ? 'Output' : 'Per 1M Output Tokens'}</span>
          </div>
        </div>

        {/* Tags */}
        <div className='flex flex-wrap gap-2'>
          {data.tags.map(tag => (
            <span key={tag} className='px-2 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded font-medium'>
              {tag}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <div className='flex space-x-3'>
          <Button className='flex-1' asChild>
            <a href={data.playgroundUrl}>Playground</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BhashikServicesPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<'speech' | 'text'>('speech');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'text') setActiveTab('text');
    if (tabParam === 'speech') setActiveTab('speech');
  }, [searchParams]);

  const description =
    activeTab === 'speech'
      ? "Explore Bhashik's speech services: Text to Speech, Speech to Text, and Speech to Speech."
      : "Explore Bhashik's text services: Translation, Detection, Extraction, Sentiment, and Summarization.";

  // Custom breadcrumbs with dynamic last segment title based on active tab
  const baseCrumbs = generateBreadcrumbs(pathname);
  const customBreadcrumbs = baseCrumbs.length
    ? [
        ...baseCrumbs.slice(0, -1),
        { ...baseCrumbs[baseCrumbs.length - 1], title: activeTab === 'speech' ? 'Speech Services' : 'Text Services' },
      ]
    : baseCrumbs;

  return (
    <PageShell title='Bhashik' description={description} customBreadcrumbs={customBreadcrumbs}>
      <div className='space-y-6'>
        <VercelTabs
          tabs={[
            { id: 'speech', label: 'Speech Services' },
            { id: 'text', label: 'Text Services' },
          ]}
          activeTab={activeTab}
          onTabChange={(id: string) => setActiveTab(id as 'speech' | 'text')}
          size='lg'
        />

        {activeTab === 'speech' && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {speechCards.map(card => (
              <ServiceCard key={card.id} data={card} />
            ))}
          </div>
        )}

        {activeTab === 'text' && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {textCards.map(card => (
              <ServiceCard key={card.id} data={card} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
