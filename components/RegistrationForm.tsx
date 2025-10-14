import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { AREAS_OF_INTEREST } from '../constants';

// --- Helper Icons ---
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const IdCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h4a2 2 0 012 2v1m-4 0h4" /></svg>;
const ExpertiseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;

// --- Form State & Validation ---
interface FormErrors {
  fullName?: string;
  phoneNumber?: string;
  collegeRoll?: string;
  areasOfInterest?: string;
  expertise?: string;
  submit?: string;
}

const RegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    collegeRoll: '',
    expertise: '',
  });
  const [areasOfInterest, setAreasOfInterest] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required.';
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone Number is required.';
    } else if (formData.phoneNumber.length !== 11) {
      newErrors.phoneNumber = 'Phone number must be 11 digits.';
    }
    if (!formData.collegeRoll) newErrors.collegeRoll = 'College Roll is required.';
    if (!formData.expertise.trim()) newErrors.expertise = 'Expertise is required.';
    if (areasOfInterest.length === 0) newErrors.areasOfInterest = 'Please select at least one area of interest.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    let processedValue = value;

    if (id === 'phoneNumber' || id === 'collegeRoll') {
      processedValue = value.replace(/\D/g, ''); // Allow only digits
    }

    setFormData(prev => ({ ...prev, [id]: processedValue }));
    if (errors[id as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [id]: undefined }));
    }
  };

  const handleAreaOfInterestChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    let updatedAreas: string[];
    if (checked) {
      updatedAreas = [...areasOfInterest, value];
    } else {
      updatedAreas = areasOfInterest.filter(area => area !== value);
    }
    setAreasOfInterest(updatedAreas);
    if (updatedAreas.length > 0 && errors.areasOfInterest) {
      setErrors(prev => ({...prev, areasOfInterest: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(prev => ({ ...prev, submit: undefined }));

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await db.collection('volunteers').add({
        ...formData,
        areasOfInterest,
        submittedAt: new Date(),
      });
      navigate('/success');
    } catch (err) {
      setErrors({ submit: 'Failed to submit form. Please try again.' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg shadow-slate-200">
      <div className="bg-slate-800 rounded-lg p-4 mb-8">
        <img 
          src="https://res.cloudinary.com/dabfeqgsj/image/upload/v1760472658/3RD-NATIONAL-CULTURAL-FIESTA_jbxrel.png" 
          alt="3rd DCCC National Cultural Fiesta Logo" 
          className="mx-auto h-20 sm:h-24 w-auto"
        />
      </div>
      <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Volunteer Registration Form</h2>
      <p className="text-center text-slate-500 mb-8">Fill out the form below to join our team.</p>
      
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3"><UserIcon /></span>
              <input type="text" id="fullName" value={formData.fullName} onChange={handleInputChange} className={`pl-10 mt-1 block w-full px-3 py-2.5 bg-white border ${errors.fullName ? 'border-red-500' : 'border-slate-300'} rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition`} required />
            </div>
            {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
          </div>

          {/* Phone & Roll */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><PhoneIcon /></span>
                <input type="tel" id="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} maxLength={11} className={`pl-10 mt-1 block w-full px-3 py-2.5 bg-white border ${errors.phoneNumber ? 'border-red-500' : 'border-slate-300'} rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition`} required />
              </div>
              {errors.phoneNumber && <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>}
            </div>
            <div>
              <label htmlFor="collegeRoll" className="block text-sm font-medium text-slate-700 mb-1">College Roll</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><IdCardIcon /></span>
                <input type="text" id="collegeRoll" value={formData.collegeRoll} onChange={handleInputChange} className={`pl-10 mt-1 block w-full px-3 py-2.5 bg-white border ${errors.collegeRoll ? 'border-red-500' : 'border-slate-300'} rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition`} required />
              </div>
              {errors.collegeRoll && <p className="mt-1 text-xs text-red-600">{errors.collegeRoll}</p>}
            </div>
          </div>

          {/* Areas of Interest */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Areas of Interest</label>
            <div className={`mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg border ${errors.areasOfInterest ? 'border-red-500' : 'border-slate-200'}`}>
              {AREAS_OF_INTEREST.map(area => (
                <label key={area} className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer transition-all duration-200 ${areasOfInterest.includes(area) ? 'bg-blue-100 border-blue-300 ring-1 ring-blue-300' : 'bg-slate-50 hover:bg-slate-100 border-transparent'}`}>
                  <input type="checkbox" value={area} checked={areasOfInterest.includes(area)} onChange={handleAreaOfInterestChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded" />
                  <span className="text-sm font-medium text-slate-700">{area}</span>
                </label>
              ))}
            </div>
            {errors.areasOfInterest && <p className="mt-1 text-xs text-red-600">{errors.areasOfInterest}</p>}
          </div>

          {/* Expertise */}
          <div>
            <label htmlFor="expertise" className="block text-sm font-medium text-slate-700 mb-1">
              Expertise <span className="text-slate-500">(e.g., specific software, event management)</span>
            </label>
            <div className="relative">
              <span className="absolute top-3 left-0 flex items-center pl-3"><ExpertiseIcon /></span>
              <textarea id="expertise" rows={4} value={formData.expertise} onChange={handleInputChange} className={`pl-10 mt-1 block w-full px-3 py-2.5 bg-white border ${errors.expertise ? 'border-red-500' : 'border-slate-300'} rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition`} required />
            </div>
            {errors.expertise && <p className="mt-1 text-xs text-red-600">{errors.expertise}</p>}
          </div>
        </div>

        {errors.submit && <p className="mt-4 text-center text-sm text-red-600">{errors.submit}</p>}

        <div className="mt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Registration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;