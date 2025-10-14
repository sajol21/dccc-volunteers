import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 text-center">
        <img 
          src="https://res.cloudinary.com/dabfeqgsj/image/upload/v1759778648/cyizstrjgcq0w9fr8cxp.png"
          alt="DCCC Club Logo"
          className="mx-auto h-14 w-auto mb-3"
        />
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          DCCC Volunteer Registration
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl mx-auto">
          Join the team that turns ideas into unforgettable moments. Volunteer for the 3rd DCCC National Cultural Fiesta 2025.
        </p>
      </div>
    </header>
  );
};

export default Header;