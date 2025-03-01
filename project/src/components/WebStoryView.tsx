import React, { useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WebStoryViewProps {
  children: React.ReactNode[];
  onComplete?: () => void;
}

const WebStoryView: React.FC<WebStoryViewProps> = ({ children, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [animationDirection, setAnimationDirection] = useState<'next' | 'prev'>('next');
  const storyRef = useRef<HTMLDivElement>(null);
  
  const totalSteps = React.Children.count(children);
  
  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setAnimationDirection('next');
      setCurrentStep(prev => prev + 1);
    } else if (onComplete) {
      onComplete();
    }
  };
  
  const goToPrevStep = () => {
    if (currentStep > 0) {
      setAnimationDirection('prev');
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handlers = useSwipeable({
    onSwipedLeft: () => goToNextStep(),
    onSwipedRight: () => goToPrevStep(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });
  
  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      ref={storyRef}
      {...handlers}
    >
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-center p-2">
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div 
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'w-8 bg-indigo-600' 
                  : index < currentStep 
                    ? 'w-4 bg-indigo-400' 
                    : 'w-4 bg-gray-300'
              }`}
            ></div>
          ))}
        </div>
      </div>
      
      <div className="h-full">
        {React.Children.map(children, (child, index) => (
          <div
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              index === currentStep 
                ? 'opacity-100 translate-x-0' 
                : index < currentStep
                  ? 'opacity-0 -translate-x-full'
                  : 'opacity-0 translate-x-full'
            }`}
          >
            {child}
          </div>
        ))}
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4">
        <button
          onClick={goToPrevStep}
          disabled={currentStep === 0}
          className={`p-2 rounded-full bg-white shadow-md ${
            currentStep === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
          }`}
        >
          <ChevronLeft size={24} className="text-indigo-700" />
        </button>
        
        <button
          onClick={goToNextStep}
          className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
        >
          {currentStep === totalSteps - 1 ? (
            <span className="px-2 font-medium text-indigo-700">Finish</span>
          ) : (
            <ChevronRight size={24} className="text-indigo-700" />
          )}
        </button>
      </div>
    </div>
  );
};

export default WebStoryView;