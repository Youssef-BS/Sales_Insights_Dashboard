import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { verifyEmail, resetState } from '../features/auth/authSlice';
import { Spinner } from 'react-bootstrap';

const VerifEmail = () => {
  const { token } = useParams();
  const dispatch = useDispatch();

  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(verifyEmail(token));
    return () => {
      dispatch(resetState());
    };
  }, [dispatch, token]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="card-body text-center">
          <h2 className="mb-4">Email Verification</h2>
          {isLoading && (
            <div className="d-flex justify-content-center">
              <Spinner animation="border" variant="primary" />
            </div>
          )}
          {isSuccess && <p className="text-success fw-bold">{message}</p>}
          {isError && <p className="text-danger fw-bold">Verification failed: {message}</p>}
        </div>
      </div>
    </div>
  );
};

export default VerifEmail;
