import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Moon, Coffee, Briefcase, BookOpen, Tv, Bike, Car, MoreHorizontal, AlertCircle } from 'lucide-react';
import ActivityInput from './components/ActivityInput';
import AgeBasedActivities from './components/AgeBasedActivities';
import ResultsDisplay from './components/ResultsDisplay';

function App() {
  const [birthDate, setBirthDate] = useState<string>('');
  const [birthTime, setBirthTime] = useState<string>('00:00');
  const [age, setAge] = useState<number | null>(null);
  const [activities, setActivities] = useState({
    sleep: 8,
    eating: 1.5,
    miscellaneous: 2,
    learning: 6,
    sports: 1,
    screenTime: 3,
    work: 8,
    travel: 1,
  });
  const [results, setResults] = useState<Record<string, number> | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [totalDailyHours, setTotalDailyHours] = useState(0);
  const [exceeds24Hours, setExceeds24Hours] = useState(false);

  useEffect(() => {
    if (birthDate) {
      const today = new Date();
      const birth = new Date(`${birthDate}T${birthTime}`);
      const ageInYears = (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      setAge(ageInYears);
    }
  }, [birthDate, birthTime]);

  // Calculate total daily hours whenever activities change
  useEffect(() => {
    let total = activities.sleep + activities.eating + activities.miscellaneous;
    
    // Only add age-specific activities if the user is old enough
    if (age !== null) {
      if (age >= 5) {
        total += activities.learning + activities.sports + activities.travel;
      }
      if (age >= 3) {
        total += activities.screenTime;
      }
      if (age >= 18) {
        total += activities.work;
      }
    }
    
    setTotalDailyHours(total);
    setExceeds24Hours(total > 24);
  }, [activities, age]);

  const handleActivityChange = (activity: string, value: number) => {
    setActivities(prev => ({
      ...prev,
      [activity]: value
    }));
  };

  const calculateHours = () => {
    if (!birthDate || !age) return;
    if (exceeds24Hours) return; // Prevent calculation if hours exceed 24

    const today = new Date();
    const birth = new Date(`${birthDate}T${birthTime}`);
    const totalDays = (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24);
    
    // Calculate hours for activities that start from birth
    const sleepHours = activities.sleep * totalDays;
    const eatingHours = activities.eating * totalDays;
    const miscHours = activities.miscellaneous * totalDays;
    
    // Calculate age-specific activities
    const learningStartAge = 5;
    const workStartAge = 18;
    const screenTimeStartAge = 3;
    const sportsStartAge = 5;
    const travelStartAge = 5;
    
    let learningDays = 0;
    let workDays = 0;
    let screenTimeDays = 0;
    let sportsDays = 0;
    let travelDays = 0;
    
    if (age >= learningStartAge) {
      learningDays = Math.min(totalDays, (age - learningStartAge) * 365.25);
    }
    
    if (age >= workStartAge) {
      workDays = Math.min(totalDays, (age - workStartAge) * 365.25);
    }
    
    if (age >= screenTimeStartAge) {
      screenTimeDays = Math.min(totalDays, (age - screenTimeStartAge) * 365.25);
    }
    
    if (age >= sportsStartAge) {
      sportsDays = Math.min(totalDays, (age - sportsStartAge) * 365.25);
    }
    
    if (age >= travelStartAge) {
      travelDays = Math.min(totalDays, (age - travelStartAge) * 365.25);
    }
    
    const learningHours = activities.learning * learningDays;
    const workHours = activities.work * workDays;
    const screenTimeHours = activities.screenTime * screenTimeDays;
    const sportsHours = activities.sports * sportsDays;
    const travelHours = activities.travel * travelDays;
    
    setResults({
      sleep: sleepHours,
      eating: eatingHours,
      miscellaneous: miscHours,
      learning: learningHours,
      sports: sportsHours,
      screenTime: screenTimeHours,
      work: workHours,
      travel: travelHours,
    });
    
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-indigo-800 mb-2">Life Activity Calculator</h1>
          <p className="text-gray-600">Discover how you've spent your time throughout your life</p>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-6 flex items-center">
            <Calendar className="mr-2" size={24} /> When were you born?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                Birth Date
              </label>
              <input
                type="date"
                id="birthDate"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="birthTime" className="block text-sm font-medium text-gray-700 mb-1">
                Birth Time (approximate)
              </label>
              <input
                type="time"
                id="birthTime"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {age !== null && (
            <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
              <p className="text-indigo-700">
                You are approximately <span className="font-bold">{age.toFixed(2)}</span> years old
              </p>
            </div>
          )}
        </div>

        {age !== null && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-2 flex items-center">
              <Clock className="mr-2" size={24} /> Daily Activities
            </h2>
            
            <div className={`flex items-center justify-between mb-6 p-3 rounded-lg ${
              exceeds24Hours ? 'bg-red-50 text-red-700' : 'bg-indigo-50 text-indigo-700'
            }`}>
              <div className="flex items-center">
                {exceeds24Hours && <AlertCircle className="mr-2" size={20} />}
                <p>
                  Total daily hours: <span className="font-bold">{totalDailyHours.toFixed(1)}</span> / 24
                </p>
              </div>
              <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    exceeds24Hours ? 'bg-red-600' : totalDailyHours > 20 ? 'bg-amber-500' : 'bg-green-600'
                  }`}
                  style={{ width: `${Math.min(totalDailyHours / 24 * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            {exceeds24Hours && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 flex items-center">
                  <AlertCircle className="mr-2" size={18} />
                  Your total daily activities exceed 24 hours. Please adjust your activities to continue.
                </p>
              </div>
            )}
            
            <p className="text-gray-600 mb-6">
              Enter the average hours per day you spend on each activity
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ActivityInput 
                icon={<Moon size={20} />}
                label="Sleep"
                value={activities.sleep}
                onChange={(value) => handleActivityChange('sleep', value)}
                min={4}
                max={12}
              />
              
              <ActivityInput 
                icon={<Coffee size={20} />}
                label="Eating"
                value={activities.eating}
                onChange={(value) => handleActivityChange('eating', value)}
                min={0.5}
                max={4}
                step={0.5}
              />
              
              <ActivityInput 
                icon={<MoreHorizontal size={20} />}
                label="Miscellaneous Activities"
                value={activities.miscellaneous}
                onChange={(value) => handleActivityChange('miscellaneous', value)}
                min={0.5}
                max={6}
                step={0.5}
              />

              <AgeBasedActivities 
                age={age}
                activities={activities}
                onActivityChange={handleActivityChange}
              />
            </div>

            <div className="mt-8">
              <button
                onClick={calculateHours}
                disabled={exceeds24Hours}
                className={`w-full py-3 px-6 rounded-lg font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-300 ${
                  exceeds24Hours 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                }`}
              >
                Calculate My Life Hours
              </button>
            </div>
          </div>
        )}

        {showResults && results && (
          <ResultsDisplay results={results} age={age || 0} />
        )}
      </div>
    </div>
  );
}

export default App;