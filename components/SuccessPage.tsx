import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { db } from '../services/firebase';

const SuccessPage: React.FC = () => {
  const [links, setLinks] = useState<{ groupLink: string; helpLink: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const name = location.state?.name;

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const docRef = db.collection('config').doc('successLinks');
        const doc = await docRef.get();
        if (doc.exists) {
          const data = doc.data();
          if (data) {
            setLinks({
              groupLink: data.groupLink || '',
              helpLink: data.helpLink || ''
            });
          } else {
             setError('Could not find link configuration. Please contact an admin.');
          }
        } else {
          setError('Link configuration not found. Please contact an admin.');
        }
      } catch (err) {
        setError('Failed to load important links. Please contact an admin for next steps.');
        console.error('Failed to fetch success page links:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-2xl shadow-slate-200/50 text-center">
      <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
        <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="mt-6 text-3xl font-bold text-slate-800">Congratulations, {name || 'Volunteer'}!</h2>
      <p className="mt-2 text-md text-slate-600">
        Your application to volunteer for the DCCC National Cultural Fiesta 2025 has been received. Welcome to the team!
      </p>

      <div className="mt-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-700">Your Next Step</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          Join our official Messenger group to get all important updates, connect with the team, and start your journey.
        </p>
        
        {loading && <div className="mt-4 h-20 flex items-center justify-center"><p className="text-slate-500">Loading community links...</p></div>}
        {error && <div className="mt-4 h-20 flex items-center justify-center"><p className="text-red-600">{error}</p></div>}
        
        {!loading && !error && links && (
          <div className="mt-6 flex flex-col items-center gap-4">
            {links.groupLink ? (
                <a
                href={links.groupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
              >
                 <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.64-.1 2.42-.29.13-.03.27-.05.4-.08.4-.1.79-.24 1.17-.42.02-.01.05-.02.07-.03.4-.19.78-.42 1.13-.69.09-.07.18-.14.27-.22.34-.3.67-.64.97-1.01.05-.06.1-.13.15-.19.28-.36.54-.75.77-1.16.03-.05.05-.1.08-.15.21-.4.4-.82.55-1.26.02-.06.04-.12.05-.18.15-.45.27-.92.36-1.4.02-.09.03-.18.04-.28.08-.47.13-.95.16-1.44.01-.11.01-.22.02-.33.03-.5.05-1 .05-1.51 0-5.52-4.48-10-10-10zm-3.5 11.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
                Join Messenger Group
              </a>
            ) : <p className="text-sm text-slate-500">Messenger group link is not available yet.</p>}
            <img 
                src="https://res.cloudinary.com/dabfeqgsj/image/upload/v1760474595/messenger_qr_temp8510099548851130615_cvyoxc.png"
                alt="Messenger Group QR Code"
                className="mt-2 w-36 h-36 rounded-lg shadow-md border"
            />
            
            <div className="text-center mt-4">
              <p className="text-sm text-slate-600">
                If the Messenger link doesn't work, feel free to contact support.
              </p>
              {links.helpLink ? (
                <a
                  href={links.helpLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full sm:w-auto inline-flex justify-center items-center px-6 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Contact Support on WhatsApp
                </a>
              ) : <p className="text-xs text-slate-400 mt-2">Support contact not available.</p>}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          &larr; Back to Registration Form
        </Link>
      </div>
    </div>
  );
};

export default SuccessPage;