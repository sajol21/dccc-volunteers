import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { Volunteer } from '../types';
import { useAuth } from '../hooks/useAuth';
import { AREAS_OF_INTEREST } from '../constants';

const ConfirmationModal: React.FC<{ onConfirm: () => void; onCancel: () => void; }> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-bold text-slate-800">Confirm Export</h3>
        <p className="mt-2 text-sm text-slate-600">Are you sure you want to export all volunteer data as a CSV file?</p>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 text-sm font-medium">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium">
            Confirm Export
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationModal: React.FC<{ volunteerName: string; onConfirm: () => void; onCancel: () => void; }> = ({ volunteerName, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <div className="ml-4 text-left">
                <h3 className="text-lg font-bold text-slate-800">Confirm Deletion</h3>
            </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Are you sure you want to delete the entry for <span className="font-semibold">{volunteerName}</span>? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 text-sm font-medium">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium">
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};


const LinkManager: React.FC = () => {
  const [groupLink, setGroupLink] = useState('');
  const [helpLink, setHelpLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setError('');
        const docRef = db.collection('config').doc('successLinks');
        const doc = await docRef.get();
        if (doc.exists) {
          const data = doc.data();
          if (data) {
            setGroupLink(data.groupLink || '');
            setHelpLink(data.helpLink || '');
          }
        } else {
          // Guide the admin to set up the links for the first time.
          setMessage('No links configured yet. Add URLs below and click save to set them up.');
          setTimeout(() => setMessage(''), 5000); // Clear message after 5 seconds
        }
      } catch (err) {
        setError('Failed to load link data from the database.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const docRef = db.collection('config').doc('successLinks');
      await docRef.set({ groupLink, helpLink }, { merge: true });
      setMessage('Links updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to update links.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-4">Loading link manager...</div>;

  return (
    <div className="mt-12 p-6 bg-white shadow-lg rounded-lg border border-slate-200">
      <h3 className="text-2xl font-bold text-slate-800 mb-4">Manage Success Page Links</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="groupLink" className="block text-sm font-medium text-slate-700">"Join Messenger Group" Link URL</label>
          <input
            type="url"
            id="groupLink"
            value={groupLink}
            onChange={(e) => setGroupLink(e.target.value)}
            placeholder="https://m.me/j/..."
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="helpLink" className="block text-sm font-medium text-slate-700">"WhatsApp Help" Link URL</label>
          <input
            type="url"
            id="helpLink"
            value={helpLink}
            onChange={(e) => setHelpLink(e.target.value)}
            placeholder="https://wa.me/..."
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-700 disabled:bg-slate-400"
          >
            {saving ? 'Saving...' : 'Save Links'}
          </button>
        </div>
        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};

const AnalyticsOverview: React.FC<{ volunteers: Volunteer[] }> = ({ volunteers }) => {
  const totalRegistrations = volunteers.length;

  const interestCounts: { [key: string]: number } = {};
  volunteers.forEach((volunteer) => {
    (volunteer.areasOfInterest || []).forEach((interest) => {
      interestCounts[interest] = (interestCounts[interest] || 0) + 1;
    });
  });
  
  const maxCount = Math.max(...Object.values(interestCounts), 1);
  
  const COLORS = [
    'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
    'bg-blue-500', 'bg-sky-500', 'bg-teal-500'
  ];

  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex flex-col justify-center items-center">
        <h3 className="text-lg font-semibold text-slate-500">Total Registrations</h3>
        <p className="text-5xl font-bold text-slate-800 mt-2">{totalRegistrations}</p>
      </div>

      <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Interest Distribution</h3>
        <div className="space-y-3">
          {AREAS_OF_INTEREST.map((interest, index) => {
            const count = interestCounts[interest] || 0;
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return (
              <div key={interest} className="w-full">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-600">{interest}</span>
                  <span className="text-sm font-bold text-slate-500">{count}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div 
                    className={`${COLORS[index % COLORS.length]} h-2.5 rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


const AdminDashboard: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [volunteerToDelete, setVolunteerToDelete] = useState<Volunteer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Volunteer; direction: 'ascending' | 'descending' } | null>({ key: 'submittedAt', direction: 'descending' });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const snapshot = await db.collection('volunteers').orderBy('submittedAt', 'desc').get();
        const volunteersData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            submittedAt: data.submittedAt.toDate(),
          } as Volunteer;
        });
        setVolunteers(volunteersData);
      } catch (err) {
        setError('Failed to fetch volunteer data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, []);

  const processedVolunteers = useMemo(() => {
    let filteredVolunteers = volunteers.filter(volunteer => {
        const query = searchQuery.toLowerCase();
        return (
            volunteer.fullName.toLowerCase().includes(query) ||
            volunteer.phoneNumber.includes(query) ||
            volunteer.collegeRoll.includes(query)
        );
    });

    if (sortConfig !== null) {
        filteredVolunteers.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            
            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }

    return filteredVolunteers;
  }, [volunteers, searchQuery, sortConfig]);

  const requestSort = (key: keyof Volunteer) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/admin');
    } catch (err) {
      console.error('Failed to log out', err);
    }
  };

  const handleDeleteVolunteer = async () => {
    if (!volunteerToDelete) return;

    try {
      await db.collection('volunteers').doc(volunteerToDelete.id).delete();
      setVolunteers(prevVolunteers => prevVolunteers.filter(v => v.id !== volunteerToDelete.id));
    } catch (err) {
      setError('Failed to delete volunteer entry. Please try again.');
      console.error('Delete error:', err);
    } finally {
      setVolunteerToDelete(null); // Close the modal
    }
  };
  
  const exportToCSV = () => {
    const headers = ["Full Name", "Phone Number", "College Roll", "Batch", "Areas of Interest", "Expertise", "Submitted At"];
    const rows = volunteers.map(v => [
        `"${v.fullName}"`,
        `"${v.phoneNumber}"`,
        `"${v.collegeRoll}"`,
        `"${v.batch || "HSC'27"}"`,
        `"${(v.areasOfInterest || []).join(', ')}"`,
        `"${(v.expertise || '').replace(/"/g, '""')}"`,
        `"${v.submittedAt.toLocaleString()}"`
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "dccc_volunteers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleConfirmExport = () => {
    exportToCSV();
    setShowExportConfirm(false);
  };
  
  const getSortIndicator = (columnKey: keyof Volunteer) => {
    if (sortConfig?.key !== columnKey) return null;
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  return (
    <div className="container mx-auto">
      {showExportConfirm && <ConfirmationModal onConfirm={handleConfirmExport} onCancel={() => setShowExportConfirm(false)} />}
      {volunteerToDelete && (
        <DeleteConfirmationModal
          volunteerName={volunteerToDelete.fullName}
          onConfirm={handleDeleteVolunteer}
          onCancel={() => setVolunteerToDelete(null)}
        />
      )}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-slate-800">Admin Dashboard</h2>
        <div className="flex items-center gap-2">
           <button
             onClick={() => setShowExportConfirm(true)}
             disabled={volunteers.length === 0}
             className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-400"
           >
             Export CSV
           </button>
           <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600"
           >
            Logout
           </button>
        </div>
      </div>

      {!loading && <AnalyticsOverview volunteers={volunteers} />}

       <div className="my-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, phone, or roll..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full max-w-md pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>


      {loading && <p className="text-center text-slate-600">Loading volunteers...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}
      
      {!loading && !error && (
        <div className="bg-white shadow-2xl shadow-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      <button onClick={() => requestSort('fullName')} className="flex items-center gap-2 group">
                        <span>Full Name</span>
                        <span className={`text-slate-400 group-hover:text-slate-600 ${sortConfig?.key === 'fullName' ? 'text-slate-800' : ''}`}>{getSortIndicator('fullName')}</span>
                      </button>
                    </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Phone Number</th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      <button onClick={() => requestSort('collegeRoll')} className="flex items-center gap-2 group">
                          <span>College Roll</span>
                          <span className={`text-slate-400 group-hover:text-slate-600 ${sortConfig?.key === 'collegeRoll' ? 'text-slate-800' : ''}`}>{getSortIndicator('collegeRoll')}</span>
                      </button>
                    </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Batch</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Areas of Interest</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Expertise</th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      <button onClick={() => requestSort('submittedAt')} className="flex items-center gap-2 group">
                          <span>Submitted At</span>
                          <span className={`text-slate-400 group-hover:text-slate-600 ${sortConfig?.key === 'submittedAt' ? 'text-slate-800' : ''}`}>{getSortIndicator('submittedAt')}</span>
                      </button>
                    </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {volunteers.length > 0 ? (
                  processedVolunteers.length > 0 ? (
                    processedVolunteers.map(volunteer => (
                      <tr key={volunteer.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{volunteer.fullName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{volunteer.phoneNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{volunteer.collegeRoll}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{volunteer.batch}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{volunteer.areasOfInterest?.join(', ') || ''}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={volunteer.expertise}>{volunteer.expertise}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{volunteer.submittedAt.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button
                            onClick={() => setVolunteerToDelete(volunteer)}
                            className="text-slate-500 hover:text-red-600 p-2 rounded-full transition-colors duration-200"
                            aria-label={`Delete entry for ${volunteer.fullName}`}
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-sm text-slate-500">No volunteers found for your search.</td>
                    </tr>
                  )
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-slate-500">No volunteers have registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {user && <LinkManager />}
    </div>
  );
};

export default AdminDashboard;
