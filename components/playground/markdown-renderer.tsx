'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Code block component with copy button
const CodeBlock = ({ language, value }: { language: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='relative group my-4'>
      <div className='absolute right-2 top-2 z-10'>
        <Button
          variant='ghost'
          size='sm'
          onClick={handleCopy}
          className='h-8 px-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/80'
        >
          {copied ? (
            <>
              <Check className='h-4 w-4 mr-1' />
              <span className='text-xs'>Copied</span>
            </>
          ) : (
            <>
              <Copy className='h-4 w-4 mr-1' />
              <span className='text-xs'>Copy</span>
            </>
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          padding: '1.5rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
        }}
        showLineNumbers={value.split('\n').length > 5}
      >
        {value}
      </SyntaxHighlighter>
      {language && (
        <div className='absolute top-2 left-3 text-xs text-gray-400 font-mono'>
          {language}
        </div>
      )}
    </div>
  );
};

// Collapsible JSON viewer
const JSONViewer = ({ json }: { json: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  let parsedJSON: any;
  let isLargeJSON = false;

  try {
    parsedJSON = JSON.parse(json);
    const jsonString = JSON.stringify(parsedJSON, null, 2);
    isLargeJSON = jsonString.split('\n').length > 20;
  } catch {
    // Not valid JSON, render as code
    return <CodeBlock language='json' value={json} />;
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(parsedJSON, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const jsonString = JSON.stringify(parsedJSON, null, 2);
  const displayJSON = isLargeJSON && !isExpanded
    ? jsonString.split('\n').slice(0, 10).join('\n') + '\n  ...'
    : jsonString;

  return (
    <div className='relative my-4 border border-gray-200 rounded-lg overflow-hidden'>
      <div className='bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200'>
        <div className='flex items-center gap-2'>
          <span className='text-xs font-mono text-gray-600'>JSON</span>
          {isLargeJSON && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900'
            >
              {isExpanded ? (
                <>
                  <ChevronDown className='h-3 w-3' />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronRight className='h-3 w-3' />
                  Expand
                </>
              )}
            </button>
          )}
        </div>
        <Button
          variant='ghost'
          size='sm'
          onClick={handleCopy}
          className='h-6 px-2 text-xs'
        >
          {copied ? (
            <>
              <Check className='h-3 w-3 mr-1' />
              Copied
            </>
          ) : (
            <>
              <Copy className='h-3 w-3 mr-1' />
              Copy
            </>
          )}
        </Button>
      </div>
      <div className='bg-gray-900 text-gray-100 p-4 overflow-x-auto'>
        <pre className='text-sm font-mono'>{displayJSON}</pre>
      </div>
    </div>
  );
};

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Detect if content contains JSON
  const isJSON = (text: string) => {
    const trimmed = text.trim();
    return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
           (trimmed.startsWith('[') && trimmed.endsWith(']'));
  };

  // Check if this is a code block with JSON
  const isJSONBlock = content.includes('```json') || 
                      (content.includes('```') && isJSON(content.replace(/```/g, '').trim()));

  return (
    <div className={cn('markdown-content prose prose-sm max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className='text-lg font-bold text-gray-900 mb-3 mt-5 first:mt-0 border-b border-gray-200 pb-2'>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className='text-base font-semibold text-gray-900 mb-2 mt-4'>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className='text-sm font-semibold text-gray-900 mb-2 mt-3'>
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className='text-xs font-semibold text-gray-900 mb-1.5 mt-2'>
              {children}
            </h4>
          ),

          // Paragraphs
          p: ({ children, node }) => {
            // Check for error messages
            const text = node?.children?.[0]?.type === 'text' 
              ? String((node.children[0] as any).value) 
              : '';
            
            const isError = text.toLowerCase().includes('error:') || 
                           text.toLowerCase().includes('timeout') ||
                           text.toLowerCase().includes('failed');

            return (
              <p className={cn(
                'text-base leading-relaxed mb-4',
                isError 
                  ? 'text-red-700 bg-red-50 border-l-4 border-red-500 p-3 rounded-r'
                  : 'text-gray-700'
              )}>
                {children}
              </p>
            );
          },

          // Code blocks
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const value = String(children).replace(/\n$/, '');

            // Check if it's JSON
            if (!inline && (language === 'json' || isJSON(value))) {
              return <JSONViewer json={value} />;
            }

            // Inline code
            if (inline) {
              return (
                <code className='bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200'>
                  {children}
                </code>
              );
            }

            // Block code
            return <CodeBlock language={language} value={value} />;
          },

          // Lists
          ul: ({ children }) => (
            <ul className='list-disc list-inside space-y-2 mb-4 text-gray-700 ml-4'>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className='list-decimal list-inside space-y-2 mb-4 text-gray-700 ml-4'>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className='text-base leading-relaxed ml-2'>
              {children}
            </li>
          ),

          // Tables
          table: ({ children }) => (
            <div className='overflow-x-auto my-4 border border-gray-200 rounded-lg'>
              <table className='min-w-full divide-y divide-gray-200'>
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className='bg-gray-50'>
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className='bg-white divide-y divide-gray-200'>
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className='hover:bg-gray-50 transition-colors'>
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className='px-4 py-3 text-sm text-gray-700'>
              {children}
            </td>
          ),

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className='border-l-4 border-blue-500 bg-blue-50 pl-4 pr-4 py-3 my-4 italic text-gray-700 rounded-r'>
              {children}
            </blockquote>
          ),

          // Links
          a: ({ children, href }) => (
            <a
              href={href}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 hover:text-blue-800 hover:underline font-medium'
            >
              {children}
            </a>
          ),

          // Bold and Italic
          strong: ({ children }) => (
            <strong className='font-semibold text-gray-900'>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className='italic text-gray-800'>
              {children}
            </em>
          ),

          // Horizontal rule
          hr: () => (
            <hr className='my-6 border-t border-gray-200' />
          ),

          // Key-value pairs (custom handling via strong)
          // Example: Latency: 320ms
          // Will be styled through strong and text
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

