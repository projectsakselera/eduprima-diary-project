"use client";

import React from 'react';

// Utility function for converting R2 URLs to proxy URLs
const getProxyUrl = (url: string) => {
  if (!url) return '';
  const cleanUrl = url.replace(/^@?https?:\/\/[^\/]+\//, '');
  return `/api/files/${cleanUrl}`;
};

interface FileCellProps {
  value: string | null;
  filename: string;
  tutorName: string;
  onPreview: (url: string, title: string, type: string) => void;
}

export const FileCell: React.FC<FileCellProps> = ({ value, filename, tutorName, onPreview }) => {
  if (!value) {
    return (
      <div className="text-muted-foreground text-xs">
        No file
      </div>
    );
  }

  const getFileIcon = (filename: string) => {
    if (filename === 'fotoProfil') return '🖼️';
    if (filename === 'dokumenIdentitas') return '🆔';
    if (filename === 'dokumenPendidikan') return '🎓';
    if (filename === 'dokumenSertifikat') return '📜';
    return '📎';
  };

  const getFileLabel = (filename: string) => {
    if (filename === 'fotoProfil') return 'Foto';
    if (filename === 'dokumenIdentitas') return 'ID';
    if (filename === 'dokumenPendidikan') return 'Edu';
    if (filename === 'dokumenSertifikat') return 'Cert';
    return 'File';
  };

  const getFileTitle = (filename: string, tutorName: string) => {
    if (filename === 'fotoProfil') return `Foto Profil - ${tutorName}`;
    if (filename === 'dokumenIdentitas') return `Dokumen Identitas - ${tutorName}`;
    if (filename === 'dokumenPendidikan') return `Dokumen Pendidikan - ${tutorName}`;
    if (filename === 'dokumenSertifikat') return `Dokumen Sertifikat - ${tutorName}`;
    return `File - ${tutorName}`;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent cell selection
    onPreview(value, getFileTitle(filename, tutorName), filename);
  };

  const handleDirectLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(value, '_blank');
  };

  // Special handling for profile photo - show thumbnail directly
  if (filename === 'fotoProfil') {
    return (
      <div className="flex items-center gap-2 min-w-0">
        <div className="relative">
          <img 
            src={getProxyUrl(value)} 
            alt={`Foto profil ${tutorName}`}
            className="w-8 h-8 rounded-full object-cover border border-border cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleClick}
            onError={(e) => {
              // Log error for debugging
              const target = e.target as HTMLImageElement;
              console.error('❌ Image load failed:', {
                src: target.src,
                originalValue: value,
                proxyUrl: getProxyUrl(value)
              });
              
              // Fallback to icon if image fails to load
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="w-8 h-8 rounded-full bg-red-100 border border-red-300 flex items-center justify-center cursor-pointer hover:bg-red-200 transition-colors" title="Image failed to load">
                    <span class="text-xs">❌</span>
                  </div>
                `;
                parent.onclick = (e) => {
                  e.stopPropagation();
                  onPreview(value, getFileTitle(filename, tutorName), filename);
                };
              }
            }}
            title={`${tutorName} - Click to enlarge`}
          />
          {/* Small indicator for Cloudflare R2 */}
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full border border-white" title="Cloudflare R2 Storage" />
        </div>
        <div className="flex flex-col min-w-0">
          <button
            onClick={handleClick}
            className="text-xs text-primary hover:text-primary/80 hover:underline text-left truncate max-w-[60px]"
            title={`Preview ${getFileLabel(filename)} - ${tutorName}`}
          >
            {getFileLabel(filename)}
          </button>
          <div className="text-[10px] text-muted-foreground">
            Click to enlarge
          </div>
        </div>
      </div>
    );
  }

  // For other file types, show the original layout
  return (
    <div className="flex items-center gap-1 min-w-0">
      <span className="text-sm">{getFileIcon(filename)}</span>
      <div className="flex flex-col min-w-0">
        <button
          onClick={handleClick}
          className="text-xs text-primary hover:text-primary/80 hover:underline text-left truncate max-w-[80px]"
          title={`Preview ${getFileLabel(filename)} - ${tutorName}`}
        >
          {getFileLabel(filename)}
        </button>
        <div className="text-[10px] text-muted-foreground">
          Click to preview
        </div>
      </div>
    </div>
  );
};