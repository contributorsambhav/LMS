'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const SecurePdfViewer = dynamic(() => import('../../components/SecurePdfViewer'), {
  ssr: false,
});

function PdfViewerContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const title = searchParams.get('title') || 'Secure Document';

  if (!url) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-muted-foreground flex-col">
        <h2 className="text-xl font-semibold text-foreground mb-2">No Document Provided</h2>
        <p className="text-sm">Please provide a valid document URL.</p>
      </div>
    );
  }

  return (
    <SecurePdfViewer
      url={url}
      title={title}
      onClose={() => window.close()}
    />
  );
}

export default function PdfViewerPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <PdfViewerContent />
    </Suspense>
  );
}
