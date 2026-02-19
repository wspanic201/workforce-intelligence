'use client';

export function Aurora({ className }: { className?: string } = {}) {
  return (
    <div className={`aurora${className ? ` ${className}` : ''}`} aria-hidden="true">
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      <div className="aurora-blob aurora-blob-4" />
    </div>
  );
}
