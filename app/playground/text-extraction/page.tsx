'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { TextExtractionPlayground } from '@/components/playground/text-extraction-playground';
import { Languages, SearchCheck, FileText, Heart, ScrollText } from 'lucide-react';

const modelData = {
  'text-translation': {
    name: 'Bhashik / Text Translation',
    provider: 'Bhashik',
    modality: 'Text-to-Text',
    license: 'Proprietary',
    inputPrice: '5',
    outputPrice: '0',
    description: 'Translate written content between languages',
    tags: ['Translation', 'Text', 'Multilingual'],
    cardGradient: 'bg-gradient-to-bl from-slate-100/50 via-white/80 to-white border-slate-200/60',
    logo: <Languages className='h-5 w-5' />,
  },
  'language-detection': {
    name: 'Bhashik / Language Detection',
    provider: 'Bhashik',
    modality: 'Text-to-Text',
    license: 'Proprietary',
    inputPrice: '5',
    outputPrice: '0',
    description: 'Detect the language present in the text',
    tags: ['Detection', 'Language', 'Text'],
    cardGradient: 'bg-gradient-to-bl from-indigo-100/50 via-purple-50/30 to-white border-indigo-200/60',
    logo: <SearchCheck className='h-5 w-5' />,
  },
  'text-extraction': {
    name: 'Bhashik / Text Extraction',
    provider: 'Bhashik',
    modality: 'Text-to-Text',
    license: 'Proprietary',
    inputPrice: '5',
    outputPrice: '0',
    description: 'Extract the set of defined entities from the text',
    tags: ['Extraction', 'NER', 'PII'],
    cardGradient: 'bg-gradient-to-bl from-slate-100/50 via-white/80 to-white border-slate-200/60',
    logo: <FileText className='h-5 w-5' />,
  },
  'sentiment-analysis': {
    name: 'Bhashik / Sentiment Analysis',
    provider: 'Bhashik',
    modality: 'Text-to-Text',
    license: 'Proprietary',
    inputPrice: '5',
    outputPrice: '0',
    description: 'Dominant sentiment detection for overall content and specific entity within',
    tags: ['Sentiment', 'Analysis', 'Text'],
    cardGradient: 'bg-gradient-to-bl from-orange-100/40 via-amber-50/30 to-white border-amber-200/60',
    logo: <Heart className='h-5 w-5' />,
  },
  'text-summarization': {
    name: 'Bhashik / Summarization',
    provider: 'Bhashik',
    modality: 'Text-to-Text',
    license: 'Proprietary',
    inputPrice: '5',
    outputPrice: '0',
    description: 'Summarize the main points and essence of a text',
    tags: ['Summarization', 'Text', 'Abstractive'],
    cardGradient: 'bg-gradient-to-bl from-green-100/40 via-emerald-50/30 to-white border-green-200/60',
    logo: <ScrollText className='h-5 w-5' />,
  },
} as const;

export default function TextExtractionPage() {
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState('text-extraction');
  const model = modelData['text-extraction'];

  useEffect(() => {
    setSelectedModel('text-extraction');
  }, []);

  return (
    <PageShell title={model.name} description={model.description}>
      <TextExtractionPlayground
        model={model}
        selectedModel={selectedModel}
        modelData={modelData}
        onModelChange={(m) => {
          setSelectedModel(m);
          if (m === 'text-translation') router.push('/playground/text-translation');
          if (m === 'language-detection') router.push('/playground/language-detection');
          if (m === 'text-extraction') router.push('/playground/text-extraction');
          if (m === 'sentiment-analysis') router.push('/playground/sentiment-analysis');
          if (m === 'text-summarization') router.push('/playground/text-summarization');
        }}
      />
    </PageShell>
  );
}


