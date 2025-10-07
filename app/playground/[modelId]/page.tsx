'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { PageShell } from '@/components/page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';
import { useToast } from '@/hooks/use-toast';
import { SetupCodeModal } from '@/components/modals/setup-code-modal';
import { CreateApiKeyModal } from '@/components/modals/create-api-key-modal';
import { AIChatInput } from '@/components/ui/ai-chat-input';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { ChatBubbleAvatar } from '@/components/ui/chat-bubble';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { SpeechToTextPlayground } from './components/speech-to-text-playground';
import { 
  Copy, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  Settings,
  Globe,
  FileText,
  Sparkles,
  X,
  BookOpen,
  RotateCcw,
  User,
  ChevronUp
} from 'lucide-react';

// Mock model data - in real app, this would come from API
const modelData = {
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
    logo: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" aria-hidden="true">
        <path d="M8.43952 0.247391C8.72534 0.749204 9.0097 1.25247 9.29333 1.75647C9.30479 1.77662 9.32141 1.79337 9.34147 1.805C9.36153 1.81663 9.38432 1.82272 9.40751 1.82265H13.4453C13.5718 1.82265 13.6795 1.90265 13.7696 2.06046L14.8271 3.92954C14.9653 4.17463 15.0016 4.27717 14.8445 4.53826C14.6554 4.85098 14.4714 5.16662 14.2918 5.48371L14.0249 5.96225C13.9478 6.10479 13.8627 6.16588 13.9958 6.33461L15.9245 9.70694C16.0496 9.92585 16.0052 10.0662 15.8932 10.2669C15.5754 10.8378 15.2518 11.4044 14.9223 11.9687C14.8067 12.1666 14.6663 12.2415 14.4278 12.2378C13.8627 12.2262 13.2991 12.2306 12.7355 12.2495C12.7234 12.2501 12.7116 12.2537 12.7014 12.2601C12.6911 12.2665 12.6825 12.2753 12.6766 12.2858C12.0263 13.438 11.3705 14.5871 10.7093 15.7331C10.5864 15.9462 10.4329 15.9971 10.182 15.9978C9.45696 16 8.72606 16.0007 7.98789 15.9992C7.91916 15.9991 7.85171 15.9807 7.79233 15.9461C7.73295 15.9115 7.68375 15.8619 7.64971 15.8022L6.67881 14.1127C6.67317 14.1017 6.66449 14.0924 6.65381 14.0861C6.64312 14.0798 6.63086 14.0767 6.61845 14.0771H2.89632C2.68905 14.0989 2.49414 14.0764 2.31087 14.0102L1.14507 11.9956C1.11059 11.936 1.09232 11.8684 1.09206 11.7995C1.09181 11.7306 1.10958 11.6628 1.14361 11.6029L2.02142 10.0611C2.03392 10.0393 2.0405 10.0146 2.0405 9.98948C2.0405 9.96435 2.03392 9.93965 2.02142 9.91784C1.56417 9.1262 1.10962 8.33299 0.657801 7.53823L0.0832629 6.5237C-0.0330993 6.29824 -0.0425537 6.16297 0.152353 5.82188C0.49053 5.23062 0.826526 4.64008 1.16107 4.05026C1.25707 3.88008 1.38216 3.80736 1.58579 3.80663C2.21341 3.80399 2.84105 3.80374 3.46867 3.8059C3.48453 3.80578 3.50007 3.80148 3.51373 3.79344C3.52739 3.78539 3.53869 3.77389 3.54649 3.76009L5.58719 0.200118C5.61812 0.145961 5.66277 0.10091 5.71665 0.0695016C5.77053 0.0380933 5.83173 0.0214373 5.8941 0.021211C6.27518 0.0204837 6.65991 0.0212109 7.04536 0.0168473L7.78498 0.00012023C8.03298 -0.00206157 8.31152 0.0233928 8.43952 0.247391ZM5.94355 0.540479C5.93589 0.540474 5.92836 0.542488 5.92172 0.546318C5.91508 0.550148 5.90957 0.555659 5.90573 0.562297L3.8214 4.20954C3.81139 4.22672 3.79707 4.241 3.77985 4.25095C3.76263 4.2609 3.7431 4.26618 3.72322 4.26626H1.63888C1.59815 4.26626 1.58797 4.28444 1.60906 4.32008L5.83446 11.7062C5.85264 11.7367 5.84392 11.7513 5.80974 11.752L3.77703 11.7629C3.74732 11.7619 3.71792 11.7693 3.6922 11.7842C3.66648 11.7991 3.64548 11.821 3.63158 11.8473L2.67159 13.5273C2.63959 13.584 2.65632 13.6131 2.72105 13.6131L6.87809 13.6189C6.91154 13.6189 6.93627 13.6334 6.95372 13.6633L7.97407 15.448C8.00753 15.5069 8.04098 15.5076 8.07516 15.448L11.7158 9.07713L12.2853 8.07204C12.2888 8.06584 12.2938 8.06067 12.3 8.05707C12.3061 8.05347 12.3131 8.05157 12.3202 8.05157C12.3273 8.05157 12.3343 8.05347 12.3404 8.05707C12.3466 8.06067 12.3516 8.06584 12.3551 8.07204L13.3907 9.91203C13.3985 9.92579 13.4098 9.93723 13.4235 9.94516C13.4372 9.95309 13.4527 9.95722 13.4685 9.95712L15.478 9.94257C15.4831 9.94262 15.4882 9.9413 15.4927 9.93874C15.4971 9.93618 15.5009 9.93249 15.5034 9.92803C15.5059 9.92358 15.5072 9.91857 15.5072 9.91348C15.5072 9.90839 15.5059 9.90338 15.5034 9.89894L13.3944 6.20006C13.3868 6.1877 13.3828 6.17348 13.3828 6.15897C13.3828 6.14447 13.3868 6.13024 13.3944 6.11788L13.6075 5.74916L14.422 4.31135C14.4394 4.28153 14.4307 4.26626 14.3965 4.26626H5.96392C5.92101 4.26626 5.91082 4.24735 5.93264 4.21026L6.97554 2.38846C6.98335 2.37605 6.9875 2.36168 6.9875 2.34701C6.9875 2.33234 6.98335 2.31797 6.97554 2.30555L5.9821 0.563024C5.9783 0.556143 5.97271 0.550416 5.96593 0.546447C5.95914 0.542479 5.95141 0.540417 5.94355 0.540479ZM10.518 6.37315C10.5515 6.37315 10.5602 6.3877 10.5428 6.41679L9.93768 7.48223L8.03734 10.8167C8.03377 10.8232 8.0285 10.8286 8.02209 10.8323C8.01569 10.8361 8.00839 10.838 8.00098 10.8378C7.9936 10.8378 7.98636 10.8358 7.97998 10.8321C7.9736 10.8284 7.96831 10.8231 7.96462 10.8167L5.45338 6.42988C5.43883 6.40515 5.4461 6.39206 5.47374 6.3906L5.63083 6.38188L10.5195 6.37315H10.518Z" fill="url(#prefix__paint0_linear_16251_34570)"></path>
        <defs>
          <linearGradient id="prefix__paint0_linear_16251_34570" x1="0" y1="0" x2="1600" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00055F" stopOpacity="0.84"></stop>
            <stop offset="1" stopColor="#6F69F7" stopOpacity="0.84"></stop>
          </linearGradient>
        </defs>
      </svg>
    )
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
    logo: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="20" height="20" className="w-5 h-5 text-gray-700" aria-hidden="true">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5Z"></path>
      </svg>
    )
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
    logo: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" fillRule="evenodd" height="20" viewBox="0 0 24 24" width="20" className="w-5 h-5 text-gray-700" aria-hidden="true">
        <title>MoonshotAI</title>
        <path d="M1.052 16.916l9.539 2.552a21.007 21.007 0 00.06 2.033l5.956 1.593a11.997 11.997 0 01-5.586.865l-.18-.016-.044-.004-.084-.009-.094-.01a11.605 11.605 0 01-.157-.02l-.107-.014-.11-.016a11.962 11.962 0 01-.32-.051l-.042-.008-.075-.013-.107-.02-.07-.015-.093-.019-.075-.016-.095-.02-.097-.023-.094-.022-.068-.017-.088-.022-.09-.024-.095-.025-.082-.023-.109-.03-.062-.02-.084-.025-.093-.028-.105-.034-.058-.019-.08-.026-.09-.031-.066-.024a6.293 6.293 0 01-.044-.015l-.068-.025-.101-.037-.057-.022-.08-.03-.087-.035-.088-.035-.079-.032-.095-.04-.063-.028-.063-.027a5.655 5.655 0 01-.041-.018l-.066-.03-.103-.047-.052-.024-.096-.046-.062-.03-.084-.04-.086-.044-.093-.047-.052-.027-.103-.055-.057-.03-.058-.032a6.49 6.49 0 01-.046-.026l-.094-.053-.06-.034-.051-.03-.072-.041-.082-.05-.093-.056-.052-.032-.084-.053-.061-.039-.079-.05-.07-.047-.053-.035a7.785 7.785 0 01-.054-.036l-.044-.03-.044-.03a6.066 6.066 0 01-.04-.028l-.057-.04-.076-.054-.069-.05-.074-.054-.056-.042-.076-.057-.076-.059-.086-.067-.045-.035-.064-.052-.074-.06-.089-.073-.046-.039-.046-.039a7.516 7.516 0 01-.043-.037l-.045-.04-.061-.053-.07-.062-.068-.06-.062-.058-.067-.062-.053-.05-.088-.084a13.28 13.28 0 01-.099-.097l-.029-.028-.041-.042-.069-.07-.05-.051-.05-.053a6.457 6.457 0 01-.168-.179l-.08-.088-.062-.07-.071-.08-.042-.049-.053-.062-.058-.068-.046-.056a7.175 7.175 0 01-.027-.033l-.045-.055-.066-.082-.041-.052-.05-.064-.02-.025a11.99 11.99 0 01-1.44-2.402zm-1.02-5.794l11.353 3.037a20.468 20.468 0 00-.469 2.011l10.817 2.894a12.076 12.076 0 01-1.845 2.005L.657 15.923l-.016-.046-.035-.104a11.965 11.965 0 01-.05-.153l-.007-.023a11.896 11.896 0 01-.207-.741l-.03-.126-.018-.08-.021-.097-.018-.081-.018-.09-.017-.084-.018-.094c-.026-.141-.05-.283-.071-.426l-.017-.118-.011-.083-.013-.102a12.01 12.01 0 01-.019-.161l-.005-.047a12.12 12.12 0 01-.034-2.145zm1.593-5.15l11.948 3.196c-.368.605-.705 1.231-1.01 1.875l11.295 3.022c-.142.82-.368 1.612-.668 2.365l-11.55-3.09L.124 10.26l.015-.1.008-.049.01-.067.015-.087.018-.098c.026-.148.056-.295.088-.442l.028-.124.02-.085.024-.097c.022-.09.045-.18.07-.268l.028-.102.023-.083.03-.1.025-.082.03-.096.026-.082.031-.095a11.896 11.896 0 011.01-2.232zm4.442-4.4L17.352 4.59a20.77 20.77 0 00-1.688 1.721l7.823 2.093c.267.852.442 1.744.513 2.665L2.106 5.213l.045-.065.027-.04.04-.055.046-.065.055-.076.054-.072.064-.086.05-.065.057-.073.055-.070.060-.074.055-.069.065-.077.054-.066.066-.077.053-.060.072-.082.053-.060.067-.074.054-.058.073-.078.058-.060.063-.067.168-.17.1-.098.059-.056.076-.071a12.084 12.084 0 012.272-1.677zM12.017 0h.097l.082.001.069.001.054.002.068.002.046.001.076.003.047.002.060.003.054.002.087.005.105.007.144.011.088.007.044.004.077.008.082.008.047.005.102.012.05.006.108.014.081.01.042.006.065.01.207.032.07.012.065.011.14.026.092.018.11.022.046.01.075.016.041.01L14.7.3l.042.01.065.015.049.012.071.017.096.024.112.03.113.03.113.032.05.015.070.02.078.024.073.023.05.016.050.016.076.025.099.033.102.036.048.017.064.023.093.034.11.041.116.045.1.04.047.02.060.024.041.018.063.026.040.018.057.025.11.048.1.046.074.035.075.036.060.028.092.046.091.045.102.052.053.028.049.026.046.024.060.033.041.022.052.029.088.05.106.06.087.051.057.034.053.032.096.059.088.055.098.062.036.024.064.041.084.056.040.027.062.042.062.043.023.017c.054.037.108.075.161.114l.083.060.065.048.056.043.086.065.082.064.040.030.050.041.086.069.079.065.085.071c.712.6 1.353 1.283 1.909 2.031L7.222.994l.062-.027.065-.028.081-.034.086-.035c.113-.045.227-.090.341-.131l.096-.035.093-.033.084-.030.096-.031c.087-.030.176-.058.264-.085l.091-.027.086-.025.102-.030.085-.023.100-.026L9.04.37l.090-.023.091-.022.095-.022.090-.020.098-.021.091-.020.095-.018.092-.018.100-.018.091-.016.098-.017.092-.014.097-.015.092-.013.102-.013.091-.012.105-.012.090-.010.105-.010c.093-.010.186-.018.280-.024l.106-.008.090-.005.110-.006.093-.004.100-.004.097-.002.099-.002.197-.002z"></path>
      </svg>
    )
  },
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
  }
};

