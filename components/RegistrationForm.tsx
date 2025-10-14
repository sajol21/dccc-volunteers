import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { AREAS_OF_INTEREST } from '../constants';

const RegistrationForm: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [collegeRoll, setCollegeRoll] = useState('');
  const [areasOfInterest, setAreasOfInterest] = useState<string[]>([]);
  const [expertise, setExpertise] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAreaOfInterestToggle = (area: string) => {
    const newAreas = areasOfInterest.includes(area)
      ? areasOfInterest.filter(a => a !== area)
      : [...areasOfInterest, area];
    setAreasOfInterest(newAreas);

    if (newAreas.length > 0) {
      setErrors(prev => ({ ...prev, areasOfInterest: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }

    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 11-digit Bangladeshi phone number.';
    }

    const rollRegex = /^\d+$/;
    if (!rollRegex.test(collegeRoll)) {
      newErrors.collegeRoll = 'Please enter a valid college roll number (digits only).';
    }

    if (areasOfInterest.length === 0) {
      newErrors.areasOfInterest = 'Please select at least one area of interest.';
    }

    if (!expertise.trim()) {
      newErrors.expertise = 'Please describe what you can offer.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      await db.collection('volunteers').add({
        fullName,
        phoneNumber,
        collegeRoll,
        areasOfInterest,
        expertise,
        submittedAt: new Date(),
      });
      navigate('/success', { state: { name: fullName.split(' ')[0] } });
    } catch (err) {
      setErrors({ form: 'Failed to submit registration. Please try again.' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl shadow-slate-200/50">
       <div className="bg-slate-800 p-4 rounded-lg mb-8">
         <img 
          src="https://res.cloudinary.com/dabfeqgsj/image/upload/v1760472658/3RD-NATIONAL-CULTURAL-FIESTA_jbxrel.png"
          alt="3rd National Cultural Fiesta Logo"
          className="mx-auto h-20 w-auto"
        />
       </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-semibold text-slate-600 mb-1">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`block w-full pl-12 pr-4 py-4 bg-white border rounded-lg text-base shadow-sm placeholder-slate-400 transition duration-300 ease-in-out focus:outline-none ${errors.fullName ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:shadow-md focus:shadow-indigo-500/10'}`}
              required
              placeholder="e.g., John Doe"
            />
          </div>
          {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-semibold text-slate-600 mb-1">Phone Number</label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            </div>
            <input
              type="text"
              inputMode="numeric"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, '');
                setPhoneNumber(numericValue.slice(0, 11));
              }}
              className={`block w-full pl-12 pr-4 py-4 bg-white border rounded-lg text-base shadow-sm placeholder-slate-400 transition duration-300 ease-in-out focus:outline-none ${errors.phoneNumber ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:shadow-md focus:shadow-indigo-500/10'}`}
              required
              placeholder="01712345678"
            />
          </div>
           {errors.phoneNumber && <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>}
        </div>

        <div>
          <label htmlFor="collegeRoll" className="block text-sm font-semibold text-slate-600 mb-1">College Roll Number</label>
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h4a2 2 0 012 2v1m-4 0h4" />
                </svg>
            </div>
            <input
              type="text"
              inputMode="numeric"
              id="collegeRoll"
              value={collegeRoll}
              onChange={(e) => setCollegeRoll(e.target.value.replace(/\D/g, ''))}
              className={`block w-full pl-12 pr-4 py-4 bg-white border rounded-lg text-base shadow-sm placeholder-slate-400 transition duration-300 ease-in-out focus:outline-none ${errors.collegeRoll ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:shadow-md focus:shadow-indigo-500/10'}`}
              required
              placeholder="e.g., 2021001 (please use full roll)"
            />
          </div>
           {errors.collegeRoll && <p className="mt-1 text-xs text-red-600">{errors.collegeRoll}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600">Areas of Interest</label>
          <p className="text-xs text-slate-500 mb-2">Select all that apply.</p>
          <div className="flex flex-wrap gap-3 p-2 border border-slate-200 rounded-lg">
            {AREAS_OF_INTEREST.map((area) => (
              <button
                type="button"
                key={area}
                onClick={() => handleAreaOfInterestToggle(area)}
                className={`px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 ease-in-out ${
                  areasOfInterest.includes(area)
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
           {errors.areasOfInterest && <p className="mt-1 text-xs text-red-600">{errors.areasOfInterest}</p>}
        </div>

        <div>
          <label htmlFor="expertise" className="block text-sm font-semibold text-slate-600 mb-1">
            Expertise / What You Can Offer
          </label>
          <textarea
            id="expertise"
            rows={4}
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
            className={`block w-full px-4 py-4 bg-white border rounded-lg text-base shadow-sm placeholder-slate-400 transition duration-300 ease-in-out focus:outline-none ${errors.expertise ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:shadow-md focus:shadow-indigo-500/10'}`}
            required
            placeholder="e.g., 'I have 2 years of experience in graphic design...' or 'I am a good public speaker...'"
          />
           {errors.expertise && <p className="mt-1 text-xs text-red-600">{errors.expertise}</p>}
        </div>

        {errors.form && <p className="text-center text-sm text-red-600">{errors.form}</p>}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-md shadow-lg text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            {loading ? 'Submitting...' : 'Register as Volunteer →'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;