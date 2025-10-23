import { PageShell } from '@/components/page-shell';
import { EvervaultCard } from '@/components/ui/evervault-card';
import { Button } from '@/components/ui/button';
import { FileText, FileSearch, ScrollText, Shield } from 'lucide-react';

interface ServiceCardData {
  id: string;
  title: string;
  description: string;
  icon: any;
  gradient: string;
  borderClass: string;
  playgroundUrl: string;
}

const cards: ServiceCardData[] = [
  {
    id: 'extract-text',
    title: 'Extract Text',
    description: 'Seamlessly extract text from documents, scanned files and images',
    icon: FileText,
    gradient: 'from-slate-100/50 via-white/80 to-white',
    borderClass: 'border-slate-200',
    playgroundUrl: '/playground/extract-text',
  },
  {
    id: 'extract-info',
    title: 'Extract Information',
    description: 'Extract key information from your unstructured data',
    icon: FileSearch,
    gradient: 'from-indigo-100/50 via-purple-50/30 to-white',
    borderClass: 'border-indigo-200/60',
    playgroundUrl: '/playground/extract-info',
  },
  {
    id: 'summarization',
    title: 'Document Summarization',
    description: 'Upload your file to generate a summary',
    icon: ScrollText,
    gradient: 'from-green-100/50 via-emerald-50/30 to-white',
    borderClass: 'border-green-200/60',
    playgroundUrl: '/playground/doc-summarization',
  },
  {
    id: 'pii-masking',
    title: 'PII Masking',
    description: 'Get PII data masked in your documents',
    icon: Shield,
    gradient: 'from-orange-100/40 via-amber-50/30 to-white',
    borderClass: 'border-amber-200/60',
    playgroundUrl: '/playground/pii-masking',
  },
];

function ServiceCard({ data }: { data: ServiceCardData }) {
  const Icon = data.icon;
  return (
    <div className={`bg-gradient-to-bl ${data.gradient} rounded-xl border ${data.borderClass} p-6 flex flex-col h-full`}>
      <div className='flex-1 flex flex-col'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='w-8 h-8 flex items-center justify-center'>
            <Icon className='h-6 w-6 text-foreground' />
          </div>
          <h4 className='text-base font-semibold text-foreground'>{data.title}</h4>
        </div>
        <p className='text-sm text-muted-foreground mb-8'>{data.description}</p>
      </div>
      <div className='mt-auto'>
        <Button className='w-full' asChild>
          <a href={data.playgroundUrl}>Playground</a>
        </Button>
      </div>
    </div>
  );
}

export default function DocIntelligenceAllServicesPage() {
  return (
    <PageShell
      title='Document Intelligence'
      description='Comprehensive document processing and analysis services powered by AI'
    >
      <div className='space-y-6'>
        {/* Banner - reduced height, similar to Bhashik hero */}
        <div
          className='grid grid-cols-1 gap-6 items-center min-h-[260px] px-6 lg:px-12 py-8 rounded-2xl relative overflow-hidden'
          style={{ backgroundColor: '#f0fdf4' }}
        >
          <div className='absolute inset-0 opacity-100 pointer-events-none'>
            <svg className='w-full h-full object-cover' viewBox='0 0 1232 640' fill='none' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMidYMid slice'>
              <g clipPath='url(#clip0_docintelligence)'>
                <rect width='1232' height='640' fill='#f0fdf4'></rect>
                <path
                  fillRule='evenodd'
                  clipRule='evenodd'
                  d='M929.704 412C928.178 412 927.047 410.582 927.387 409.094L933.471 382.466C933.811 380.979 932.681 379.561 931.155 379.561H853.876C853.18 379.561 852.519 379.256 852.068 378.726L733.568 239.754C732.811 238.866 732.811 237.559 733.568 236.671L850.74 99.2564C851.192 98.727 851.852 98.422 852.548 98.422H941.134C943.161 98.422 944.258 100.797 942.942 102.34L828.4 236.671C827.642 237.559 827.642 238.866 828.4 239.754L933.912 363.495C935.181 364.982 937.602 364.388 938.037 362.483L1005.58 66.847C1005.83 65.7664 1006.79 65 1007.9 65H1072.45C1073.97 65 1075.1 66.4179 1074.76 67.9056L1068.46 95.5164C1068.12 97.0041 1069.25 98.422 1070.77 98.422H1150.65C1151.35 98.422 1152.01 98.727 1152.46 99.2564L1269.63 236.671C1270.39 237.559 1270.39 238.866 1269.63 239.754L1151.13 378.726C1150.68 379.256 1150.02 379.561 1149.32 379.561H1131.57L1060.85 379.42C1058.83 379.416 1057.73 377.043 1059.05 375.502L1174.8 239.754C1175.56 238.866 1175.56 237.559 1174.8 236.671L1068.56 112.083C1067.3 110.596 1064.87 111.19 1064.44 113.095L996.567 410.153C996.32 411.234 995.359 412 994.251 412H929.704Z'
                  fill='#dcfce7'
                />
              </g>
              <defs>
                <clipPath id='clip0_docintelligence'>
                  <rect width='1232' height='640' fill='white' />
                </clipPath>
              </defs>
            </svg>
          </div>
          {/* Hover overlay effect while preserving base background */}
          <div className='absolute inset-0'>
            <EvervaultCard text='' className='h-full w-full' />
          </div>
          <div className='space-y-4 relative z-10 text-center max-w-3xl mx-auto'>
            <h2 className='text-2xl lg:text-3xl font-semibold tracking-tight text-foreground'>
              Automate text extraction, summarization, and PII masking with advanced document AI.
            </h2>
            <div className='pt-2 flex justify-center'>
              <Button size='lg' variant='outline' className='px-6 border-foreground text-foreground' asChild>
                <a href='/playground/extract-text'>Go to Playground</a>
              </Button>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {cards.map(card => (
            <ServiceCard key={card.id} data={card} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
