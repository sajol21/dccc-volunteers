import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { Volunteer } from '../types';
import { useAuth } from '../hooks/useAuth';

const ADMIN_UID = 'fwaqQNGaclTa0sW7eAiSyNpgs9R2';

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
          <label htmlFor="groupLink" className="block text-sm font-medium text-slate-700">"Join Group" Link URL</label>
          <input
            type="url"
            id="groupLink"
            value={groupLink}
            onChange={(e) => setGroupLink(e.target.value)}
            placeholder="https://chat.whatsapp.com/..."
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


const AdminDashboard: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExportConfirm, setShowExportConfirm] = useState(false);
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

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/admin');
    } catch (err) {
      console.error('Failed to log out', err);
    }
  };
  
  const exportToCSV = () => {
    const headers = ["Full Name", "Phone Number", "College Roll", "Areas of Interest", "Expertise", "Submitted At"];
    const rows = volunteers.map(v => [
        `"${v.fullName}"`,
        `"${v.phoneNumber}"`,
        `"${v.collegeRoll}"`,
        `"${v.areasOfInterest.join(', ')}"`,
        `"${v.expertise.replace(/"/g, '""')}"`,
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

  return (
    <div className="container mx-auto">
      {showExportConfirm && <ConfirmationModal onConfirm={handleConfirmExport} onCancel={() => setShowExportConfirm(false)} />}
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

      {loading && <p className="text-center text-slate-600">Loading volunteers...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}
      
      {!loading && !error && (
        <div className="bg-white shadow-2xl shadow-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Full Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Phone Number</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">College Roll</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Areas of Interest</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Expertise</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Submitted At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {volunteers.length > 0 ? (
                  volunteers.map(volunteer => (
                    <tr key={volunteer.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{volunteer.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{volunteer.phoneNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{volunteer.collegeRoll}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{volunteer.areasOfInterest.join(', ')}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={volunteer.expertise}>{volunteer.expertise}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{volunteer.submittedAt.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-500">No volunteers have registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {user && user.uid === ADMIN_UID && <LinkManager />}
    </div>
  );
};

export default AdminDashboard;