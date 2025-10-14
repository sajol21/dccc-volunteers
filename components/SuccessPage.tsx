import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';

const SuccessPage: React.FC = () => {
  const [links, setLinks] = useState<{ groupLink: string, helpLink: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const docRef = db.collection('config').doc('successLinks');
        const doc = await docRef.get();
        if (doc.exists) {
          setLinks(doc.data() as { groupLink: string, helpLink: string });
        } else {
          console.warn("Success links config document not found!");
        }
      } catch (error) {
        console.error("Error fetching success links:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  return (
    <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-lg">
      <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h2 className="mt-4 text-2xl font-bold text-slate-800">Registration Successful!</h2>
      <p className="mt-2 text-slate-600">
        Welcome to the DCCC Volunteer Team.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-4 sm:space-y-0">
        {loading ? (
          <p className="text-slate-500">Loading links...</p>
        ) : (
          links ? (
            <>
              <a
                href={links.groupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900"
              >
                Join Group
              </a>
              <a
                href={links.helpLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-5 py-3 border border-slate-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
              >
                WhatsApp Help
              </a>
            </>
          ) : <p className="text-sm text-red-500">Links could not be loaded.</p>
        )}
      </div>
    </div>
  );
};

export default SuccessPage;