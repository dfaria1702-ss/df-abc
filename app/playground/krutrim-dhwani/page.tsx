'use client';

import { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { SpeechToTextPlayground } from '@/components/playground/speech-to-text-playground';
import { SetupCodeModal } from '@/components/modals/setup-code-modal';
import { CreateApiKeyModal } from '@/components/modals/create-api-key-modal';

// Model data for Krutrim-Dhwani
const modelData = {
  'krutrim-dhwani': {
    name: 'Krutrim/Krutrim-Dhwani',
    provider: 'Krutrim',
    license: 'Proprietary',
    costPerToken: 0,
    inputPrice: '24',
    outputPrice: '0',
    description: 'Speech-to-text model for audio transcription',
    tags: ['Speech-to-Text', 'Audio', 'Transcription'],
    cardGradient: 'bg-gradient-to-bl from-green-100/50 via-emerald-50/30 to-white border-green-200/60',
    logo: (
      <svg width="20" height="20" viewBox="0 0 385 385" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" aria-hidden="true">
        <rect x="0.166992" y="0.33313" width="384.002" height="384.002" rx="192.001" fill="#10A554"/>
        <path d="M281.913 134.663H206.35V167.282C213.859 162.901 222.463 160.711 232.163 160.711C243.271 160.711 252.344 164.153 259.385 171.036C266.581 177.92 270.179 187.463 270.179 199.666C270.179 206.549 268.849 214.215 266.19 222.663C263.687 231.111 259.541 239.716 253.752 248.477L226.296 233.223C229.895 228.374 232.867 223.367 235.214 218.205C237.56 213.042 238.734 207.723 238.734 202.247C238.734 196.459 237.482 192.391 234.979 190.044C232.632 187.698 229.503 186.524 225.592 186.524C221.994 186.524 215.032 189.81 215.032 189.81C215.032 189.81 204.053 194.347 201.55 196.85V254.813H174.904V225.01C169.741 227.982 164.5 230.251 159.181 231.815C154.019 233.38 147.995 234.162 141.112 234.162C132.507 234.162 124.607 232.598 117.41 229.469C110.37 226.183 104.738 221.412 100.514 215.154C96.2903 208.896 94.1783 201.074 94.1783 191.687C94.1783 182.926 96.2903 175.417 100.514 169.159C104.738 162.745 110.605 157.817 118.114 154.375C125.624 150.777 134.307 148.978 144.163 148.978C148.543 148.978 152.924 149.134 157.304 149.447C161.841 149.76 165.361 150.307 167.864 151.09L165.517 177.138C160.511 175.886 154.957 175.26 148.856 175.26C141.503 175.26 135.793 176.747 131.725 179.719C127.658 182.535 125.624 186.524 125.624 191.687C125.624 197.945 127.579 202.247 131.491 204.594C135.402 206.941 139.626 208.114 144.163 208.114C150.733 208.114 156.522 206.628 161.528 203.655C166.691 200.683 171.149 197.241 174.904 193.33V134.663H85.4956V108.849H281.913V134.663Z" fill="white"/>
        <path d="M235.619 309.49C231.551 311.524 226.702 313.401 221.069 315.122C215.281 316.843 208.397 317.704 200.419 317.704C192.596 317.704 185.635 316.218 179.533 313.245C173.432 310.429 168.66 306.44 165.219 301.277C161.62 296.271 159.821 290.404 159.821 283.677C159.821 272.413 163.811 263.417 171.789 256.69C179.611 250.119 186.076 246.365 200.781 245.426L203.597 269.597C195.619 270.066 194.943 271.552 191.971 274.056C188.998 276.715 187.512 279.766 187.512 283.208C187.512 290.404 192.284 294.002 201.827 294.002C205.425 294.002 209.101 293.455 212.856 292.36C216.611 291.264 221.148 289.387 226.467 286.728L235.619 309.49Z" fill="white"/>
      </svg>
    )
  },
};

const allModelData = {
  ...modelData,
  'qwen3-coder-480b': {
    name: 'Qwen/Qwen3-Coder-480B-A35B-Instruct',
    provider: 'Qwen',
    license: 'Apache 2.0 License',
    costPerToken: 0.01,
    inputPrice: '12.5',
    outputPrice: '125.3',
    description: 'Next-generation 80B model with enhanced reasoning',
    tags: ['80B', '32K', 'Instruct'],
    cardGradient: 'bg-gradient-to-bl from-indigo-100/50 via-purple-50/30 to-white border-indigo-200/60',
    logo: <div>Logo</div>
  },
  'gpt-oss-20b': {
    name: 'OpenAI/GPT-OSS-20B',
    provider: 'OpenAI',
    license: 'MIT License',
    costPerToken: 0.015,
    inputPrice: '4.2',
    outputPrice: '16.7',
    description: 'Large-scale GPT model with 20B parameters',
    tags: ['120B', '128K', 'Reasoning'],
    cardGradient: 'bg-gradient-to-bl from-slate-100/50 via-white/80 to-white border-slate-200/60',
    logo: <div>Logo</div>
  },
  'kimi-k2-instruct': {
    name: 'moonshotai/Kimi-K2-Instruct-0905',
    provider: 'MoonshotAI',
    license: 'Apache 2.0 License',
    costPerToken: 0.083,
    inputPrice: '83.5',
    outputPrice: '250.5',
    description: 'Advanced instruction-following model for conversations',
    tags: ['32K', 'Chat', 'Instruct'],
    cardGradient: 'bg-gradient-to-bl from-slate-100/50 via-white/80 to-white border-slate-200/60',
    logo: <div>Logo</div>
  },
};

export default function KrutrimDhwaniPage() {
  const [selectedModel, setSelectedModel] = useState('krutrim-dhwani');
  const [isSetupCodeModalOpen, setIsSetupCodeModalOpen] = useState(false);
  const [isCreateApiKeyModalOpen, setIsCreateApiKeyModalOpen] = useState(false);

  const model = modelData['krutrim-dhwani'];

  return (
    <div className='h-full'>
      <div className='p-4'>
        <PageShell
          title={model.name}
          description={model.description}
          headerActions={
            <div className='flex items-center gap-2'>
              <Button 
                variant='outline' 
                size='sm'
                onClick={() => setIsSetupCodeModalOpen(true)}
              >
                View code
              </Button>
              <Button 
                variant='default' 
                size='sm'
                onClick={() => setIsCreateApiKeyModalOpen(true)}
              >
                Get API key
              </Button>
            </div>
          }
        >
          <SpeechToTextPlayground
            model={model}
            selectedModel={selectedModel}
            modelData={allModelData}
            onModelChange={setSelectedModel}
            onOpenSetupCode={() => setIsSetupCodeModalOpen(true)}
            onOpenCreateApiKey={() => setIsCreateApiKeyModalOpen(true)}
          />
        </PageShell>
      </div>

      {/* Modals */}
      <SetupCodeModal
        open={isSetupCodeModalOpen}
        onClose={() => setIsSetupCodeModalOpen(false)}
        modelId={selectedModel}
        onOpenCreateApiKey={() => setIsCreateApiKeyModalOpen(true)}
      />

      <CreateApiKeyModal
        open={isCreateApiKeyModalOpen}
        onClose={() => setIsCreateApiKeyModalOpen(false)}
      />
    </div>
  );
}

