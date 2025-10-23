'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { VercelTabs } from '@/components/ui/vercel-tabs';
import { Button } from '@/components/ui/button';
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
import { generateBreadcrumbs } from '@/lib/generate-breadcrumbs';

interface ServiceCardData {
  id: string;
  title: string;
  description: string;
  icon: any;
  gradient: string;
  borderClass: string;
  playgroundUrl: string;
}

const speechCards: ServiceCardData[] = [
  {
    id: 'tts',
    title: 'Text to Speech',
    description:
      'Transform written text into natural-sounding speech in multiple languages',
    icon: Volume2,
    gradient: 'from-green-100/50 via-emerald-50/30 to-white',
    borderClass: 'border-green-200/60',
    playgroundUrl: '/playground/text-to-speech',
  },
  {
    id: 'stt',
    title: 'Speech to Text',
    description:
      'Precisely capture and transcribe audio into text, making it easy to record and analyse spoken content',
    icon: Mic,
    gradient: 'from-slate-100/50 via-white/80 to-white',
    borderClass: 'border-slate-200',
    playgroundUrl: '/playground/speech-to-text',
  },
  {
    id: 'sts',
    title: 'Speech to Speech',
    description:
      'Directly translate spoken language into another, enabling smooth conversations across languages',
    icon: AudioLines,
    gradient: 'from-indigo-100/50 via-purple-50/30 to-white',
    borderClass: 'border-indigo-200/60',
    playgroundUrl: '/playground/speech-to-speech',
  },
];

const textCards: ServiceCardData[] = [
  {
    id: 'translation',
    title: 'Text Translation',
    description: 'Translate written content between languages',
    icon: Languages,
    gradient: 'from-slate-100/50 via-white/80 to-white',
    borderClass: 'border-slate-200',
    playgroundUrl: '/playground/text-translation',
  },
  {
    id: 'detection',
    title: 'Language Detection',
    description: 'Detect the language present in the text',
    icon: SearchCheck,
    gradient: 'from-indigo-100/50 via-purple-50/30 to-white',
    borderClass: 'border-indigo-200/60',
    playgroundUrl: '/playground/language-detection',
  },
  {
    id: 'extraction',
    title: 'Extraction',
    description: 'Extract the set of defined entities from the text',
    icon: FileText,
    gradient: 'from-slate-100/50 via-white/80 to-white',
    borderClass: 'border-slate-200',
    playgroundUrl: '/playground/text-extraction',
  },
  {
    id: 'sentiment',
    title: 'Sentiment Analysis',
    description:
      'Dominant sentiment detection for overall content and specific entity within',
    icon: Heart,
    gradient: 'from-orange-100/40 via-amber-50/30 to-white',
    borderClass: 'border-amber-200/60',
    playgroundUrl: '/playground/sentiment-analysis',
  },
  {
    id: 'summarization',
    title: 'Summarization',
    description: 'Summarize the main points and essence of a text',
    icon: ScrollText,
    gradient: 'from-green-100/40 via-emerald-50/30 to-white',
    borderClass: 'border-green-200/60',
    playgroundUrl: '/playground/text-summarization',
  },
];

function ServiceCard({ data }: { data: ServiceCardData }) {
  const Icon = data.icon;
  return (
    <div
      className={`bg-gradient-to-bl ${data.gradient} rounded-xl border ${data.borderClass} p-6 flex flex-col h-full`}
    >
      <div className='flex-1 flex flex-col'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='w-8 h-8 flex items-center justify-center'>
            <Icon className='h-6 w-6 text-foreground' />
          </div>
          <h4 className='text-base font-semibold text-foreground'>
            {data.title}
          </h4>
        </div>
        <p className='text-sm text-muted-foreground mb-8'>
          {data.description}
        </p>
      </div>
      <div className='mt-auto'>
        <Button className='w-full' asChild>
          <a href={data.playgroundUrl}>Playground</a>
        </Button>
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
