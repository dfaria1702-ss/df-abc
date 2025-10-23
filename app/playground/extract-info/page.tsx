'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { ExtractTextPlayground } from '@/components/playground/extract-text-playground';

export default function ExtractInformationPlaygroundPage() {
  const [selectedModel, setSelectedModel] = useState('extract-info');
  const router = useRouter();

  const modelData = {
    'extract-text': {
      name: 'Doc Intelligence/Extract Text',
      provider: 'Krutrim',
      modality: 'OCR',
      license: 'Proprietary',
      inputPrice: '8',
      outputPrice: '—',
      description: 'OCR-based text extraction from images',
      tags: ['OCR', 'Images', 'Text Extraction'],
      cardGradient: 'bg-gradient-to-bl from-slate-100/50 via-white/80 to-white border-slate-200/60',
      logo: null,
    },
    'extract-info': {
      name: 'Doc Intelligence/Extract Information',
      provider: 'Krutrim',
      modality: 'OCR',
      license: 'Proprietary',
      inputPrice: '8',
      outputPrice: '—',
      description: 'Extract key information from your unstructured data',
      tags: ['OCR', 'Key-Value', 'Entities'],
      cardGradient: 'bg-gradient-to-bl from-indigo-100/50 via-purple-50/30 to-white border-indigo-200/60',
      logo: null,
    },
    'doc-summarization': {
      name: 'Doc Intelligence/Document Summarization',
      provider: 'Krutrim',
      modality: 'Summarization',
      license: 'Proprietary',
      inputPrice: '8',
      outputPrice: '—',
      description: 'Upload your file to generate a summary',
      tags: ['Summary', 'Abstractive'],
      cardGradient: 'bg-gradient-to-bl from-green-100/50 via-emerald-50/30 to-white border-green-200/60',
      logo: null,
    },
    'pii-masking': {
      name: 'Document Intelligence/PII Masking',
      provider: 'Krutrim',
      modality: 'PII Masking',
      license: 'Proprietary',
      inputPrice: '8',
      outputPrice: '—',
      description: 'Get PII data masked in your documents',
      tags: ['PII', 'Masking', 'Redaction'],
      cardGradient: 'bg-gradient-to-bl from-orange-100/40 via-amber-50/30 to-white border-amber-200/60',
      logo: null,
    },
  } as const;

  const model = modelData['extract-info'];

  useEffect(() => {
    setSelectedModel('extract-info');
  }, []);

  return (
    <PageShell
      title='Document Intelligence / Extract Information'
      description='Extract key information from your unstructured data'
    >
      <ExtractTextPlayground
        model={model}
        selectedModel={selectedModel}
        modelData={modelData}
        onModelChange={(m) => {
          setSelectedModel(m);
          if (m === 'extract-text') router.push('/playground/extract-text');
          if (m === 'extract-info') router.push('/playground/extract-info');
          if (m === 'doc-summarization') router.push('/playground/doc-summarization');
          if (m === 'pii-masking') router.push('/playground/pii-masking');
        }}
      />
    </PageShell>
  );
}


