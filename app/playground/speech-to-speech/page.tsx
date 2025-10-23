'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { SpeechToSpeechPlayground } from '@/components/playground/speech-to-speech-playground';
import { AudioLines, Mic, Volume2 } from 'lucide-react';

// Dedicated model data for Bhashik Speech-to-Speech
const modelData = {
  'text-to-speech': {
    name: 'Bhashik / Text to Speech',
    provider: 'Bhashik',
    modality: 'Text-to-Speech',
    license: 'Proprietary',
    costPerToken: 0,
    inputPrice: '5',
    outputPrice: '0',
    description: 'Convert text to natural-sounding speech',
    tags: ['Text-to-Speech', 'Audio', 'Voice-Synthesis'],
    cardGradient: 'bg-gradient-to-bl from-blue-100/50 via-indigo-50/30 to-white border-blue-200/60',
    logo: <Volume2 className='w-5 h-5' />,
  },
  'speech-to-text': {
    name: 'Bhashik / Speech to Text',
    provider: 'Bhashik',
    modality: 'Speech-to-Text',
    license: 'Proprietary',
    costPerToken: 0,
    inputPrice: '24',
    outputPrice: '0',
    description: 'Speech-to-text model for audio transcription',
    tags: ['Speech-to-Text', 'Audio', 'Transcription'],
    cardGradient: 'bg-gradient-to-bl from-green-100/50 via-emerald-50/30 to-white border-green-200/60',
    logo: <Mic className='w-5 h-5' />,
  },
  'speech-to-speech': {
    name: 'Bhashik / Speech to Speech',
    provider: 'Bhashik',
    modality: 'Speech-to-Speech',
    license: 'Proprietary',
    costPerToken: 0,
    inputPrice: '30',
    outputPrice: '0',
    description: 'Convert speech from one language to another with natural-sounding output',
    tags: ['Speech-to-Speech', 'Translation', 'Multi-Language'],
    cardGradient: 'bg-gradient-to-bl from-purple-100/50 via-pink-50/30 to-white border-purple-200/60',
    logo: <AudioLines className='w-5 h-5' />,
  },
} as const;

export default function BhashikSpeechToSpeechPage() {
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState('speech-to-speech');
  const model = modelData['speech-to-speech'];

  useEffect(() => {
    setSelectedModel('speech-to-speech');
  }, []);

  return (
    <PageShell title={model.name} description={model.description}>
      <SpeechToSpeechPlayground
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
  );
}


