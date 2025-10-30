'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy } from 'lucide-react';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SetupCodeModalProps {
  open: boolean;
  onClose: () => void;
  modelId?: string;
  onOpenCreateApiKey?: () => void;
}

export function SetupCodeModal({
  open,
  onClose,
  modelId = 'gpt-oss-20b',
  onOpenCreateApiKey,
}: SetupCodeModalProps) {
  const { toast } = useToast();
  const [activeLanguage, setActiveLanguage] = useState<'curl' | 'python'>('curl');
  const [useCase, setUseCase] = useState('general');

  const languageLabel = activeLanguage === 'python' ? 'Python' : 'cURL';

  const pythonCode = `import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.studio.krutrim.com/v1/",
    api_key=os.environ.get('KRUTRIM_API_KEY')
)

response = client.chat.completions.create(
    model="${modelId}",
    messages=[
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user",
            "content": "Hello! Can you help me with a coding question?"
        }
    ],
    max_tokens=1000,
)

print(response.choices[0].message.content)`;

  const curlCode = `curl -X POST "https://api.studio.krutrim.com/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $KRUTRIM_API_KEY" \\
  -d '{
    "model": "${modelId}",
    "messages": [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user",
            "content": "Hello! Can you help me with a coding question?"
        }
    ],
    "max_tokens": 1000,
    "temperature": 0.7
  }'`;

  const handleCopyCode = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Starter code copied",
        description: "The code snippet has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-4xl max-h-[85vh] min-h-[600px] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold text-foreground'>
            Setup and chat as code
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Instructions */}
          <div className='space-y-4 text-sm text-muted-foreground'>
            <div className='flex items-start gap-3'>
              <span className='flex-shrink-0 w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-medium'>
                1
              </span>
              <p>
                Create an{' '}
                <button 
                  className='font-medium text-primary hover:text-primary/80 underline cursor-pointer'
                  onClick={() => {
                    if (onOpenCreateApiKey) {
                      onOpenCreateApiKey();
                    }
                  }}
                >
                  API key
                </button>{' '}
                and save it into the KRUTRIM_API_KEY environment variable.
              </p>
            </div>
            <div className='flex items-start gap-3'>
              <span className='flex-shrink-0 w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-medium'>
                2
              </span>
              <p>
                Use the code below to continue working with your model, its
                parameters and the chat so far in your application.
              </p>
            </div>
          </div>

          {/* Controls row: Use Case + Coding Language */}
          <div className='space-y-4'>
            <div className='flex flex-col sm:flex-row gap-3'>
              <div className='w-full sm:w-64'>
                <Select value={useCase} onValueChange={setUseCase}>
                  <SelectTrigger className='h-9'>
                    <SelectValue placeholder='Use case' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='general'>General</SelectItem>
                    <SelectItem value='chat'>Chat</SelectItem>
                    <SelectItem value='ocr'>OCR</SelectItem>
                    <SelectItem value='summarization'>Summarization</SelectItem>
                    <SelectItem value='stt'>Speech to Text</SelectItem>
                    <SelectItem value='tts'>Text to Speech</SelectItem>
                    <SelectItem value='translation'>Translation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='w-full sm:w-64'>
                <Select value={activeLanguage} onValueChange={(v) => setActiveLanguage(v as 'curl' | 'python')}>
                  <SelectTrigger className='h-9'>
                    <SelectValue placeholder='Coding Language' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='curl'>cURL</SelectItem>
                    <SelectItem value='python'>Python</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Code Content */}
            <div className='relative h-80'>
              <div className='bg-gray-900 text-gray-100 rounded-lg overflow-hidden h-full'>
                {/* Header */}
                <div className='flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700'>
                  <h3 className='text-sm font-medium text-gray-200'>{languageLabel}</h3>
                  <TooltipWrapper content="Copy code">
                    <button 
                      onClick={() => handleCopyCode(activeLanguage === 'python' ? pythonCode : curlCode, languageLabel)}
                      className='p-1 hover:bg-gray-700 rounded transition-colors'
                    >
                      <svg className='w-4 h-4 text-gray-400 hover:text-gray-200' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                      </svg>
                    </button>
                  </TooltipWrapper>
                </div>
                {/* Code Content */}
                <div className='p-4 bg-gray-900 h-full overflow-auto'>
                  <pre className='text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-words'>
                    <code>{activeLanguage === 'python' ? pythonCode : curlCode}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className='flex justify-end pt-4'>
            <Button variant='outline' onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
