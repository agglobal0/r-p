import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authService';

function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      setMessage('Password reset successful. You can now login.');
      navigate('/login');
    } catch (err) {
      setMessage('Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="p-6 border border-slate-800 rounded-2xl bg-slate-900/40 w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4 text-center">Reset Password</h2>
        {message && <p className="text-center mb-4">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="otp">OTP</label>
            <input id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="newPassword">New Password</label>
            <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3" required />
          </div>
          <button type="submit" className="w-full px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
