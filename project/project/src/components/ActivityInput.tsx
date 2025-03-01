import React from 'react';

interface ActivityInputProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const ActivityInput: React.FC<ActivityInputProps> = ({
  icon,
  label,
  value,
  onChange,
  min = 0,
  max = 24,
  step = 0.5
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center mb-2">
        <span className="text-indigo-600 mr-2">{icon}</span>
        <label className="text-sm font-medium text-gray-700">{label}</label>
      </div>
      <div className="flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <span className="ml-3 w-12 text-center font-medium text-indigo-700">
          {value}h
        </span>
      </div>
    </div>
  );
};

export default ActivityInput;