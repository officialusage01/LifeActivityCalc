import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { 
  Share2, 
  Download, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Copy,
  Loader
} from 'lucide-react';
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  LinkedinShareButton,
  WhatsappShareButton,
  WhatsappIcon
} from 'react-share';

interface ShareOptionsProps {
  resultsRef: React.RefObject<HTMLDivElement>;
  onDownloadPDF: () => void;
}

const ShareOptions: React.FC<ShareOptionsProps> = ({ resultsRef, onDownloadPDF }) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const shareUrl = window.location.href;
  const title = "Check out my Life Activity Calculator results!";

  const captureScreenshot = async () => {
    if (!resultsRef.current) return;
    
    try {
      setIsCapturing(true);
      
      // First, ensure all charts are fully rendered
      const chartElements = resultsRef.current.querySelectorAll('canvas');
      
      // Wait a moment to ensure charts are fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Capture the screenshot with improved settings
      const canvas = await html2canvas(resultsRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        // Ensure charts are rendered before capture
        onclone: (document, element) => {
          // Force any charts to render in the cloned document
          const clonedCharts = element.querySelectorAll('canvas');
          clonedCharts.forEach((canvas, index) => {
            const originalCanvas = chartElements[index];
            const context = canvas.getContext('2d');
            if (context && originalCanvas) {
              context.drawImage(originalCanvas, 0, 0);
            }
          });
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      setScreenshotUrl(imgData);
      setShowShareOptions(true);
    } catch (error) {
      console.error("Error capturing screenshot:", error);
      alert("There was an error capturing your results. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  const copyImageToClipboard = async () => {
    if (!screenshotUrl) return;
    
    try {
      const response = await fetch(screenshotUrl);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Error copying image to clipboard:", error);
      
      // Fallback for browsers that don't support clipboard API with images
      try {
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = screenshotUrl;
        link.download = 'life-activity-results.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert("Your browser doesn't support direct copying of images. The image has been downloaded instead.");
      } catch (fallbackError) {
        console.error("Fallback download failed:", fallbackError);
        alert("Unable to copy or download the image. Please try the download button instead.");
      }
    }
  };

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={captureScreenshot}
          disabled={isCapturing}
          className={`flex items-center ${
            isCapturing ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
          } text-white py-2 px-4 rounded-lg transition-colors`}
        >
          {isCapturing ? (
            <>
              <Loader size={18} className="mr-2 animate-spin" />
              Capturing...
            </>
          ) : (
            <>
              <Share2 size={18} className="mr-2" />
              Share Results
            </>
          )}
        </button>
        
        <button
          onClick={onDownloadPDF}
          className="flex items-center bg-indigo-100 text-indigo-700 py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors"
        >
          <Download size={18} className="mr-2" />
          Download as PDF
        </button>
      </div>
      
      {showShareOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Share Your Results</h3>
            
            {screenshotUrl && (
              <div className="mb-4 border rounded-lg overflow-hidden">
                <img 
                  src={screenshotUrl} 
                  alt="Your results" 
                  className="w-full h-auto"
                />
              </div>
            )}
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <FacebookShareButton url={shareUrl} quote={title} className="flex flex-col items-center">
                <div className="bg-blue-100 p-3 rounded-full mb-1">
                  <Facebook size={24} className="text-blue-600" />
                </div>
                <span className="text-xs">Facebook</span>
              </FacebookShareButton>
              
              <TwitterShareButton url={shareUrl} title={title} className="flex flex-col items-center">
                <div className="bg-blue-100 p-3 rounded-full mb-1">
                  <Twitter size={24} className="text-blue-400" />
                </div>
                <span className="text-xs">Twitter</span>
              </TwitterShareButton>
              
              <LinkedinShareButton url={shareUrl} title={title} className="flex flex-col items-center">
                <div className="bg-blue-100 p-3 rounded-full mb-1">
                  <Linkedin size={24} className="text-blue-700" />
                </div>
                <span className="text-xs">LinkedIn</span>
              </LinkedinShareButton>
              
              <WhatsappShareButton url={shareUrl} title={title} className="flex flex-col items-center">
                <div className="bg-green-100 p-3 rounded-full mb-1">
                  <WhatsappIcon size={24} round />
                </div>
                <span className="text-xs">WhatsApp</span>
              </WhatsappShareButton>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={copyImageToClipboard}
                className="flex-1 flex items-center justify-center bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Copy size={18} className="mr-2" />
                {isCopied ? "Copied!" : "Copy Image"}
              </button>
              
              <a
                href={screenshotUrl || '#'}
                download="life-activity-results.png"
                className="flex-1 flex items-center justify-center bg-indigo-100 text-indigo-700 py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors"
              >
                <Download size={18} className="mr-2" />
                Save Image
              </a>
              
              <button
                onClick={() => setShowShareOptions(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareOptions;