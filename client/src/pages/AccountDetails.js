import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateAccount } from '../features/auth/authSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const AccountDetails = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editPassword, setEditPassword] = useState(false);
  const [editInformationDetails, setEditInformationDetails] = useState(true);

  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setUsername(user.username || '');
    }
  }, [user]);

  const toggleEditMode = (mode) => {
    setEditPassword(mode === 'password');
    setEditInformationDetails(mode === 'info');
  };

  const handleUpdateAccountInformation = () => {
    if (!email && !username) {
      toast.warn('Please provide a valid email or username to update.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    dispatch(
      updateAccount({
        id: user?.id,
        userData: {
          email: email || user?.email,
          username: username || user?.username,
        },
      })
    )
      .unwrap()
      .then(() => {
        toast.success('Account updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to update account.', {
          position: 'top-right',
          autoClose: 3000,
        });
      });
  };

  const handleUpdatePassword = () => {
    if (!password || !confirmPassword) {
      toast.warn('Please fill in all password fields.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.warn('Passwords do not match.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    dispatch(
      updateAccount({
        id: user?.id,
        userData: {
          password : password,
        },
      })
    )
      .unwrap()
      .then(() => {
        toast.success('Password updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        setPassword('');
        setConfirmPassword('');
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to update password.', {
          position: 'top-right',
          autoClose: 3000,
        });
      });
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">
        Hello {user?.username}, you can update your private information here!
      </h2>
      <div className="d-flex justify-content-center">
        <button
          className={`btn m-2 ${editInformationDetails ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => toggleEditMode('info')}
        >
          Edit Information
        </button>
        <button
          className={`btn m-2 ${editPassword ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => toggleEditMode('password')}
        >
          Reset Password
        </button>
      </div>

      {editInformationDetails && (
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button
              className="btn btn-primary btn-block mt-3"
              onClick={handleUpdateAccountInformation}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      )}

      {editPassword && (
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button
              className="btn btn-primary btn-block mt-3"
              onClick={handleUpdatePassword}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default AccountDetails;
