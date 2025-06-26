
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  type: 'resume' | 'cover-letter';
}

const PDFPreviewModal = ({ isOpen, onClose, title, content, type }: PDFPreviewModalProps) => {
  const { isDarkMode } = useTheme();

  const handleDownload = () => {
    // Create HTML content for PDF generation
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${type === 'resume' ? 'Resume' : 'Cover Letter'}</title>
        <style>
          @page {
            size: A4;
            margin: 1in;
          }
          body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            color: #333;
            max-width: 8.5in;
            margin: 0 auto;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #4299e1;
            padding-bottom: 20px;
            margin-bottom: 30px;
            position: relative;
          }
          .watermark {
            position: absolute;
            top: -10px;
            right: 0;
            font-size: 10px;
            color: #ccc;
            transform: rotate(45deg);
            opacity: 0.5;
          }
          .name {
            font-size: 28px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 10px;
          }
          .contact {
            font-size: 14px;
            color: #4a5568;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2d3748;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .content {
            white-space: pre-wrap;
            line-height: 1.8;
            text-align: justify;
          }
          .bullet {
            margin-left: 20px;
            position: relative;
          }
          .bullet::before {
            content: "▪";
            color: #4299e1;
            font-weight: bold;
            position: absolute;
            left: -15px;
          }
          .highlight {
            background: linear-gradient(180deg, transparent 50%, #bee3f8 50%);
            padding: 2px 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="watermark">Professional Document</div>
          <div class="name">[Your Name]</div>
          <div class="contact">[Your Email] | [Your Phone] | [Your Address]</div>
        </div>
        
        <div class="section">
          <div class="section-title">${type === 'resume' ? 'Professional Resume' : 'Cover Letter'}</div>
          <div class="content">${content.replace(/\n/g, '<br>')}</div>
        </div>
      </body>
      </html>
    `;

    // Create a Blob with HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl max-h-[90vh] ${isDarkMode ? 'dark' : ''} bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700`}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-gray-900 dark:text-white">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>{title} Preview</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          <div className="bg-white border rounded-lg p-8 min-h-[600px] shadow-lg">
            <div className="prose max-w-none text-gray-900">
              {content ? (
                <div>
                  {/* Header with watermark */}
                  <div className="text-center border-b-2 border-blue-500 pb-4 mb-6 relative">
                    <div className="absolute top-0 right-0 text-xs text-gray-300 transform rotate-45 opacity-50">
                      Professional Document
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">[Your Name]</h1>
                    <p className="text-sm text-gray-600">[Your Email] | [Your Phone] | [Your Address]</p>
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-1 mb-3 uppercase tracking-wide">
                      {type === 'resume' ? 'Professional Resume' : 'Cover Letter'}
                    </h2>
                    <div className="whitespace-pre-wrap leading-relaxed text-justify">
                      {content}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4" />
                  <p>No content to preview yet</p>
                  <p className="text-sm">Fill in your information to see a preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            Close
          </Button>
          <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFPreviewModal;
