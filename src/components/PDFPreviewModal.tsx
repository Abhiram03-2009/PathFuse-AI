
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
    // Create a proper PDF using jsPDF
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      
      // Set font
      doc.setFont('helvetica');
      
      // Add content with proper formatting
      let processedContent = content;
      
      const lines = processedContent.split('\n');
      let yPosition = 20;
      
      lines.forEach((line, index) => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Check if it's a header line (first few lines or all caps)
        if (index < 5 || line === line.toUpperCase()) {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
        }
        
        // Split long lines
        const splitLines = doc.splitTextToSize(line, 170);
        splitLines.forEach((splitLine: string) => {
          doc.text(splitLine, 20, yPosition);
          yPosition += 6;
        });
      });
      
      // Save the PDF
      const fileName = `${type === 'resume' ? 'Resume' : 'Cover_Letter'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    }).catch((error) => {
      console.error('PDF generation failed:', error);
      // Create downloadable text file as fallback
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type === 'resume' ? 'Resume' : 'Cover_Letter'}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
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
        
        <div className="flex-1 overflow-auto max-h-[70vh]">
          <div className="bg-white border rounded-lg p-8 min-h-[600px] shadow-lg">
            <div className="prose max-w-none text-gray-900">
              {content ? (
                <div>
                  {/* Content */}
                  <div className="space-y-4">
                    <div className="whitespace-pre-wrap leading-relaxed text-justify">
                      {content}
                    </div>
                    {type === 'cover-letter' && (
                      <div className="mt-8 text-right">
                        <p className="italic text-gray-600">Sincerely,</p>
                        <p className="italic text-gray-600 mt-2">{content.split('\n')[0] || '[Your Name]'}</p>
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
