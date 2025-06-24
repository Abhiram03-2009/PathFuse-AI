
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, X } from 'lucide-react';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  type: 'resume' | 'cover-letter';
}

const PDFPreviewModal = ({ isOpen, onClose, title, content, type }: PDFPreviewModalProps) => {
  const handleDownload = () => {
    // Create a simple text file for now (in a real app, this would generate a PDF)
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${type}-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-gray-900">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>{title} Preview</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          <div className="bg-white border rounded-lg p-8 min-h-[600px] shadow-lg">
            <div className="prose max-w-none text-gray-900">
              {content ? (
                <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {content}
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
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
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
