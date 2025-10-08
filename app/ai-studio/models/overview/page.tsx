'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { BorderBeam } from '@/components/ui/border-beam';
import { useToast } from '@/hooks/use-toast';
import { SetupCodeModal } from '@/components/modals/setup-code-modal';
import { RequestNewModelModal } from '@/components/modals/request-new-model-modal';
import { CreateApiKeyModal } from '@/components/modals/create-api-key-modal';

export default function ModelsOverviewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isSetupCodeModalOpen, setIsSetupCodeModalOpen] = useState(false);
  const [isCreateApiKeyModalOpen, setIsCreateApiKeyModalOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState('');

  const codeSnippet = `import requests
url = "https://api.krutrim.ai/v1/chat/completions"
headers = {"Authorization": "Bearer YOUR_API_KEY"}
data = {
  "model": "gpt-5",
  "messages": [{"role": "user", "content": "Hello, AI assistant!"}]
}
response = requests.post(url, headers=headers, json=data)
print(response.json())`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeSnippet);
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

  const handleCopyModelId = async (modelId: string) => {
    try {
      await navigator.clipboard.writeText(modelId);
      toast({
        title: "Model ID copied",
        description: `${modelId} has been copied to your clipboard.`,
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
    <div className='space-y-6'>
      {/* Hero Section */}
      <div 
        className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[500px] px-6 lg:px-12 py-12 rounded-2xl relative overflow-hidden'
        style={{
          backgroundColor: '#f0fdf4',
        }}
      >
        {/* Background SVG Pattern */}
        <div className='absolute inset-0 opacity-100'>
          <svg 
            className='w-full h-full object-cover' 
            viewBox="0 0 1232 640" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <g clipPath="url(#clip0_646_2612)">
              <rect width="1232" height="640" fill="#f0fdf4"/>
              <path 
                fillRule="evenodd" 
                clipRule="evenodd" 
                d="M929.704 412C928.178 412 927.047 410.582 927.387 409.094L933.471 382.466C933.811 380.979 932.681 379.561 931.155 379.561H853.876C853.18 379.561 852.519 379.256 852.068 378.726L733.568 239.754C732.811 238.866 732.811 237.559 733.568 236.671L850.74 99.2564C851.192 98.727 851.852 98.422 852.548 98.422H941.134C943.161 98.422 944.258 100.797 942.942 102.34L828.4 236.671C827.642 237.559 827.642 238.866 828.4 239.754L933.912 363.495C935.181 364.982 937.602 364.388 938.037 362.483L1005.58 66.847C1005.83 65.7664 1006.79 65 1007.9 65H1072.45C1073.97 65 1075.1 66.4179 1074.76 67.9056L1068.46 95.5164C1068.12 97.0041 1069.25 98.422 1070.77 98.422H1150.65C1151.35 98.422 1152.01 98.727 1152.46 99.2564L1269.63 236.671C1270.39 237.559 1270.39 238.866 1269.63 239.754L1151.13 378.726C1150.68 379.256 1150.02 379.561 1149.32 379.561H1131.57L1060.85 379.42C1058.83 379.416 1057.73 377.043 1059.05 375.502L1174.8 239.754C1175.56 238.866 1175.56 237.559 1174.8 236.671L1068.56 112.083C1067.3 110.596 1064.87 111.19 1064.44 113.095L996.567 410.153C996.32 411.234 995.359 412 994.251 412H929.704Z" 
                fill="#dcfce7"
              />
            </g>
            <defs>
              <clipPath id="clip0_646_2612">
                <rect width="1232" height="640" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </div>
        
        {/* Left Side - Content */}
        <div className='space-y-6 relative z-10'>
          {/* Heading */}
          <h1 className='text-3xl lg:text-4xl font-bold tracking-tight text-foreground'>
            Access any AI model with one API.
          </h1>
          
          {/* Description */}
          <div className='space-y-2'>
            <p className='text-lg text-muted-foreground leading-snug'>
              Build anything with the top open and closed models.
            </p>
            <p className='text-lg text-muted-foreground leading-snug'>
              Track usage, manage access, and pay with Lightning credits.
            </p>
          </div>
          
          {/* CTAs */}
          <div className='flex flex-col sm:flex-row gap-4 pt-4'>
            <Button 
              size='lg' 
              className='bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8 py-3'
              onClick={() => setIsCreateApiKeyModalOpen(true)}
            >
              Get API key
            </Button>
            <Button 
              variant='outline' 
              size='lg'
              onClick={() => setIsRequestModalOpen(true)}
              className='font-medium px-8 py-3 border-border hover:bg-accent hover:text-accent-foreground'
            >
              Request a model
            </Button>
          </div>
        </div>
        
        {/* Right Side - Code Example */}
        <div className='hidden lg:block relative z-10'>
          <div className='relative bg-gray-900 rounded-xl border border-gray-700 overflow-hidden'>
            {/* Header */}
            <div className='flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700'>
              <h3 className='text-sm font-medium text-gray-200'>Try it now</h3>
              <TooltipWrapper content="Copy code">
                <button 
                  onClick={handleCopyCode}
                  className='p-1 hover:bg-gray-700 rounded transition-colors'
                >
                  <svg className='w-4 h-4 text-gray-400 hover:text-gray-200' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                  </svg>
                </button>
              </TooltipWrapper>
            </div>
            
            {/* Code Content */}
            <div className='p-4 bg-gray-900'>
              <pre className='text-sm text-gray-300 leading-relaxed overflow-x-auto'>
                <code>{codeSnippet}</code>
              </pre>
            </div>
            
            {/* Border Beam Animation */}
            <BorderBeam 
              size={250} 
              duration={12} 
              delay={2}
              colorFrom="#4CAF50"
              colorTo="#2196F3"
              borderWidth={2}
            />
          </div>
        </div>
      </div>

      {/* Featured Models Section */}
      <div className='space-y-6'>
        {/* Section Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-foreground'>Featured Models</h2>
            <p className='text-muted-foreground mt-1'>New and noteworthy models hosted by Krutrim</p>
          </div>
          <Button 
            variant='outline' 
            className='hidden sm:flex'
            onClick={() => router.push('/model-hub/catalog')}
          >
            View all models
          </Button>
        </div>

        {/* Model Cards Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* Card 1 - OpenAI GPT-OSS 20B */}
          <div className='bg-gradient-to-bl from-slate-100/50 via-white/80 to-white rounded-xl border border-slate-200 p-6 flex flex-col h-full'>
            {/* Top Content - Flexible */}
            <div className='flex-1 flex flex-col'>
              {/* Provider Logo */}
              <div className='flex justify-start mb-4'>
                <div className='w-8 h-8 flex items-center justify-center'>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="32" height="32" className="w-8 h-8 text-gray-700" aria-hidden="true">
                    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5Z"></path>
                  </svg>
                </div>
              </div>

              {/* Model ID with Copy */}
              <div className='space-y-1 mb-10'>
                <div className='flex items-center gap-2'>
                  <h3 className='text-lg font-semibold text-gray-900'>openai/gpt-oss-20b</h3>
                  <TooltipWrapper content="Copy model ID">
                    <button 
                      onClick={() => handleCopyModelId('openai/gpt-oss-20b')}
                      className='p-1 hover:bg-gray-100 rounded transition-colors'
                    >
                      <svg className='w-4 h-4 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                      </svg>
                    </button>
                  </TooltipWrapper>
                </div>
                <p className='text-sm text-gray-600'>Large-scale GPT model with 20B parameters</p>
              </div>
            </div>

            {/* Bottom Content - Fixed to bottom */}
            <div className='mt-auto space-y-4'>
              {/* Pricing */}
              <div className='space-y-1'>
                <div className='flex items-center justify-between'>
                  <span className='text-lg font-semibold text-gray-900'>₹4.2</span>
                  <span className='text-lg font-semibold text-gray-900'>₹16.7</span>
                </div>
                <div className='flex items-center justify-between text-xs text-gray-500'>
                  <span>Per 1M Input Tokens</span>
                  <span>Per 1M Output Tokens</span>
                </div>
              </div>

              {/* Tags */}
              <div className='flex flex-wrap gap-2'>
                <span className='px-2 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded font-medium'>120B</span>
                <span className='px-2 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded font-medium'>128K</span>
                <span className='px-2 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded font-medium'>Reasoning</span>
              </div>

              {/* Action Buttons */}
              <div className='flex space-x-3'>
                <Button className='flex-1' asChild>
                  <a href='/playground/gpt-oss-20b'>
                    Playground
                  </a>
                </Button>
                <TooltipWrapper content="View starter code">
                  <Button 
                    variant='outline' 
                    className='px-3 border-gray-500 text-gray-500 hover:bg-gray-900 hover:text-white hover:border-gray-900'
                    onClick={() => {
                      setSelectedModelId('gpt-oss-20b');
                      setIsSetupCodeModalOpen(true);
                    }}
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' />
                    </svg>
                  </Button>
                </TooltipWrapper>
              </div>
            </div>
          </div>

          {/* Card 2 - Kimi K2-Instruct */}
          <div className='bg-gradient-to-bl from-slate-100/50 via-white/80 to-white rounded-xl border border-slate-200 p-6 flex flex-col h-full'>
            {/* Top Content - Flexible */}
            <div className='flex-1 flex flex-col'>
              {/* Provider Logo */}
              <div className='flex justify-start mb-4'>
                <div className='w-8 h-8 flex items-center justify-center'>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" fillRule="evenodd" height="32" viewBox="0 0 24 24" width="32" className="w-8 h-8 text-gray-700" aria-hidden="true">
                    <title>MoonshotAI</title>
                    <path d="M1.052 16.916l9.539 2.552a21.007 21.007 0 00.06 2.033l5.956 1.593a11.997 11.997 0 01-5.586.865l-.18-.016-.044-.004-.084-.009-.094-.01a11.605 11.605 0 01-.157-.02l-.107-.014-.11-.016a11.962 11.962 0 01-.32-.051l-.042-.008-.075-.013-.107-.02-.07-.015-.093-.019-.075-.016-.095-.02-.097-.023-.094-.022-.068-.017-.088-.022-.09-.024-.095-.025-.082-.023-.109-.03-.062-.02-.084-.025-.093-.028-.105-.034-.058-.019-.08-.026-.09-.031-.066-.024a6.293 6.293 0 01-.044-.015l-.068-.025-.101-.037-.057-.022-.08-.03-.087-.035-.088-.035-.079-.032-.095-.04-.063-.028-.063-.027a5.655 5.655 0 01-.041-.018l-.066-.03-.103-.047-.052-.024-.096-.046-.062-.03-.084-.04-.086-.044-.093-.047-.052-.027-.103-.055-.057-.03-.058-.032a6.49 6.49 0 01-.046-.026l-.094-.053-.06-.034-.051-.03-.072-.041-.082-.05-.093-.056-.052-.032-.084-.053-.061-.039-.079-.05-.07-.047-.053-.035a7.785 7.785 0 01-.054-.036l-.044-.03-.044-.03a6.066 6.066 0 01-.04-.028l-.057-.04-.076-.054-.069-.05-.074-.054-.056-.042-.076-.057-.076-.059-.086-.067-.045-.035-.064-.052-.074-.06-.089-.073-.046-.039-.046-.039a7.516 7.516 0 01-.043-.037l-.045-.04-.061-.053-.07-.062-.068-.06-.062-.058-.067-.062-.053-.05-.088-.084a13.28 13.28 0 01-.099-.097l-.029-.028-.041-.042-.069-.07-.05-.051-.05-.053a6.457 6.457 0 01-.168-.179l-.08-.088-.062-.07-.071-.08-.042-.049-.053-.062-.058-.068-.046-.056a7.175 7.175 0 01-.027-.033l-.045-.055-.066-.082-.041-.052-.05-.064-.02-.025a11.99 11.99 0 01-1.44-2.402zm-1.02-5.794l11.353 3.037a20.468 20.468 0 00-.469 2.011l10.817 2.894a12.076 12.076 0 01-1.845 2.005L.657 15.923l-.016-.046-.035-.104a11.965 11.965 0 01-.05-.153l-.007-.023a11.896 11.896 0 01-.207-.741l-.03-.126-.018-.08-.021-.097-.018-.081-.018-.09-.017-.084-.018-.094c-.026-.141-.05-.283-.071-.426l-.017-.118-.011-.083-.013-.102a12.01 12.01 0 01-.019-.161l-.005-.047a12.12 12.12 0 01-.034-2.145zm1.593-5.15l11.948 3.196c-.368.605-.705 1.231-1.01 1.875l11.295 3.022c-.142.82-.368 1.612-.668 2.365l-11.55-3.09L.124 10.26l.015-.1.008-.049.01-.067.015-.087.018-.098c.026-.148.056-.295.088-.442l.028-.124.02-.085.024-.097c.022-.09.045-.18.07-.268l.028-.102.023-.083.03-.1.025-.082.03-.096.026-.082.031-.095a11.896 11.896 0 011.01-2.232zm4.442-4.4L17.352 4.59a20.77 20.77 0 00-1.688 1.721l7.823 2.093c.267.852.442 1.744.513 2.665L2.106 5.213l.045-.065.027-.04.04-.055.046-.065.055-.076.054-.072.064-.086.05-.065.057-.073.055-.07.06-.074.055-.069.065-.077.054-.066.066-.077.053-.06.072-.082.053-.06.067-.074.054-.058.073-.078.058-.06.063-.067.168-.17.1-.098.059-.056.076-.071a12.084 12.084 0 012.272-1.677zM12.017 0h.097l.082.001.069.001.054.002.068.002.046.001.076.003.047.002.06.003.054.002.087.005.105.007.144.011.088.007.044.004.077.008.082.008.047.005.102.012.05.006.108.014.081.01.042.006.065.01.207.032.07.012.065.011.14.026.092.018.11.022.046.01.075.016.041.01L14.7.3l.042.01.065.015.049.012.071.017.096.024.112.03.113.03.113.032.05.015.07.02.078.024.073.023.05.016.05.016.076.025.099.033.102.036.048.017.064.023.093.034.11.041.116.045.1.04.047.02.06.024.041.018.063.026.04.018.057.025.11.048.1.046.074.035.075.036.06.028.092.046.091.045.102.052.053.028.049.026.046.024.06.033.041.022.052.029.088.05.106.06.087.051.057.034.053.032.096.059.088.055.098.062.036.024.064.041.084.056.04.027.062.042.062.043.023.017c.054.037.108.075.161.114l.083.06.065.048.056.043.086.065.082.064.04.03.05.041.086.069.079.065.085.071c.712.6 1.353 1.283 1.909 2.031L7.222.994l.062-.027.065-.028.081-.034.086-.035c.113-.045.227-.09.341-.131l.096-.035.093-.033.084-.03.096-.031c.087-.03.176-.058.264-.085l.091-.027.086-.025.102-.03.085-.023.1-.026L9.04.37l.09-.023.091-.022.095-.022.09-.02.098-.021.091-.02.095-.018.092-.018.1-.018.091-.016.098-.017.092-.014.097-.015.092-.013.102-.013.091-.012.105-.012.09-.01.105-.01c.093-.01.186-.018.28-.024l.106-.008.09-.005.11-.006.093-.004.1-.004.097-.002.099-.002.197-.002z"></path>
                  </svg>
                </div>
              </div>

              {/* Model ID with Copy */}
              <div className='space-y-1 mb-10'>
                <div className='flex items-center gap-2'>
                  <h3 className='text-lg font-semibold text-gray-900'>moonshotai/Kimi-K2-Instruct-0905</h3>
                  <TooltipWrapper content="Copy model ID">
                    <button 
                      onClick={() => handleCopyModelId('moonshotai/Kimi-K2-Instruct-0905')}
                      className='p-1 hover:bg-gray-100 rounded transition-colors'
                    >
                      <svg className='w-4 h-4 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                      </svg>
                    </button>
                  </TooltipWrapper>
                </div>
                <p className='text-sm text-gray-600'>Advanced instruction-following model for conversations</p>
              </div>
            </div>

            {/* Bottom Content - Fixed to bottom */}
            <div className='mt-auto space-y-4'>
              {/* Pricing */}
              <div className='space-y-1'>
                <div className='flex items-center justify-between'>
                  <span className='text-lg font-semibold text-gray-900'>₹83.5</span>
                  <span className='text-lg font-semibold text-gray-900'>₹250.5</span>
                </div>
                <div className='flex items-center justify-between text-xs text-gray-500'>
                  <span>Per 1M Input Tokens</span>
                  <span>Per 1M Output Tokens</span>
                </div>
              </div>

              {/* Tags */}
              <div className='flex flex-wrap gap-2'>
                <span className='px-2 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded font-medium'>32K</span>
                <span className='px-2 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded font-medium'>Chat</span>
                <span className='px-2 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded font-medium'>Instruct</span>
              </div>

              {/* Action Buttons */}
              <div className='flex space-x-3'>
                <Button className='flex-1' asChild>
                  <a href='/playground/kimi-k2-instruct'>
                    Playground
                  </a>
                </Button>
                <TooltipWrapper content="View starter code">
                  <Button 
                    variant='outline' 
                    className='px-3 border-gray-500 text-gray-500 hover:bg-gray-900 hover:text-white hover:border-gray-900'
                    onClick={() => {
                      setSelectedModelId('gpt-oss-20b');
                      setIsSetupCodeModalOpen(true);
                    }}
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' />
                    </svg>
                  </Button>
                </TooltipWrapper>
              </div>
            </div>
          </div>

          {/* Card 3 - Qwen3 Next */}
          <div className='bg-gradient-to-bl from-indigo-100/50 via-purple-50/30 to-white rounded-xl border border-indigo-200/60 p-6 flex flex-col h-full'>
            {/* Top Content - Flexible */}
            <div className='flex-1 flex flex-col'>
              {/* Provider Logo */}
              <div className='flex justify-start mb-4'>
                <div className='w-8 h-8 flex items-center justify-center'>
                  <svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" aria-hidden="true">
                    <path d="M8.43952 0.247391C8.72534 0.749204 9.0097 1.25247 9.29333 1.75647C9.30479 1.77662 9.32141 1.79337 9.34147 1.805C9.36153 1.81663 9.38432 1.82272 9.40751 1.82265H13.4453C13.5718 1.82265 13.6795 1.90265 13.7696 2.06046L14.8271 3.92954C14.9653 4.17463 15.0016 4.27717 14.8445 4.53826C14.6554 4.85098 14.4714 5.16662 14.2918 5.48371L14.0249 5.96225C13.9478 6.10479 13.8627 6.16588 13.9958 6.33461L15.9245 9.70694C16.0496 9.92585 16.0052 10.0662 15.8932 10.2669C15.5754 10.8378 15.2518 11.4044 14.9223 11.9687C14.8067 12.1666 14.6663 12.2415 14.4278 12.2378C13.8627 12.2262 13.2991 12.2306 12.7355 12.2495C12.7234 12.2501 12.7116 12.2537 12.7014 12.2601C12.6911 12.2665 12.6825 12.2753 12.6766 12.2858C12.0263 13.438 11.3705 14.5871 10.7093 15.7331C10.5864 15.9462 10.4329 15.9971 10.182 15.9978C9.45696 16 8.72606 16.0007 7.98789 15.9992C7.91916 15.9991 7.85171 15.9807 7.79233 15.9461C7.73295 15.9115 7.68375 15.8619 7.64971 15.8022L6.67881 14.1127C6.67317 14.1017 6.66449 14.0924 6.65381 14.0861C6.64312 14.0798 6.63086 14.0767 6.61845 14.0771H2.89632C2.68905 14.0989 2.49414 14.0764 2.31087 14.0102L1.14507 11.9956C1.11059 11.936 1.09232 11.8684 1.09206 11.7995C1.09181 11.7306 1.10958 11.6628 1.14361 11.6029L2.02142 10.0611C2.03392 10.0393 2.0405 10.0146 2.0405 9.98948C2.0405 9.96435 2.03392 9.93965 2.02142 9.91784C1.56417 9.1262 1.10962 8.33299 0.657801 7.53823L0.0832629 6.5237C-0.0330993 6.29824 -0.0425537 6.16297 0.152353 5.82188C0.49053 5.23062 0.826526 4.64008 1.16107 4.05026C1.25707 3.88008 1.38216 3.80736 1.58579 3.80663C2.21341 3.80399 2.84105 3.80374 3.46867 3.8059C3.48453 3.80578 3.50007 3.80148 3.51373 3.79344C3.52739 3.78539 3.53869 3.77389 3.54649 3.76009L5.58719 0.200118C5.61812 0.145961 5.66277 0.10091 5.71665 0.0695016C5.77053 0.0380933 5.83173 0.0214373 5.8941 0.021211C6.27518 0.0204837 6.65991 0.0212109 7.04536 0.0168473L7.78498 0.00012023C8.03298 -0.00206157 8.31152 0.0233928 8.43952 0.247391ZM5.94355 0.540479C5.93589 0.540474 5.92836 0.542488 5.92172 0.546318C5.91508 0.550148 5.90957 0.555659 5.90573 0.562297L3.8214 4.20954C3.81139 4.22672 3.79707 4.241 3.77985 4.25095C3.76263 4.2609 3.7431 4.26618 3.72322 4.26626H1.63888C1.59815 4.26626 1.58797 4.28444 1.60906 4.32008L5.83446 11.7062C5.85264 11.7367 5.84392 11.7513 5.80974 11.752L3.77703 11.7629C3.74732 11.7619 3.71792 11.7693 3.6922 11.7842C3.66648 11.7991 3.64548 11.821 3.63158 11.8473L2.67159 13.5273C2.63959 13.584 2.65632 13.6131 2.72105 13.6131L6.87809 13.6189C6.91154 13.6189 6.93627 13.6334 6.95372 13.6633L7.97407 15.448C8.00753 15.5069 8.04098 15.5076 8.07516 15.448L11.7158 9.07713L12.2853 8.07204C12.2888 8.06584 12.2938 8.06067 12.3 8.05707C12.3061 8.05347 12.3131 8.05157 12.3202 8.05157C12.3273 8.05157 12.3343 8.05347 12.3404 8.05707C12.3466 8.06067 12.3516 8.06584 12.3551 8.07204L13.3907 9.91203C13.3985 9.92579 13.4098 9.93723 13.4235 9.94516C13.4372 9.95309 13.4527 9.95722 13.4685 9.95712L15.478 9.94257C15.4831 9.94262 15.4882 9.9413 15.4927 9.93874C15.4971 9.93618 15.5009 9.93249 15.5034 9.92803C15.5059 9.92358 15.5072 9.91857 15.5072 9.91348C15.5072 9.90839 15.5059 9.90338 15.5034 9.89894L13.3944 6.20006C13.3868 6.1877 13.3828 6.17348 13.3828 6.15897C13.3828 6.14447 13.3868 6.13024 13.3944 6.11788L13.6075 5.74916L14.422 4.31135C14.4394 4.28153 14.4307 4.26626 14.3965 4.26626H5.96392C5.92101 4.26626 5.91082 4.24735 5.93264 4.21026L6.97554 2.38846C6.98335 2.37605 6.9875 2.36168 6.9875 2.34701C6.9875 2.33234 6.98335 2.31797 6.97554 2.30555L5.9821 0.563024C5.9783 0.556143 5.97271 0.550416 5.96593 0.546447C5.95914 0.542479 5.95141 0.540417 5.94355 0.540479ZM10.518 6.37315C10.5515 6.37315 10.5602 6.3877 10.5428 6.41679L9.93768 7.48223L8.03734 10.8167C8.03377 10.8232 8.0285 10.8286 8.02209 10.8323C8.01569 10.8361 8.00839 10.838 8.00098 10.8378C7.9936 10.8378 7.98636 10.8358 7.97998 10.8321C7.9736 10.8284 7.96831 10.8231 7.96462 10.8167L5.45338 6.42988C5.43883 6.40515 5.4461 6.39206 5.47374 6.3906L5.63083 6.38188L10.5195 6.37315H10.518Z" fill="url(#prefix__paint0_linear_16251_34570)"></path>
                    <defs>
                      <linearGradient id="prefix__paint0_linear_16251_34570" x1="0" y1="0" x2="1600" y2="0" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#00055F" stopOpacity="0.84"></stop>
                        <stop offset="1" stopColor="#6F69F7" stopOpacity="0.84"></stop>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Model ID with Copy */}
              <div className='space-y-1 mb-10'>
                <div className='flex items-center gap-2'>
                  <h3 className='text-lg font-semibold text-gray-900'>Qwen/Qwen3-Next-80B-A3B-Instruct</h3>
                  <TooltipWrapper content="Copy model ID">
                    <button 
                      onClick={() => handleCopyModelId('Qwen/Qwen3-Next-80B-A3B-Instruct')}
                      className='p-1 hover:bg-gray-100 rounded transition-colors'
                    >
                      <svg className='w-4 h-4 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                      </svg>
                    </button>
                  </TooltipWrapper>
                </div>
                <p className='text-sm text-gray-600'>Next-generation 80B model with enhanced reasoning</p>
              </div>
            </div>

            {/* Bottom Content - Fixed to bottom */}
            <div className='mt-auto space-y-4'>
              {/* Pricing */}
              <div className='space-y-1'>
                <div className='flex items-center justify-between'>
                  <span className='text-lg font-semibold text-gray-900'>₹12.5</span>
                  <span className='text-lg font-semibold text-gray-900'>₹125.3</span>
                </div>
                <div className='flex items-center justify-between text-xs text-gray-500'>
                  <span>Per 1M Input Tokens</span>
                  <span>Per 1M Output Tokens</span>
                </div>
              </div>

              {/* Tags */}
              <div className='flex flex-wrap gap-2'>
                <span className='px-2 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded font-medium'>80B</span>
                <span className='px-2 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded font-medium'>32K</span>
                <span className='px-2 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded font-medium'>Instruct</span>
              </div>

              {/* Action Buttons */}
              <div className='flex space-x-3'>
                <Button className='flex-1' asChild>
                  <a href='/playground/qwen3-coder-480b'>
                    Playground
                  </a>
                </Button>
                <TooltipWrapper content="View starter code">
                  <Button 
                    variant='outline' 
                    className='px-3 border-gray-500 text-gray-500 hover:bg-gray-900 hover:text-white hover:border-gray-900'
                    onClick={() => {
                      setSelectedModelId('gpt-oss-20b');
                      setIsSetupCodeModalOpen(true);
                    }}
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' />
                    </svg>
                  </Button>
                </TooltipWrapper>
              </div>
            </div>
          </div>

          {/* Card 4 - Krutrim Dhwani */}
          <div className='bg-gradient-to-bl from-green-100/50 via-emerald-50/30 to-white rounded-xl border border-green-200/60 p-6 flex flex-col h-full'>
            {/* Top Content - Flexible */}
            <div className='flex-1 flex flex-col'>
              {/* Provider Logo */}
              <div className='flex justify-start mb-4'>
                <div className='w-8 h-8 flex items-center justify-center'>
                  <svg width="32" height="32" viewBox="0 0 385 385" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" aria-hidden="true">
                    <rect x="0.166992" y="0.33313" width="384.002" height="384.002" rx="192.001" fill="#10A554"/>
                    <path d="M281.913 134.663H206.35V167.282C213.859 162.901 222.463 160.711 232.163 160.711C243.271 160.711 252.344 164.153 259.385 171.036C266.581 177.92 270.179 187.463 270.179 199.666C270.179 206.549 268.849 214.215 266.19 222.663C263.687 231.111 259.541 239.716 253.752 248.477L226.296 233.223C229.895 228.374 232.867 223.367 235.214 218.205C237.56 213.042 238.734 207.723 238.734 202.247C238.734 196.459 237.482 192.391 234.979 190.044C232.632 187.698 229.503 186.524 225.592 186.524C221.994 186.524 215.032 189.81 215.032 189.81C215.032 189.81 204.053 194.347 201.55 196.85V254.813H174.904V225.01C169.741 227.982 164.5 230.251 159.181 231.815C154.019 233.38 147.995 234.162 141.112 234.162C132.507 234.162 124.607 232.598 117.41 229.469C110.37 226.183 104.738 221.412 100.514 215.154C96.2903 208.896 94.1783 201.074 94.1783 191.687C94.1783 182.926 96.2903 175.417 100.514 169.159C104.738 162.745 110.605 157.817 118.114 154.375C125.624 150.777 134.307 148.978 144.163 148.978C148.543 148.978 152.924 149.134 157.304 149.447C161.841 149.76 165.361 150.307 167.864 151.09L165.517 177.138C160.511 175.886 154.957 175.26 148.856 175.26C141.503 175.26 135.793 176.747 131.725 179.719C127.658 182.535 125.624 186.524 125.624 191.687C125.624 197.945 127.579 202.247 131.491 204.594C135.402 206.941 139.626 208.114 144.163 208.114C150.733 208.114 156.522 206.628 161.528 203.655C166.691 200.683 171.149 197.241 174.904 193.33V134.663H85.4956V108.849H281.913V134.663Z" fill="white"/>
                    <path d="M235.619 309.49C231.551 311.524 226.702 313.401 221.069 315.122C215.281 316.843 208.397 317.704 200.419 317.704C192.596 317.704 185.635 316.218 179.533 313.245C173.432 310.429 168.66 306.44 165.219 301.277C161.62 296.271 159.821 290.404 159.821 283.677C159.821 272.413 163.811 263.417 171.789 256.69C179.611 250.119 186.076 246.365 200.781 245.426L203.597 269.597C195.619 270.066 194.943 271.552 191.971 274.056C188.998 276.715 187.512 279.766 187.512 283.208C187.512 290.404 192.284 294.002 201.827 294.002C205.425 294.002 209.101 293.455 212.856 292.36C216.611 291.264 221.148 289.387 226.467 286.728L235.619 309.49Z" fill="white"/>
                  </svg>
                </div>
              </div>

              {/* Model ID with Copy */}
              <div className='space-y-1 mb-10'>
                <div className='flex items-center gap-2'>
                  <h3 className='text-lg font-semibold text-gray-900'>Krutrim/Krutrim-Dhwani</h3>
                  <TooltipWrapper content="Copy model ID">
                    <button 
                      onClick={() => handleCopyModelId('Krutrim/Krutrim-Dhwani')}
                      className='p-1 hover:bg-gray-100 rounded transition-colors'
                    >
                      <svg className='w-4 h-4 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                      </svg>
                    </button>
                  </TooltipWrapper>
                </div>
                <p className='text-sm text-gray-600'>Speech-to-text model for audio transcription</p>
              </div>
            </div>

            {/* Bottom Content - Fixed to bottom */}
            <div className='mt-auto space-y-4'>
              {/* Pricing */}
              <div className='space-y-1'>
                <div className='flex items-center justify-between'>
                  <span className='text-lg font-semibold text-gray-900'>₹24</span>
                  <span className='text-lg font-semibold text-gray-400'>—</span>
                </div>
                <div className='flex items-center justify-between text-xs text-gray-500'>
                  <span>Per Hour of Input Audio</span>
                  <span>Output</span>
                </div>
              </div>

              {/* Tags */}
              <div className='flex flex-wrap gap-2'>
                <span className='px-2 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded font-medium'>Speech-to-Text</span>
                <span className='px-2 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded font-medium'>Audio</span>
                <span className='px-2 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded font-medium'>Transcription</span>
              </div>

              {/* Action Buttons */}
              <div className='flex space-x-3'>
                <Button className='flex-1' asChild>
                  <a href='/playground/krutrim-dhwani'>
                    Playground
                  </a>
                </Button>
                <TooltipWrapper content="View starter code">
                  <Button 
                    variant='outline' 
                    className='px-3 border-gray-500 text-gray-500 hover:bg-gray-900 hover:text-white hover:border-gray-900'
                    onClick={() => {
                      setSelectedModelId('krutrim-dhwani');
                      setIsSetupCodeModalOpen(true);
                    }}
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' />
                    </svg>
                  </Button>
                </TooltipWrapper>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request New Model Modal */}
      <RequestNewModelModal
        open={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />

      {/* Setup Code Modal */}
      <SetupCodeModal
        open={isSetupCodeModalOpen}
        onClose={() => setIsSetupCodeModalOpen(false)}
        modelId={selectedModelId}
      />

      {/* Create API Key Modal */}
      <CreateApiKeyModal
        open={isCreateApiKeyModalOpen}
        onClose={() => setIsCreateApiKeyModalOpen(false)}
      />
    </div>
  );
}