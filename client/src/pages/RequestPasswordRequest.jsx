import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { requestPasswordReset } from '../features/auth/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import CustomInput from '../components/CustomInput';

const schema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address.')
    .required('Email is required.'),
});

const RequestPasswordReset = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isSuccess, message } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: schema,
    onSubmit: (values) => {
      dispatch(requestPasswordReset(values.email));
    },
  });



  return (
    <div className="py-5" style={{ background: '#201E43', minHeight: '100vh' }}>
      <div className="my-5 w-25 bg-white rounded-3 mx-auto p-4">
        <h3 className="text-center title">Request Password Reset</h3>
        {message && (
          <div className={`error text-center ${isSuccess ? 'text-success' : 'text-danger'}`}>
            {message}
          </div>
        )}
        <form onSubmit={formik.handleSubmit}>
          <CustomInput
            type="email"
            label="Email Address"
            id="email"
            name="email"
            onChng={formik.handleChange}
            onBlr={formik.handleBlur}
            val={formik.values.email}
            error={formik.touched.email && formik.errors.email}
          />
          <button
            className="border-0 px-3 py-2 text-white fw-bold w-100 text-center text-decoration-none fs-5"
            style={{ background: '#201E43' }}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              'Request Reset Link'
            )}
          </button>
          <div className="mt-3 text-center">
            <Link to="/login">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestPasswordReset;
