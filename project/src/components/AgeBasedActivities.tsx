import React from 'react';
import { BookOpen, Tv, Briefcase, Bike, Car } from 'lucide-react';
import ActivityInput from './ActivityInput';

interface AgeBasedActivitiesProps {
  age: number;
  activities: {
    learning: number;
    sports: number;
    screenTime: number;
    work: number;
    travel: number;
  };
  onActivityChange: (activity: string, value: number) => void;
}

const AgeBasedActivities: React.FC<AgeBasedActivitiesProps> = ({
  age,
  activities,
  onActivityChange
}) => {
  return (
    <>
      {age >= 5 && (
        <ActivityInput 
          icon={<BookOpen size={20} />}
          label="Learning/Education"
          value={activities.learning}
          onChange={(value) => onActivityChange('learning', value)}
          min={0}
          max={12}
        />
      )}
      
      {age >= 5 && (
        <ActivityInput 
          icon={<Bike size={20} />}
          label="Sports/Health Activities"
          value={activities.sports}
          onChange={(value) => onActivityChange('sports', value)}
          min={0}
          max={6}
          step={0.5}
        />
      )}
      
      {age >= 3 && (
        <ActivityInput 
          icon={<Tv size={20} />}
          label="Screen Time"
          value={activities.screenTime}
          onChange={(value) => onActivityChange('screenTime', value)}
          min={0}
          max={16}
        />
      )}
      
      {age >= 18 && (
        <ActivityInput 
          icon={<Briefcase size={20} />}
          label="Work"
          value={activities.work}
          onChange={(value) => onActivityChange('work', value)}
          min={0}
          max={16}
        />
      )}
      
      {age >= 5 && (
        <ActivityInput 
          icon={<Car size={20} />}
          label="Travel"
          value={activities.travel}
          onChange={(value) => onActivityChange('travel', value)}
          min={0}
          max={6}
          step={0.5}
        />
      )}
    </>
  );
};

export default AgeBasedActivities;