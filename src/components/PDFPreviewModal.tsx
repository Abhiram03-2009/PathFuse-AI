
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

  const generatePDF = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${type === 'resume' ? 'Resume' : 'Cover Letter'}</title>
        <style>
          @page {
            size: A4;
            margin: 0.75in;
          }
          @media print {
            body { 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact;
            }
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            margin: 0;
            padding: 0;
            font-size: 11pt;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #4299e1;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .name {
            font-size: 24pt;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 8px;
          }
          .contact {
            font-size: 10pt;
            color: #4a5568;
            margin-bottom: 5px;
          }
          .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 14pt;
            font-weight: bold;
            color: #2d3748;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 3px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .content {
            white-space: pre-wrap;
            line-height: 1.5;
            text-align: justify;
            font-size: 11pt;
          }
          .signature {
            margin-top: 30px;
            text-align: right;
            font-style: italic;
            color: #666;
          }
          h1, h2, h3 {
            color: #2d3748;
          }
          p {
            margin-bottom: 10px;
          }
          ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          li {
            margin-bottom: 5px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="name">[Your Name]</div>
          <div class="contact">[Your Email] | [Your Phone] | [Your Address]</div>
          <div class="contact">[LinkedIn Profile] | [Portfolio Website]</div>
        </div>
        
        <div class="section">
          <div class="section-title">${type === 'resume' ? 'Professional Resume' : 'Cover Letter'}</div>
          <div class="content">${content.replace(/\n/g, '<br>')}</div>
        </div>
        
        ${type === 'cover-letter' ? '<div class="signature">Sincerely,<br>[Your Name]</div>' : ''}
      </body>
      </html>
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
    }
  };

  const downloadAsWord = () => {
    const wordContent = `
      <!DOCTYPE html>
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
      <head>
        <meta charset="utf-8">
        <title>${type === 'resume' ? 'Resume' : 'Cover Letter'}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4299e1; padding-bottom: 15px; }
          .name { font-size: 18pt; font-weight: bold; margin-bottom: 10px; }
          .contact { font-size: 11pt; margin-bottom: 5px; }
          .section-title { font-size: 14pt; font-weight: bold; border-bottom: 1px solid #ccc; margin: 20px 0 10px 0; }
          .content { white-space: pre-wrap; text-align: justify; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="name">[Your Name]</div>
          <div class="contact">[Your Email] | [Your Phone] | [Your Address]</div>
        </div>
        <div class="section-title">${type === 'resume' ? 'Professional Resume' : 'Cover Letter'}</div>
        <div class="content">${content.replace(/\n/g, '<br>')}</div>
        ${type === 'cover-letter' ? '<p style="margin-top: 30px; text-align: right;">Sincerely,<br>[Your Name]</p>' : ''}
      </body>
      </html>
    `;

    const blob = new Blob([wordContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-${Date.now()}.doc`;
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
                  {/* Header with professional styling */}
                  <div className="text-center border-b-2 border-blue-500 pb-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">[Your Name]</h1>
                    <p className="text-sm text-gray-600">[Your Email] | [Your Phone] | [Your Address]</p>
                    <p className="text-sm text-gray-600">[LinkedIn Profile] | [Portfolio Website]</p>
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-1 mb-3 uppercase tracking-wide">
                      {type === 'resume' ? 'Professional Resume' : 'Cover Letter'}
                    </h2>
                    <div className="whitespace-pre-wrap leading-relaxed text-justify">
                      {content}
                    </div>
                    {type === 'cover-letter' && (
                      <div className="mt-8 text-right">
                        <p className="italic text-gray-600">Sincerely,</p>
                        <p className="italic text-gray-600 mt-2">[Your Name]</p>
                      </div>
                    )}
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
          <Button onClick={downloadAsWord} variant="outline" className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4 mr-2" />
            Download Word
          </Button>
          <Button onClick={generatePDF} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Print as PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFPreviewModal;
