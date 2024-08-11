import React, { useEffect } from "react";
import CustomInput from "../components/CustomInput";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/auth/authSlice";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Email should be valid")
    .required("Email is Required"),
  password: yup.string().required("Password is Required"),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: schema,
    onSubmit: (values) => {
      dispatch(login(values));
    },
  });

  const { user, isError, isSuccess, isLoading, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess && user) {
      navigate("/admin"); 
    }
  }, [isSuccess, user, navigate]);

  return (
    <div className="py-5" style={{ background: "#201E43", minHeight: "100vh" }}>
      <div className="my-5 w-25 bg-white rounded-3 mx-auto p-4">
        <h3 className="text-center title">Login</h3>
        {isError && (
          <div className="error text-center">
            {message || "Login failed. Please check your credentials and try again."}
          </div>
        )}
        <form onSubmit={formik.handleSubmit}>
          <CustomInput
            type="text"
            label="Email Address"
            id="email"
            name="email"
            onChng={formik.handleChange}
            onBlr={formik.handleBlur}
            val={formik.values.email}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="error mt-2">{formik.errors.email}</div>
          )}
          <CustomInput
            type="password"
            label="Password"
            id="pass"
            name="password"
            onChng={formik.handleChange}
            onBlr={formik.handleBlur}
            val={formik.values.password}
          />
          {formik.touched.password && formik.errors.password && (
            <div className="error mt-2">{formik.errors.password}</div>
          )}
          <div className="mb-3 text-end">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
          <button
            className="border-0 px-3 py-2 text-white fw-bold w-100 text-center text-decoration-none fs-5"
            style={{ background: "#201E43" }}
            type="submit"
            disabled={isLoading} // Disable the button while loading
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          <div className="mt-3 text-center">
            <Link to="/signup">Don't have an account? Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
