import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import {
  Languages,
  FileText,
  Mic,
  FileSearch,
  UploadCloud,
  Send,
  ArrowRight,
} from 'lucide-react';

function Badge({ label }: { label: string }) {
  return (
    <span className='px-3 py-1 rounded-full text-sm font-medium bg-white text-foreground border border-border'>
      {label}
    </span>
  );
}

export default function BhashikPage() {
  return (
    <div className='space-y-12'>
      {/* Hero Section */}
      <div
        className='grid grid-cols-1 gap-8 items-center min-h-[420px] px-6 lg:px-12 py-10 rounded-2xl relative overflow-hidden'
        style={{ backgroundColor: '#f0fdf4' }}
      >
        <div className='absolute inset-0 opacity-100 pointer-events-none'>
            <svg className='w-full h-full object-cover' viewBox='0 0 1232 640' fill='none' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMidYMid slice'>
              <g clipPath='url(#clip0_bhashik)'>
                <rect width='1232' height='640' fill='#f0fdf4'></rect>
                <path
                  fillRule='evenodd'
                  clipRule='evenodd'
                  d='M929.704 412C928.178 412 927.047 410.582 927.387 409.094L933.471 382.466C933.811 380.979 932.681 379.561 931.155 379.561H853.876C853.18 379.561 852.519 379.256 852.068 378.726L733.568 239.754C732.811 238.866 732.811 237.559 733.568 236.671L850.74 99.2564C851.192 98.727 851.852 98.422 852.548 98.422H941.134C943.161 98.422 944.258 100.797 942.942 102.34L828.4 236.671C827.642 237.559 827.642 238.866 828.4 239.754L933.912 363.495C935.181 364.982 937.602 364.388 938.037 362.483L1005.58 66.847C1005.83 65.7664 1006.79 65 1007.9 65H1072.45C1073.97 65 1075.1 66.4179 1074.76 67.9056L1068.46 95.5164C1068.12 97.0041 1069.25 98.422 1070.77 98.422H1150.65C1151.35 98.422 1152.01 98.727 1152.46 99.2564L1269.63 236.671C1270.39 237.559 1270.39 238.866 1269.63 239.754L1151.13 378.726C1150.68 379.256 1150.02 379.561 1149.32 379.561H1131.57L1060.85 379.42C1058.83 379.416 1057.73 377.043 1059.05 375.502L1174.8 239.754C1175.56 238.866 1175.56 237.559 1174.8 236.671L1068.56 112.083C1067.3 110.596 1064.87 111.19 1064.44 113.095L996.567 410.153C996.32 411.234 995.359 412 994.251 412H929.704Z'
                  fill='#dcfce7'
                />
              </g>
              <defs>
                <clipPath id='clip0_bhashik'>
                  <rect width='1232' height='640' fill='white' />
                </clipPath>
              </defs>
            </svg>
        </div>

        {/* Centered content */}
        <div className='space-y-6 relative z-10 text-center max-w-3xl mx-auto'>
          <h2 className='text-2xl lg:text-3xl font-semibold tracking-tight text-foreground'>
            Unlock seamless communication across India&apos;s diverse languages with our proprietary speech and text models.
          </h2>
          {/* Badges removed as requested */}
          <div className='flex flex-col sm:flex-row gap-4 pt-2 justify-center'>
            <Button size='lg' variant='outline' className='px-6 border-foreground text-foreground' asChild>
              <Link href='/playground/text-to-speech'>Explore Speech Playground</Link>
            </Button>
            <Button size='lg' variant='outline' className='px-6 border-foreground text-foreground' asChild>
              <Link href='/playground/text-translation'>Explore Text Playground</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Why Bhashik */}
      <div className='space-y-6 pt-10 pb-10 md:pt-14 md:pb-14'>
        <div className='text-center'>
          <h3 className='text-xl font-semibold'>Why Bhashik?</h3>
          <p className='text-muted-foreground mt-2 max-w-2xl mx-auto'>
            Proprietary Indic language models for transcription, translation, summarization, and speech synthesis.
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Model-style card: Speech Services */}
          <div className='bg-gradient-to-bl from-green-100/50 via-emerald-50/30 to-white rounded-xl border border-green-200/60 p-6 flex flex-col h-full'>
            <div className='flex-1 flex flex-col'>
              <div className='flex items-center gap-3 mb-3'>
                <Mic className='h-6 w-6 text-green-700' />
                <h4 className='text-base font-semibold text-foreground'>Speech Services</h4>
              </div>
              <p className='text-sm text-muted-foreground mb-8'>Automatic speech recognition, speech translation, and text‑to‑speech synthesis for Indic languages.</p>
            </div>
            <div className='mt-auto'>
              <Link href='/bhashik/speech-services?tab=speech' className='inline-flex items-center gap-1 text-sm text-primary hover:underline'>
                Learn more <ArrowRight className='h-4 w-4' />
              </Link>
            </div>
          </div>

          {/* Model-style card: Text Services */}
          <div className='bg-gradient-to-bl from-slate-100/50 via-white/80 to-white rounded-xl border border-slate-200 p-6 flex flex-col h-full'>
            <div className='flex-1 flex flex-col'>
              <div className='flex items-center gap-3 mb-3'>
                <FileText className='h-6 w-6 text-gray-700' />
                <h4 className='text-base font-semibold text-foreground'>Text Services</h4>
              </div>
              <p className='text-sm text-muted-foreground mb-8'>Translation, summarization, entity detection, and sentiment analysis for Indic languages.</p>
            </div>
            <div className='mt-auto'>
              <Link href='/bhashik/speech-services?tab=text' className='inline-flex items-center gap-1 text-sm text-primary hover:underline'>
                Learn more <ArrowRight className='h-4 w-4' />
              </Link>
            </div>
          </div>

          {/* Model-style card: Doc Intelligence */}
          <div className='bg-gradient-to-bl from-indigo-100/50 via-purple-50/30 to-white rounded-xl border border-indigo-200/60 p-6 flex flex-col h-full'>
            <div className='flex-1 flex flex-col'>
              <div className='flex items-center gap-3 mb-3'>
                <FileSearch className='h-6 w-6' />
                <h4 className='text-base font-semibold text-foreground'>Doc Intelligence</h4>
              </div>
              <p className='text-sm text-muted-foreground mb-8'>Document processing, text extraction, information extraction, and PII masking for enhanced document intelligence.</p>
            </div>
            <div className='mt-auto'>
              <Link href='/doc-intelligence' className='inline-flex items-center gap-1 text-sm text-primary hover:underline'>
                Learn more <ArrowRight className='h-4 w-4' />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow */}
      <div className='space-y-6 mt-10 md:mt-14'>
        <div className='text-center'>
          <h3 className='text-xl font-semibold'>How businesses use Bhashik</h3>
        </div>

          <Card
            className='border'
            style={{
              background:
                'linear-gradient(180deg, rgba(249,250,251,0.9) 0%, rgba(240,249,255,0.9) 100%)',
            }}
          >
            <CardContent className='py-8'>
              <div className='text-center mb-6'>
                <h4 className='text-base font-medium text-foreground'>News Agency Workflow</h4>
              </div>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-8 items-center'>
                <div className='flex flex-col items-center text-center gap-2'>
                  <div className='rounded-full border border-border w-12 h-12 flex items-center justify-center'>
                    <UploadCloud className='h-6 w-6 text-muted-foreground' />
                  </div>
                  <div className='text-sm font-medium'>Upload Video</div>
                </div>
                <div className='flex flex-col items-center text-center gap-2'>
                  <div className='rounded-full border border-border w-12 h-12 flex items-center justify-center'>
                    <Mic className='h-6 w-6 text-muted-foreground' />
                  </div>
                  <div className='text-sm font-medium'>Transcribe</div>
                </div>
                <div className='flex flex-col items-center text-center gap-2'>
                  <div className='rounded-full border border-border w-12 h-12 flex items-center justify-center'>
                    <Languages className='h-6 w-6 text-muted-foreground' />
                  </div>
                  <div className='text-sm font-medium'>Translate</div>
                </div>
                <div className='flex flex-col items-center text-center gap-2'>
                  <div className='rounded-full border border-border w-12 h-12 flex items-center justify-center'>
                    <Send className='h-6 w-6 text-muted-foreground' />
                  </div>
                  <div className='text-sm font-medium'>Publish</div>
                </div>
              </div>
              <p className='text-center text-sm text-muted-foreground mt-6'>
                News agencies use Bhashik to quickly transcribe and translate video content into multiple Indic languages, enabling broader reach across diverse linguistic audiences.
              </p>
              <div className='flex justify-center mt-6'>
                <Button variant='outline'>See More Use Cases</Button>
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Final CTA - Enterprise Help (full width) */}
      <Card
        className='w-full border-0'
        style={{ background: 'linear-gradient(265deg, #E0E7FF 0%, #F0F7FF 100%)' }}
      >
        <CardContent className='flex flex-col items-center justify-center gap-4 py-6'>
          <div className='text-base md:text-lg font-medium text-gray-900 text-center'>
            Break down language barriers. Start building with Bhashik today.
          </div>
          <div className='flex flex-col sm:flex-row gap-3'>
            <Button variant='outline' size='default' className='px-6 border-foreground text-foreground' asChild>
              <Link href='/playground/text-to-speech'>Take me to Speech Playground</Link>
            </Button>
            <Button variant='outline' size='default' className='px-6 border-foreground text-foreground' asChild>
              <Link href='/playground/text-translation'>Take me to Text Playground</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
