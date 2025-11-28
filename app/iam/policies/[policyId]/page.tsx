'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { PageLayout } from '@/components/page-layout';
import { DetailSection } from '@/components/detail-section';
import { DetailGrid } from '@/components/detail-grid';
import { DetailItem } from '@/components/detail-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPolicyById, type Policy } from '@/lib/iam-data';
import { notFound } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function PolicyDetailsPage() {
  const params = useParams();
  const { toast } = useToast();
  const policyId = params.policyId as string;
  const policy = getPolicyById(policyId);
  const [jsonView, setJsonView] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!policy) {
    notFound();
  }

  const handleCopyJson = () => {
    const jsonString = JSON.stringify(policy, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    toast({
      title: 'Copied to clipboard',
      description: 'Policy JSON has been copied to your clipboard.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEffectBadgeVariant = (effect: string) => {
    return effect === 'Allow' ? 'default' : 'destructive';
  };

  const customBreadcrumbs = [
    { href: '/dashboard', title: 'Home' },
    { href: '/iam', title: 'IAM' },
    { href: '/iam/policies', title: 'Policies' },
    { href: `/iam/policies/${policyId}`, title: policy.name },
  ];

  return (
    <PageLayout
      title={policy.name}
      description={policy.description || 'Policy details and access rules'}
      customBreadcrumbs={customBreadcrumbs}
      headerActions={
        <Button
          variant='outline'
          onClick={() => setJsonView(!jsonView)}
          size='sm'
        >
          {jsonView ? 'View Details' : 'View JSON'}
        </Button>
      }
    >
      <div className='space-y-6'>
        {jsonView ? (
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-base font-medium'>
                  Policy JSON
                </CardTitle>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleCopyJson}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className='bg-muted p-4 rounded-md overflow-x-auto text-xs'>
                {JSON.stringify(policy, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Policy Information */}
            <DetailSection title='Policy Information'>
              <DetailGrid>
                <DetailItem label='Name' value={policy.name} />
                <DetailItem
                  label='Description'
                  value={policy.description || 'N/A'}
                />
                <DetailItem
                  label='Created By'
                  value={
                    <div>
                      <div>{policy.creatorName}</div>
                      <div className='text-sm text-muted-foreground'>
                        {policy.creatorEmail}
                      </div>
                    </div>
                  }
                />
                <DetailItem
                  label='Created At'
                  value={formatDate(policy.createdAt)}
                />
                <DetailItem
                  label='Total Rules'
                  value={`${policy.rules.length} rule${policy.rules.length !== 1 ? 's' : ''}`}
                />
              </DetailGrid>
            </DetailSection>

            {/* Access Rules */}
            <DetailSection title='Access Rules'>
              {policy.rules.length > 0 ? (
                <div className='space-y-3'>
                  {policy.rules.map((rule, index) => (
                    <Card key={rule.id}>
                      <CardHeader>
                        <div className='flex items-center justify-between'>
                          <CardTitle className='text-base font-medium'>
                            Rule {index + 1}
                          </CardTitle>
                          <Badge variant={getEffectBadgeVariant(rule.effect)}>
                            {rule.effect}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <DetailGrid>
                          <DetailItem label='Effect' value={rule.effect} />
                          <DetailItem
                            label='Operation'
                            value={rule.operation}
                          />
                          <DetailItem
                            label='Policy Type'
                            value={rule.policyType}
                          />
                          <DetailItem
                            label='Resource Name'
                            value={
                              <code className='bg-muted px-2 py-1 rounded text-sm'>
                                {rule.resourceName}
                              </code>
                            }
                          />
                        </DetailGrid>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className='py-8 text-center'>
                    <p className='text-sm text-muted-foreground'>
                      No rules defined for this policy
                    </p>
                  </CardContent>
                </Card>
              )}
            </DetailSection>
          </>
        )}
      </div>
    </PageLayout>
  );
}

