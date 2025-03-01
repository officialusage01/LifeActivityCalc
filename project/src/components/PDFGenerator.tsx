import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFGeneratorOptions {
  resultsRef: React.RefObject<HTMLDivElement>;
  birthDate: string;
  age: number;
  activities: Record<string, number>;
  results: Record<string, number>;
}

const generatePDF = async ({
  resultsRef,
  birthDate,
  age,
  activities,
  results
}: PDFGeneratorOptions) => {
  if (!resultsRef.current) return;
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Add title
  pdf.setFontSize(22);
  pdf.setTextColor(75, 70, 229); // indigo color
  pdf.text('Life Activity Calculator Results', 105, 20, { align: 'center' });
  
  // Add user info
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Birth Date: ${birthDate}`, 20, 35);
  pdf.text(`Age: ${age.toFixed(2)} years`, 20, 42);
  pdf.text(`Report Generated: ${new Date().toLocaleDateString()}`, 20, 49);
  
  // Add activity inputs section
  pdf.setFontSize(16);
  pdf.setTextColor(75, 70, 229);
  pdf.text('Daily Activity Inputs', 20, 65);
  
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  let yPos = 75;
  
  const activityLabels: Record<string, string> = {
    sleep: 'Sleep',
    eating: 'Eating',
    miscellaneous: 'Miscellaneous',
    learning: 'Learning',
    sports: 'Sports',
    screenTime: 'Screen Time',
    work: 'Work',
    travel: 'Travel'
  };
  
  Object.entries(activities).forEach(([key, value]) => {
    pdf.text(`${activityLabels[key]}: ${value} hours per day`, 25, yPos);
    yPos += 7;
  });
  
  // Format hours to a readable format
  const formatHours = (hours: number): string => {
    if (hours < 24) {
      return `${hours.toFixed(1)} hours`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (days < 365) {
      return `${days} days, ${remainingHours.toFixed(1)} hours`;
    }
    
    const years = Math.floor(days / 365);
    const remainingDays = Math.floor(days % 365);
    
    return `${years} years, ${remainingDays} days`;
  };
  
  // Add results section
  pdf.setFontSize(16);
  pdf.setTextColor(75, 70, 229);
  pdf.text('Total Time Spent', 20, yPos + 10);
  
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  yPos += 20;
  
  Object.entries(results)
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a)
    .forEach(([key, value]) => {
      pdf.text(`${activityLabels[key]}: ${formatHours(value)}`, 25, yPos);
      yPos += 7;
    });
  
  // Calculate interesting facts
  const calculateFacts = () => {
    const facts = [];
    
    // Sleep fact
    if (results.sleep) {
      const sleepYears = (results.sleep / 24 / 365).toFixed(1);
      facts.push(`You've spent approximately ${sleepYears} years sleeping in your life.`);
    }
    
    // Screen time fact
    if (results.screenTime && age > 3) {
      const screenDays = Math.floor(results.screenTime / 24);
      facts.push(`You've spent about ${screenDays} days looking at screens.`);
    }
    
    // Work vs leisure fact
    if (results.work && results.sports) {
      const workToSportsRatio = (results.work / results.sports).toFixed(1);
      facts.push(`For every hour of sports/exercise, you've spent ${workToSportsRatio} hours working.`);
    }
    
    return facts;
  };
  
  // Add interesting facts
  pdf.setFontSize(16);
  pdf.setTextColor(75, 70, 229);
  pdf.text('Interesting Facts', 20, yPos + 10);
  
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  yPos += 20;
  
  calculateFacts().forEach(fact => {
    pdf.text(`• ${fact}`, 25, yPos);
    yPos += 7;
  });
  
  // Add visual chart - Improved to ensure charts are captured properly
  try {
    // First, ensure all charts are rendered
    const chartElements = resultsRef.current.querySelectorAll('canvas');
    if (chartElements.length > 0) {
      // Add a new page for charts
      pdf.addPage();
      
      pdf.setFontSize(18);
      pdf.setTextColor(75, 70, 229);
      pdf.text('Visual Representation of Your Time', 105, 20, { align: 'center' });
      
      // Capture the entire results section with charts
      const canvas = await html2canvas(resultsRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
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
      
      // Calculate aspect ratio to fit the image properly
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth - 40; // 20mm margin on each side
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      // If image is too tall, scale it to fit the page
      const maxHeight = pageHeight - 40; // 20mm margin top and bottom
      const finalImgHeight = Math.min(imgHeight, maxHeight);
      const finalImgWidth = finalImgHeight * canvas.width / canvas.height;
      
      // Center the image horizontally
      const xPos = (pageWidth - finalImgWidth) / 2;
      
      pdf.addImage(imgData, 'PNG', xPos, 30, finalImgWidth, finalImgHeight);
      
      // Add individual charts if they exist
      if (chartElements.length >= 2) {
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.setTextColor(75, 70, 229);
        pdf.text('Detailed Charts', 105, 20, { align: 'center' });
        
        let chartYPos = 30;
        
        // Capture and add each chart individually for better quality
        for (let i = 0; i < Math.min(chartElements.length, 2); i++) {
          const chartCanvas = await html2canvas(chartElements[i], {
            scale: 3,
            backgroundColor: '#ffffff'
          });
          
          const chartImgData = chartCanvas.toDataURL('image/png');
          const chartWidth = pageWidth - 60;
          const chartHeight = chartCanvas.height * chartWidth / chartCanvas.width;
          
          // Center the chart horizontally
          const chartXPos = (pageWidth - chartWidth) / 2;
          
          pdf.addImage(chartImgData, 'PNG', chartXPos, chartYPos, chartWidth, chartHeight);
          chartYPos += chartHeight + 20;
          
          // Add chart title
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);
          pdf.text(i === 0 ? 'Time Distribution (Pie Chart)' : 'Activity Comparison (Bar Chart)', 
                  105, chartYPos - 10, { align: 'center' });
        }
      }
    } else {
      // Fallback if no charts are found
      pdf.setFontSize(14);
      pdf.setTextColor(100, 100, 100);
      pdf.text('No visual charts available', 105, yPos + 20, { align: 'center' });
    }
  } catch (error) {
    console.error("Error capturing chart for PDF:", error);
    pdf.setFontSize(14);
    pdf.setTextColor(255, 0, 0);
    pdf.text('Error generating charts', 105, yPos + 20, { align: 'center' });
  }
  
  // Add footer
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  
  // Add footer to all pages
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.text('Generated by Life Activity Calculator', 105, 285, { align: 'center' });
    pdf.text(`Page ${i} of ${pageCount}`, 105, 292, { align: 'center' });
  }
  
  // Save the PDF
  pdf.save('life-activity-report.pdf');
};

export default generatePDF;