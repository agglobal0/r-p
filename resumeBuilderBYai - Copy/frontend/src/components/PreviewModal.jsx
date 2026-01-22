import React from 'react';

export default function PreviewModal({ item, onClose, onDownload, children }) {
  if (!item) return null;

  const renderPreview = () => {
    if (!item.fileContent) return <div className="text-sm text-slate-400">No file preview available.</div>;

    if (item.type === 'pdf' || item.type === 'resume') {
      const url = `data:application/pdf;base64,${item.fileContent}`;
      return (
        <iframe title="preview" src={url} className="w-full h-80 border rounded" />
      );
    }

    return <div className="text-sm text-slate-400">Preview not available for this file type. Use Download.</div>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 max-w-3xl w-full bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{item.title || item.name || 'Preview'}</h3>
            <div className="text-xs text-slate-400">{item.type?.toUpperCase() || 'ITEM'}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onDownload?.(item)} className="px-3 py-1 rounded bg-indigo-600">Download</button>
            <button onClick={onClose} className="px-3 py-1 rounded bg-slate-700">Close</button>
          </div>
        </div>

        <div className="mb-4">{renderPreview()}</div>

        {children}
      </div>
    </div>
  );
}
