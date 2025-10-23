'use client';

import { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { SetupCodeModal } from '@/components/modals/setup-code-modal';
import { CreateApiKeyModal } from '@/components/modals/create-api-key-modal';
import { ExtractTextPlayground } from '@/components/playground/extract-text-playground';

export default function ExtractTextPage() {
  const [isSetupCodeModalOpen, setIsSetupCodeModalOpen] = useState(false);
  const [isCreateApiKeyModalOpen, setIsCreateApiKeyModalOpen] = useState(false);

  const title = 'Document Intelligence / Extract Text';
  const description = 'Seamlessly extract text from documents, scanned files and images';

  return (
    <>
      <PageShell title={title} description={description}>
        <ExtractTextPlayground
          model={{
            name: 'Doc Intelligence/Extract Text',
            provider: 'Krutrim',
            license: 'Proprietary',
            inputPrice: '8',
            outputPrice: '—',
            description: 'OCR-based text extraction from images',
            tags: ['OCR', 'Images', 'Text Extraction'],
            cardGradient: 'bg-gradient-to-bl from-slate-100/50 via-white/80 to-white border-slate-200/60',
            logo: null,
          }}
          selectedModel={'extract-text'}
          modelData={{ 'extract-text': {} }}
          onModelChange={() => {}}
        />
      </PageShell>

      {/* No header actions or modals required for this playground per spec */}
    </>
  );
}
