import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../features/auth/authSlice';
import { useParams } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('') ;
  const dispatch = useDispatch();
  const { token } = useParams();
  const { isLoading, isSuccess, message } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(resetPassword({ token, password }));
  };

  if (isSuccess) {
    window.location.href = '/login';
  }

  return (
   <div className="py-5" style={{ background: "#201E43", minHeight: "100vh" }}>
      <div className="row justify-content-center align-items-center" style={{ height: '100%' }}>
        <div className="col-md-6 col-lg-4">
          <div className="card p-4" style={{ borderRadius: '1rem' , color:"black"}}>
            <h2 className="text-center mb-4 title">Reset Password</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3 ">
                <label htmlFor="password" className="form-label text-black">New Password</label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="confirmPassword" className="form-label text-black">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={isLoading}  style={{ background: "#201E43" }} >
                {isLoading ? 'Loading...' : 'Reset Password'}
              </button>
              {message && <p className="mt-3 text-white">{message}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
