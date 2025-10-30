'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { TextToSpeechPlayground } from '@/components/playground/text-to-speech-playground';
import { Volume2, Mic, AudioLines } from 'lucide-react';

// Dedicated model data for Bhashik Text-to-Speech
const modelData = {
  'text-to-speech': {
    name: 'Bhashik / Text to Speech',
    provider: 'Bhashik',
    modality: 'Text-to-Speech',
    license: 'Proprietary',
    costPerToken: 0,
    inputPrice: '₹266',
    outputPrice: '',
    description: 'Transform written text into natural-sounding speech in multiple languages',
    tags: ['Neural voices', 'Multilingual'],
    cardGradient: 'bg-gradient-to-bl from-blue-100/50 via-indigo-50/30 to-white border-blue-200/60',
    logo: <Volume2 className='w-5 h-5' />,
  },
  'speech-to-text': {
    name: 'Bhashik / Speech to Text',
    provider: 'Bhashik',
    modality: 'Speech-to-Text',
    license: 'Proprietary',
    costPerToken: 0,
    inputPrice: '₹24',
    outputPrice: '',
    description: 'Precisely capture and transcribe audio into text, making it easy to record and analyse spoken content',
    tags: ['Streaming', 'Speaker diarization'],
    cardGradient: 'bg-gradient-to-bl from-green-100/50 via-emerald-50/30 to-white border-green-200/60',
    logo: <Mic className='w-5 h-5' />,
  },
  'speech-to-speech': {
    name: 'Bhashik / Speech to Speech',
    provider: 'Bhashik',
    modality: 'Speech-to-Speech',
    license: 'Proprietary',
    costPerToken: 0,
    inputPrice: '₹30',
    outputPrice: '',
    description: 'Directly translate spoken language into another, enabling smooth conversations across languages',
    tags: ['Real-time translation', 'Voice adaptation'],
    cardGradient: 'bg-gradient-to-bl from-purple-100/50 via-pink-50/30 to-white border-purple-200/60',
    logo: <AudioLines className='w-5 h-5' />,
  },
} as const;

export default function BhashikTextToSpeechPage() {
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState('text-to-speech');

  const model = modelData['text-to-speech'];

  useEffect(() => {
    setSelectedModel('text-to-speech');
  }, []);

  return (
    <>
      <PageShell
        title={model.name}
        description={model.description}
      >
        <TextToSpeechPlayground
          model={model}
          selectedModel={selectedModel}
          modelData={modelData}
          onModelChange={(m) => {
            setSelectedModel(m);
            if (m === 'text-to-speech') router.push('/playground/text-to-speech');
            if (m === 'speech-to-text') router.push('/playground/speech-to-text');
            if (m === 'speech-to-speech') router.push('/playground/speech-to-speech');
          }}
          onOpenSetupCode={() => {}}
          onOpenCreateApiKey={() => {}}
        />
      </PageShell>
    </>
  );
}