const quickActions = [
  { icon: Settings, label: 'Improve my sentence' },
  { icon: Globe, label: 'Quick translation' },
  { icon: FileText, label: 'Summarize quickly' },
  { icon: Sparkles, label: 'Polish my email' },
  { icon: BookOpen, label: 'Tell me a story' }
];

export default function PlaygroundPage() {
  const params = useParams();
  const modelId = params.modelId as string;
  const { toast } = useToast();
  
  // Get model info
  const initialModel = modelData[modelId as keyof typeof modelData] || modelData['qwen3-coder-480b'];
  
  // State management
  const [selectedModel, setSelectedModel] = useState(modelId);
  
  // Get currently selected model data
  const model = modelData[selectedModel as keyof typeof modelData] || initialModel;
  
  // Check if this is a speech-to-text model
  const isSpeechToText = model.tags?.includes('Speech-to-Text');
  
  const [temperature, setTemperature] = useState([1]);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [message, setMessage] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string, reasoning?: string, isThinking?: boolean, reasoningMetrics?: {ttft: number, latency: number, tps: number, cost: number}, responseMetrics?: {ttft: number, latency: number, tps: number, cost: number}, images?: string[]}>>([]);
  const [isSetupCodeModalOpen, setIsSetupCodeModalOpen] = useState(false);
  const [isCreateApiKeyModalOpen, setIsCreateApiKeyModalOpen] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState<Set<number>>(new Set());
  const [totalCost, setTotalCost] = useState(0);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [showCostShimmer, setShowCostShimmer] = useState(false);
  const [isCostPopoverOpen, setIsCostPopoverOpen] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleCopySystemPrompt = async () => {
    try {
      await navigator.clipboard.writeText(systemPrompt);
      toast({
        title: "System prompt copied",
        description: "The system prompt has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearChat = () => {
    setChatHistory([]);
    setTotalCost(0);
    toast({
      title: "Chat cleared",
      description: "All conversation history has been cleared.",
    });
  };

  const handleImageAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    // Convert to data URLs for preview
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = () => {
    if (!message.trim() && attachedImages.length === 0) return;
    
    // Add user message to chat with images
    const newMessage = { 
      role: 'user' as const, 
      content: message,
      images: attachedImages.length > 0 ? [...attachedImages] : undefined
    };
    setChatHistory(prev => [...prev, newMessage]);
    
    // Clear input and images
    setMessage('');
    setAttachedImages([]);
    
    // Add thinking state
    const thinkingMessage = { 
      role: 'assistant' as const, 
      content: '', 
      isThinking: true 
    };
    setChatHistory(prev => [...prev, thinkingMessage]);
    
    // Simulate AI reasoning and response (in real app, this would call the API)
    setTimeout(() => {
      // Generate separate mock metrics for reasoning and response
      const reasoningMetrics = {
        ttft: Math.floor(Math.random() * 200) + 50, // 50-250ms
        latency: Math.floor(Math.random() * 500) + 300, // 300-800ms
        tps: Math.floor(Math.random() * 100) + 100, // 100-200
        cost: parseFloat((Math.random() * 0.01 + 0.003).toFixed(6)) // ₹0.003-0.013
      };

      const responseMetrics = {
        ttft: Math.floor(Math.random() * 200) + 50, // 50-250ms
        latency: Math.floor(Math.random() * 500) + 300, // 300-800ms
        tps: Math.floor(Math.random() * 100) + 100, // 100-200
        cost: parseFloat((Math.random() * 0.015 + 0.005).toFixed(6)) // ₹0.005-0.020
      };

      // Update total cost with both reasoning and response costs
      const combinedCost = reasoningMetrics.cost + responseMetrics.cost;
      setTotalCost(prev => prev + combinedCost);
      setShowCostShimmer(true);
      setTimeout(() => setShowCostShimmer(false), 2000);

      // Remove thinking message and add actual response with reasoning
      setChatHistory(prev => {
        const withoutThinking = prev.slice(0, -1);
        const lastUserMessage = withoutThinking[withoutThinking.length - 1];
        const hasImages = lastUserMessage?.role === 'user' && lastUserMessage.images && lastUserMessage.images.length > 0;
        
        const reasoning = hasImages 
          ? `Analyzing the provided image(s):\n\n1. First, I examined the visual content, identifying key elements, objects, and patterns.\n2. Then, I considered the context of the user's question to provide relevant insights.\n3. Finally, I structured my response to directly address what the user is asking about the image.`
          : `On the first morning, a small robot named BEE-BOP rolled into Class 1A with a soft whirr. The hallway went quiet, then curious.\n\nIn homeroom, BEE-BOP introduced itself, printed a quick doodle of the solar system, and earned the first laugh of the day when its metal chair squeaked.\n\nAt lunch, it could not eat pizza, so it projected a tiny hologram of a pepperoni slice and pretended to take a bite. The other students found this hilarious.`;
        
        const content = hasImages
          ? `I can see the image(s) you've shared. This is a mock vision response that would analyze the visual content. In a real implementation, the AI would provide detailed analysis of:\n\n• Objects and elements visible in the image\n• Colors, composition, and visual style\n• Text or numbers if present\n• Context and potential meaning\n• Answers to any specific questions about the image\n\nThe actual response would be tailored to your specific question about the image.`
          : 'This is a mock response from the AI model. In a real implementation, this would be the actual AI-generated response based on your input and the selected model parameters.';
        
        const aiResponse = { 
          role: 'assistant' as const, 
          content: content,
          reasoning: reasoning,
          reasoningMetrics: reasoningMetrics,
          responseMetrics: responseMetrics
        };
        return [...withoutThinking, aiResponse];
      });
      
      // Reasoning will be collapsed by default (no auto-expand)
    }, 2000);
  };

  const handleQuickAction = (action: string) => {
    setMessage(action);
  };

  // Check if chat container is scrollable
  useEffect(() => {
    const checkScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        // Show indicator if there's more content below (not scrolled to bottom)
        setShowScrollIndicator(scrollHeight > clientHeight && scrollTop + clientHeight < scrollHeight - 20);
      }
    };

    const container = chatContainerRef.current;
    if (container) {
      checkScroll();
      container.addEventListener('scroll', checkScroll);
      // Also check on resize
      window.addEventListener('resize', checkScroll);
      
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [chatHistory]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const toggleReasoning = (index: number) => {
    setExpandedReasoning(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleCopyReasoning = async (reasoning: string) => {
    try {
      await navigator.clipboard.writeText(reasoning);
      toast({
        title: "Reasoning copied",
        description: "The reasoning has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRegenerateResponse = (index: number) => {
    // Get the old costs to subtract them
    const oldReasoningCost = chatHistory[index].reasoningMetrics?.cost || 0;
    const oldResponseCost = chatHistory[index].responseMetrics?.cost || 0;
    const oldTotalCost = oldReasoningCost + oldResponseCost;
    
    // Replace the response at the given index with a new "thinking" state
    setChatHistory(prev => {
      const newHistory = [...prev];
      newHistory[index] = { ...newHistory[index], isThinking: true, content: '' };
      return newHistory;
    });

    // Simulate API call and regenerate with new mock data
    setTimeout(() => {
      // Generate separate mock metrics for reasoning and response
      const reasoningMetrics = {
        ttft: Math.floor(Math.random() * 200) + 50,
        latency: Math.floor(Math.random() * 500) + 300,
        tps: Math.floor(Math.random() * 100) + 100,
        cost: parseFloat((Math.random() * 0.01 + 0.003).toFixed(6))
      };

      const responseMetrics = {
        ttft: Math.floor(Math.random() * 200) + 50,
        latency: Math.floor(Math.random() * 500) + 300,
        tps: Math.floor(Math.random() * 100) + 100,
        cost: parseFloat((Math.random() * 0.015 + 0.005).toFixed(6))
      };

      // Update total cost (subtract old, add new) and trigger shimmer animation
      const newTotalCost = reasoningMetrics.cost + responseMetrics.cost;
      setTotalCost(prev => prev - oldTotalCost + newTotalCost);
      setShowCostShimmer(true);
      setTimeout(() => setShowCostShimmer(false), 2000);

      setChatHistory(prev => {
        const newHistory = [...prev];
        const alternateReasoning = `The assistant analyzed the query from multiple perspectives. First, it considered the technical accuracy of the information. Then, it evaluated the clarity and conciseness of the explanation.\n\nAfter weighing different approaches, it decided to structure the response in a way that would be most helpful to the user, prioritizing practical examples over theoretical concepts.\n\nThe reasoning process involved checking for potential ambiguities and ensuring the response would be actionable.`;
        const alternateResponse = 'This is a regenerated response with different content. The AI model has processed your request again and provided an alternative perspective that might offer additional insights or clarity on the topic.';
        
        newHistory[index] = {
          role: 'assistant',
          content: alternateResponse,
          reasoning: alternateReasoning,
          isThinking: false,
          reasoningMetrics: reasoningMetrics,
          responseMetrics: responseMetrics
        };
        return newHistory;
      });

      toast({
        title: "Response regenerated",
        description: "A new response has been generated.",
      });
    }, 2000);
  };

  // If it's a speech-to-text model, render the specialized playground
  if (isSpeechToText) {
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
              modelData={modelData}
              onModelChange={setSelectedModel}
              onOpenSetupCode={() => setIsSetupCodeModalOpen(true)}
              onOpenCreateApiKey={() => setIsCreateApiKeyModalOpen(true)}
            />
          </PageShell>
        </div>

        {/* Shared Modals */}
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

  // Default text generation playground
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
          <div className='flex gap-6 h-[calc(100vh-280px)]'>
            {/* Left Sidebar */}
            <div className='w-80 flex-shrink-0 flex flex-col h-full relative'>
              {/* Scrollable Content */}
              <div className='flex-1 space-y-3 overflow-y-auto min-h-0 pb-32'>
                {/* Model Section */}
                <div className='space-y-3'>
                  <div className='relative z-50'>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className='w-full h-auto min-h-[40px] py-3'>
                        <SelectValue>
                          <div className='flex items-center gap-2 w-full'>
                            {model.logo}
                            <span className='truncate text-left flex-1'>{model.name}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent 
                        className='z-[100] max-h-60 w-[var(--radix-select-trigger-width)]'
                        position="popper"
                        side="bottom"
                        align="start"
                        sideOffset={4}
                      >
                        <SelectItem value="qwen3-coder-480b" className='py-3'>
                          <div className='flex items-center gap-2 w-full'>
                            {modelData['qwen3-coder-480b'].logo}
                            <span className='text-sm'>Qwen/Qwen3-Coder-480B-A35B-Instruct</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="gpt-oss-20b" className='py-3'>
                          <div className='flex items-center gap-2 w-full'>
                            {modelData['gpt-oss-20b'].logo}
                            <span className='text-sm'>OpenAI/GPT-OSS-20B</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="kimi-k2-instruct" className='py-3'>
                          <div className='flex items-center gap-2 w-full'>
                            {modelData['kimi-k2-instruct'].logo}
                            <span className='text-sm'>moonshotai/Kimi-K2-Instruct-0905</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="krutrim-dhwani" className='py-3'>
                          <div className='flex items-center gap-2 w-full'>
                            {modelData['krutrim-dhwani'].logo}
                            <span className='text-sm'>Krutrim/Krutrim-Dhwani</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Model Info Card */}
                  <div className={`rounded-lg border p-4 space-y-4 ${model.cardGradient}`}>
                    {/* Pricing */}
                    <div className='space-y-1'>
                      <div className='flex items-center justify-between'>
                        <span className='text-base font-semibold text-gray-900'>₹{model.inputPrice}</span>
                        <span className='text-base font-semibold text-gray-900'>₹{model.outputPrice}</span>
                      </div>
                      <div className='flex items-center justify-between text-xs text-gray-500'>
                        <span>Per 1M Input Tokens</span>
                        <span>Per 1M Output Tokens</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className='flex flex-wrap gap-2'>
                      {model.tags.map((tag, index) => (
                        <span key={index} className='px-2 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded font-medium'>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                      <button className='hover:text-foreground flex items-center gap-1'>
                        Learn more
                        <ExternalLink className='h-3 w-3' />
                      </button>
                      <span>|</span>
                      <span>{model.license}</span>
                    </div>
                  </div>
                </div>

                {/* Parameters Section */}
                <div className='space-y-3'>
                <h3 className='text-sm font-medium text-foreground'>Parameters</h3>
                
                {/* Temperature */}
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <label className='text-sm text-muted-foreground'>Temperature</label>
                      <TooltipWrapper content="Controls randomness in the model's output. Higher values make output more random, lower values make it more focused and deterministic.">
                        <div className='w-4 h-4 rounded-full border border-muted-foreground/30 flex items-center justify-center text-xs'>
                          ?
                        </div>
                      </TooltipWrapper>
                    </div>
                    <span className='text-sm font-medium text-foreground'>{temperature[0]}</span>
                  </div>
                  
                  <div className='px-2'>
                    <Slider
                      value={temperature}
                      onValueChange={setTemperature}
                      max={2}
                      min={0}
                      step={0.1}
                      className='w-full'
                    />
                    <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                      <span>0</span>
                      <span>2</span>
                    </div>
                  </div>
                </div>

                {/* Advanced Parameters */}
                <div className='mt-6'>
                <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                  <CollapsibleTrigger className='flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground'>
                    <span>Advanced parameters</span>
                    {isAdvancedOpen ? <ChevronDown className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className='mt-4'>
                    <Card>
                      <CardContent className='p-4 space-y-4'>
                    {/* Maximum tokens */}
                    <div className='space-y-3'>
                      <div className='flex items-center gap-2'>
                        <label className='text-sm text-muted-foreground'>Maximum tokens</label>
                        <TooltipWrapper content="The maximum number of tokens that can be generated in the chat completion.">
                          <div className='w-4 h-4 rounded-full border border-muted-foreground/30 flex items-center justify-center text-xs'>
                            ?
                          </div>
                        </TooltipWrapper>
                      </div>
                      
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <input type="checkbox" id="unlimited" className='h-4 w-4' />
                          <label htmlFor="unlimited" className='text-sm text-muted-foreground'>Unlimited</label>
                        </div>
                        <Input 
                          value="1,024"
                          readOnly 
                          className='text-center'
                        />
                        <div className='px-2'>
                          <Slider
                            defaultValue={[1024]}
                            max={128000}
                            min={0}
                            step={1}
                            className='w-full'
                          />
                          <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                            <span>0</span>
                            <span>1,024</span>
                            <span>128000</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Presence penalty */}
                    <div className='space-y-3'>
                      <div className='flex items-center gap-2'>
                        <label className='text-sm text-muted-foreground'>Presence penalty</label>
                        <TooltipWrapper content="Positive values penalize new tokens based on whether they appear in the text so far.">
                          <div className='w-4 h-4 rounded-full border border-muted-foreground/30 flex items-center justify-center text-xs'>
                            ?
                          </div>
                        </TooltipWrapper>
                      </div>
                      
                      <div className='space-y-2'>
                        <Input 
                          value="0"
                          readOnly 
                          className='text-center'
                        />
                        <div className='px-2'>
                          <Slider
                            defaultValue={[0]}
                            max={2}
                            min={-2}
                            step={0.1}
                            className='w-full'
                          />
                          <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                            <span>-2</span>
                            <span>0</span>
                            <span>2</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top-p threshold */}
                    <div className='space-y-3'>
                      <div className='flex items-center gap-2'>
                        <label className='text-sm text-muted-foreground'>Top-p threshold</label>
                        <TooltipWrapper content="An alternative to sampling with temperature, called nucleus sampling.">
                          <div className='w-4 h-4 rounded-full border border-muted-foreground/30 flex items-center justify-center text-xs'>
                            ?
                          </div>
                        </TooltipWrapper>
                      </div>
                      
                      <div className='space-y-2'>
                        <Input 
                          value="0.9"
                          readOnly 
                          className='text-center'
                        />
                        <div className='px-2'>
                          <Slider
                            defaultValue={[0.9]}
                            max={1}
                            min={0}
                            step={0.1}
                            className='w-full'
                          />
                          <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                            <span>0</span>
                            <span>0.9</span>
                            <span>1</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top-k threshold */}
                    <div className='space-y-3'>
                      <div className='flex items-center gap-2'>
                        <label className='text-sm text-muted-foreground'>Top-k threshold</label>
                        <TooltipWrapper content="Limit the next token selection to the K most probable tokens.">
                          <div className='w-4 h-4 rounded-full border border-muted-foreground/30 flex items-center justify-center text-xs'>
                            ?
                          </div>
                        </TooltipWrapper>
                      </div>
                      
                      <div className='space-y-2'>
                        <Input 
                          value="50"
                          readOnly 
                          className='text-center'
                        />
                        <div className='px-2'>
                          <Slider
                            defaultValue={[50]}
                            max={200}
                            min={-1}
                            step={1}
                            className='w-full'
                          />
                          <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                            <span>-1</span>
                            <span>50</span>
                            <span>200</span>
                          </div>
                        </div>
                      </div>
                    </div>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
                </div>
                </div>
              </div>

              {/* Fixed Cost Information - Only show when there are conversations */}
              {totalCost > 0 && (
                <div className='absolute bottom-0 left-0 right-0'>
                  <Popover open={isCostPopoverOpen} onOpenChange={setIsCostPopoverOpen}>
                    <PopoverTrigger asChild>
                      <div 
                        className='mx-3 cursor-pointer transition-all hover:shadow-lg'
                        style={{
                          borderRadius: '16px',
                          border: '4px solid #FFF',
                          background: 'linear-gradient(265deg, #FFF -13.17%, #F0F7FF 133.78%)',
                          boxShadow: '0px 8px 39.1px -9px rgba(0, 27, 135, 0.08)',
                          padding: '1.5rem',
                        }}
                      >
                        <div className='flex items-center justify-between w-full'>
                          <div className='text-sm text-foreground flex items-center gap-1'>
                            <span>Total cost:</span>
                            {showCostShimmer ? (
                              <TextShimmer duration={1.5} className='font-semibold text-sm inline-block'>{`₹${totalCost.toFixed(6)}`}</TextShimmer>
                            ) : (
                              <span className='font-semibold text-gray-900'>₹{totalCost.toFixed(6)}</span>
                            )}
                          </div>
                          {isCostPopoverOpen ? (
                            <ChevronDown className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <ChevronUp className='h-4 w-4 text-muted-foreground' />
                          )}
                        </div>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent 
                      className='w-80 p-0 !shadow-[rgba(31,34,37,0.09)_0px_0px_0px_0.5px,rgba(0,0,0,0.08)_0px_12px_24px_-4px,rgba(0,0,0,0.04)_0px_8px_16px_-4px] !rounded-lg border-0 bg-popover' 
                      side='top' 
                      align='start'
                      sideOffset={8}
                    >
                      <div className='p-1'>
                        <div className='py-1.5 px-2 text-xs font-medium text-muted-foreground'>
                          Cost Breakdown
                        </div>
                        <div className='border-t my-1'></div>
                        {chatHistory
                          .filter(msg => msg.role === 'assistant' && (msg.reasoningMetrics || msg.responseMetrics))
                          .map((msg, idx) => (
                            <div key={idx}>
                              {msg.reasoningMetrics && (
                                <div className='px-2 py-1.5 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-default flex justify-between items-center text-sm transition-colors'>
                                  <span className='text-muted-foreground'>Response {idx + 1} - Reasoning</span>
                                  <span className='font-medium'>₹{msg.reasoningMetrics.cost.toFixed(6)}</span>
                                </div>
                              )}
                              {msg.responseMetrics && (
                                <div className='px-2 py-1.5 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-default flex justify-between items-center text-sm transition-colors'>
                                  <span className='text-muted-foreground'>Response {idx + 1} - Output</span>
                                  <span className='font-medium'>₹{msg.responseMetrics.cost.toFixed(6)}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        <div className='border-t my-1'></div>
                        <div className='px-2 py-1.5 flex justify-between items-center text-sm font-semibold'>
                          <span>Total</span>
                          <span>₹{totalCost.toFixed(6)}</span>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>

            {/* Right Panel - Entire section wrapped in Card */}
            <Card className='flex-1 flex flex-col min-h-0 relative overflow-hidden' style={{ background: 'linear-gradient(180deg, #8e92981a 0%, #ffffff 100%)' }}>
              <CardContent className='flex-1 flex flex-col min-h-0 p-0 overflow-hidden relative'>
                {/* System Prompt Section */}
                <div className='flex-shrink-0 space-y-3 p-6 pb-0'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-sm font-medium text-foreground'>
                      System Prompt
                    </h3>
                    <div className='flex items-center gap-2'>
                      {chatHistory.length > 0 && (
                        <TooltipWrapper content="Clear all messages and start fresh">
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={handleClearChat}
                            className='h-7 px-3 text-xs'
                          >
                            Clear chat
                          </Button>
                        </TooltipWrapper>
                      )}
                      {systemPrompt.trim() && (
                        <TooltipWrapper content="Copy system prompt to clipboard">
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={handleCopySystemPrompt}
                            className='h-6 w-6 p-0'
                          >
                            <Copy className='h-3 w-3' />
                          </Button>
                        </TooltipWrapper>
                      )}
                    </div>
                  </div>
                  
                  <Textarea
                    placeholder="Enter system instructions"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className='min-h-[60px]'
                  />
                </div>

                {/* Chat History */}
                <div className='flex-1 flex flex-col mt-6 min-h-0 px-6 relative'>
                  {chatHistory.length === 0 ? (
                    <div className='flex-1 flex items-center justify-center'>
                      <div className='text-center space-y-4 text-muted-foreground'>
                        <div className='flex flex-col items-center space-y-3'>
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 18 18" className='text-muted-foreground'>
                            <title>msg-sparkle</title>
                            <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" stroke="currentColor">
                              <path d="M16.25 9C16.25 4.996 13.004 1.75 9 1.75C4.996 1.75 1.75 4.996 1.75 9C1.75 10.319 2.108 11.552 2.723 12.617C3.153 13.423 2.67 15.329 1.75 16.25C3 16.318 4.647 15.753 5.383 15.277C5.872 15.559 6.647 15.933 7.662 16.125C8.095 16.207 8.543 16.25 9 16.25C9.0045 16.25 9.009 16.25 9.0135 16.25"></path>
                              <path d="M17.4873 13.5381L15.5928 12.9072L14.9615 11.0127C14.8594 10.707 14.5728 10.5 14.2501 10.5C13.9274 10.5 13.6407 10.707 13.5387 11.0127L12.9074 12.9072L11.0129 13.5381C10.7067 13.6406 10.5002 13.9268 10.5002 14.25C10.5002 14.5732 10.7067 14.8594 11.0129 14.9619L12.9074 15.5928L13.5387 17.4873C13.6408 17.793 13.9274 18 14.2501 18C14.5728 18 14.8595 17.793 14.9615 17.4873L15.5928 15.5928L17.4873 14.9619C17.7935 14.8594 18 14.5732 18 14.25C18 13.9268 17.7935 13.6406 17.4873 13.5381Z" fill="currentColor" stroke="none"></path>
                            </g>
                          </svg>
                          <div>
                            <div className='text-base font-semibold mb-1 text-gray-900'>Start a conversation</div>
                            <div className='text-sm'>Enter a message below or use one of the quick actions</div>
                          </div>
                        </div>
                        
                        {/* Quick Actions moved here */}
                        <div className='flex flex-wrap gap-2 justify-center'>
                          {quickActions.map((action, index) => {
                            return (
                              <Button
                                key={index}
                                variant='outline'
                                size='sm'
                                onClick={() => handleQuickAction(action.label)}
                                className='text-xs'
                              >
                                {action.label}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div ref={chatContainerRef} className='flex-1 overflow-y-auto pr-2'>
                      {chatHistory.map((msg, index) => (
                        <div key={index} className='py-6 first:pt-0 last:pb-0'>
                          {msg.role === 'user' ? (
                            <div className='flex gap-3 justify-end'>
                              <div className='flex-1 flex justify-end'>
                                <div className='rounded-lg p-3 text-sm max-w-[85%] space-y-2' style={{ backgroundColor: '#ffffff' }}>
                                  {/* User Images */}
                                  {msg.images && msg.images.length > 0 && (
                                    <div className='flex flex-wrap gap-2'>
                                      {msg.images.map((img, imgIdx) => (
                                        <img 
                                          key={imgIdx}
                                          src={img} 
                                          alt={`Image ${imgIdx + 1}`} 
                                          className='max-w-[200px] max-h-[200px] object-contain rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity'
                                          onClick={() => setSelectedImage(img)}
                                        />
                                      ))}
                                    </div>
                                  )}
                                  {/* User Message Text */}
                                  {msg.content && <div>{msg.content}</div>}
                                </div>
                              </div>
                              <ChatBubbleAvatar className='h-8 w-8 bg-muted'>
                                <User className='h-4 w-4 text-muted-foreground' />
                              </ChatBubbleAvatar>
                            </div>
                          ) : msg.isThinking ? (
                            <div className='flex gap-3'>
                              <ChatBubbleAvatar className='h-8 w-8'>
                                {model.logo}
                              </ChatBubbleAvatar>
                              <div className='flex-1'>
                                <TextShimmer duration={1.5} className='text-sm font-medium'>
                                  AI is thinking...
                                </TextShimmer>
                              </div>
                            </div>
                          ) : (
                            <div className='flex gap-3'>
                              <ChatBubbleAvatar className='h-8 w-8'>
                                {model.logo}
                              </ChatBubbleAvatar>
                              <div className='flex-1 space-y-3'>
                                {/* Reasoning Section */}
                                {msg.reasoning && (
                                  <div className='space-y-2'>
                                    <div className='rounded-lg border-[0.5px] border-black/10 bg-white/70'>
                                      <button
                                        onClick={() => toggleReasoning(index)}
                                        className='w-full flex items-center justify-between px-3 py-2 hover:bg-black/5 transition-colors'
                                      >
                                        <div className='flex items-center gap-2'>
                                          {expandedReasoning.has(index) ? (
                                            <ChevronDown className='h-3.5 w-3.5' />
                                          ) : (
                                            <ChevronRight className='h-3.5 w-3.5' />
                                          )}
                                          <span className='text-xs font-medium'>Reasoning / Thought</span>
                                        </div>
                                      </button>
                                      
                                      {expandedReasoning.has(index) && (
                                        <div className='px-3 pb-3'>
                                          <div className='text-sm text-foreground whitespace-pre-wrap'>
                                            {msg.reasoning}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Performance Metrics after Reasoning */}
                                    {msg.reasoningMetrics && (
                                      <div className='flex justify-end'>
                                        <div className='bg-muted/50 rounded-md px-3 py-1.5 text-xs text-muted-foreground'>
                                          <span className='font-medium'>TTFT:</span> {msg.reasoningMetrics.ttft} ms <span className='mx-1'>|</span>
                                          <span className='font-medium'>Latency:</span> {msg.reasoningMetrics.latency} ms <span className='mx-1'>|</span>
                                          <span className='font-medium'>TPS:</span> {msg.reasoningMetrics.tps} <span className='mx-1'>|</span>
                                          <span className='font-medium'>Estimated Cost:</span> ₹{msg.reasoningMetrics.cost.toFixed(6)}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Response Content */}
                                <div className='rounded-lg p-3' style={{ backgroundColor: '#ffffff' }}>
                                  <div className='text-sm'>{msg.content}</div>
                                </div>
                                
                                {/* Action Icons and Metrics */}
                                <div className='flex items-center justify-between gap-4'>
                                  <div className='flex items-center gap-1'>
                                    <TooltipWrapper content="Regenerate response">
                                      <button
                                        onClick={() => handleRegenerateResponse(index)}
                                        className='p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'
                                      >
                                        <RotateCcw className='h-[18px] w-[18px]' />
                                      </button>
                                    </TooltipWrapper>
                                    <TooltipWrapper content="Copy response">
                                      <button
                                        onClick={() => handleCopyReasoning(msg.content)}
                                        className='p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'
                                      >
                                        <Copy className='h-[18px] w-[18px]' />
                                      </button>
                                    </TooltipWrapper>
                                  </div>
                                  
                                  {/* Performance Metrics */}
                                  {msg.responseMetrics && (
                                    <div className='bg-muted/50 rounded-md px-3 py-1.5 text-xs text-muted-foreground'>
                                      <span className='font-medium'>TTFT:</span> {msg.responseMetrics.ttft} ms <span className='mx-1'>|</span>
                                      <span className='font-medium'>Latency:</span> {msg.responseMetrics.latency} ms <span className='mx-1'>|</span>
                                      <span className='font-medium'>TPS:</span> {msg.responseMetrics.tps} <span className='mx-1'>|</span>
                                      <span className='font-medium'>Estimated Cost:</span> ₹{msg.responseMetrics.cost.toFixed(6)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Scroll Indicator */}
                  {showScrollIndicator && chatHistory.length > 0 && (
                    <div className='absolute bottom-4 left-1/2 -translate-x-1/2 z-10'>
                      <button
                        onClick={scrollToBottom}
                        className='bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-gray-300'
                      >
                        <ChevronDown className='h-5 w-5 text-gray-600 animate-bounce' />
                      </button>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className='pt-4 flex-shrink-0 px-6 pb-6'>
                  <div className='w-full'>
                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/*'
                      multiple
                      onChange={handleFileChange}
                      className='hidden'
                    />
                    
                    <AIChatInput
                      value={message}
                      onChange={setMessage}
                      onSend={handleSendMessage}
                      onAttach={handleImageAttach}
                      attachedImages={attachedImages}
                      onRemoveImage={handleRemoveImage}
                      placeholder={[
                        "Find hiking boots for wide feet",
                        "Explain quantum computing in simple terms",
                        "Write a Python function to sort a list",
                        "What are the best practices for React?",
                        "Help me debug this code",
                        "Summarize this article for me"
                      ]}
                      className="p-0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageShell>
      </div>

      {/* Setup Code Modal */}
      <SetupCodeModal
        open={isSetupCodeModalOpen}
        onClose={() => setIsSetupCodeModalOpen(false)}
        modelId={selectedModel}
        onOpenCreateApiKey={() => setIsCreateApiKeyModalOpen(true)}
      />

      {/* Create API Key Modal */}
      <CreateApiKeyModal
        open={isCreateApiKeyModalOpen}
        onClose={() => setIsCreateApiKeyModalOpen(false)}
      />

      {/* Image Preview Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className='max-w-fit max-h-fit p-4 overflow-visible bg-white border-0 shadow-2xl [&>button]:top-2 [&>button]:right-2 [&>button]:bg-black [&>button]:text-white [&>button]:rounded-full [&>button]:p-2 [&>button]:hover:bg-gray-800 [&>button]:shadow-lg [&>button]:z-10'>
          {selectedImage && (
            <img 
              src={selectedImage} 
              alt='Full size preview' 
              className='max-w-[85vw] max-h-[85vh] object-contain rounded-lg'
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
