import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';
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
      <div className='relative rounded-2xl overflow-hidden'>
        <BackgroundGradientAnimation
          // Tailor colors to our green theme while keeping base bg '#f0fdf4'
          firstColor='16, 185, 129'       
          secondColor='52, 211, 153'     
          thirdColor='5, 150, 105'       
          fourthColor='22, 163, 74'      
          fifthColor='110, 231, 183'     
          pointerColor='34, 197, 94'
          size='70%'
          blendingValue='soft-light'
          gradientBackgroundStart='#f0fdf4'
          gradientBackgroundEnd='#f0fdf4'
          containerClassName='min-h-[420px] rounded-2xl'
          className='relative flex min-h-[420px] items-center justify-center px-6 lg:px-12 py-10'
        >
          <div className='space-y-6 relative z-10 text-center max-w-3xl mx-auto'>
            <h2 className='text-2xl lg:text-3xl font-semibold tracking-tight text-foreground'>
              Seamless communication across India&apos;s languages with our proprietary speech and text models.
            </h2>
            <div className='flex flex-col sm:flex-row gap-4 pt-2 justify-center'>
              <Button size='lg' variant='outline' className='px-6 border-foreground text-foreground' asChild>
                <Link href='/playground/text-to-speech'>Explore Speech Playground</Link>
              </Button>
              <Button size='lg' variant='outline' className='px-6 border-foreground text-foreground' asChild>
                <Link href='/playground/text-translation'>Explore Text Playground</Link>
              </Button>
            </div>
          </div>
        </BackgroundGradientAnimation>
      </div>

      {/* Why Bhashik */}
      <div className='space-y-6 pt-4 pb-10 md:pt-6 md:pb-14'>
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
