import CustomInput from "../components/CustomInput";
import { Link } from "react-router-dom";
import * as yup from "yup";
import { useFormik } from "formik";

const Signup = () => {
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      entreprise: "",
      description: "",
      address: "",
      phone: "",
      identificationCard:"",
      password: "",
      confirmPassword: "",
    },
    validationSchema: yup.object().shape({
      name: yup.string().required("Name is required"),
      email: yup.string().email("Email should be valid").required("Email is Required"),
      entreprise: yup.string().required("Entreprise is required"),
      description: yup.string().required("Description is required"),
      address: yup.string().required("Address is required"),
      phone: yup.string().required("Phone is required"),
      password: yup.string().required("Password is required"),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref("password"), null], "Passwords must match")
        .required("Confirm Password is required"),
    }),
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <div className="py-5" style={{ background: "#ffd333", minHeight: "100vh" }}>
      <br />
      <br />
      <br />
      <br />
      <br />
      <div className="my-5 w-50 bg-white rounded-3 mx-auto p-4">
        <h3 className="text-center title">Sign Up</h3>
        <p className="text-center">Create a new supplier account to continue.</p>
        <form action="" onSubmit={formik.handleSubmit}>
          <CustomInput
            type="text"
            label="Name"
            id="name"
            name="name"
            onChng={formik.handleChange}
            onBlr={formik.handleBlur}
            val={formik.values.name}
          />
          <div className="error mt-2">{formik.touched.name && formik.errors.name}</div>

          <CustomInput
            type="text"
            label="Email Address"
            id="email"
            name="email"
            onChng={formik.handleChange}
            onBlr={formik.handleBlur}
            val={formik.values.email}
          />
          <div className="error mt-2">{formik.touched.email && formik.errors.email}</div>

          <CustomInput
            type="text"
            label="Entreprise"
            id="entreprise"
            name="entreprise"
            onChng={formik.handleChange}
            onBlr={formik.handleBlur}
            val={formik.values.entreprise}
          />
          <div className="error mt-2">
            {formik.touched.entreprise && formik.errors.entreprise}
          </div>

          <CustomInput
            type="text"
            label="Description"
            id="description"
            name="description"
            onChng={formik.handleChange}
            onBlr={formik.handleBlur}
            val={formik.values.description}
          />
          <div className="error mt-2">
            {formik.touched.description && formik.errors.description}
          </div>

          <CustomInput
            type="text"
            label="Address"
            id="address"
            name="address"
            onChng={formik.handleChange}
            onBlr={formik.handleBlur}
            val={formik.values.address}
          />
          <div className="error mt-2">{formik.touched.address && formik.errors.address}</div>
          <CustomInput
            type="text"
            label="Phone Number"
            id="phone"
            name="phone"
            onChng={formik.handleChange}
            onBlr={formik.handleBlur}
            val={formik.values.phone}
          />
          <div className="error mt-2">{formik.touched.phone && formik.errors.phone}</div>
          <CustomInput
  type="file"
  label="Identification Card"
  id="identificationCard"
  name="identificationCard"
  onChng={formik.handleChange}
  onBlr={formik.handleBlur}
  IdentificationCard={formik.values.identificationCard ? formik.values.identificationCard.name : null}
/>
<div className="error mt-2">{formik.touched.identificationCard && formik.errors.identificationCard}</div>
<CustomInput
  type="file"
  label="Your Face Image "
  id="identificationCard"
  name="identificationCard"
  onChng={formik.handleChange}
  onBlr={formik.handleBlur}
  IdentificationCard={formik.values.identificationCard ? formik.values.identificationCard.name : null}
/>
<div className="error mt-2">{formik.touched.identificationCard && formik.errors.identificationCard}</div>

          <CustomInput
            type="password"
            label="Password"
            id="password"
            name="password"
            onChng={formik.handleChange}
            onBlr={formik.handleBlur}
            val={formik.values.password}
          />
          <div className="error mt-2">{formik.touched.password && formik.errors.password}</div>

          <CustomInput
            type="password"
            label="Confirm Password"
            id="confirmPassword"
            name="confirmPassword"
            onChng={formik.handleChange}
            onBlr={formik.handleBlur}
            val={formik.values.confirmPassword}
          />
          <div className="error mt-2">
            {formik.touched.confirmPassword && formik.errors.confirmPassword}
          </div>

          <div className="text-center">
            <button className="btn btn-primary mt-3" type="submit">
              Create Account
            </button>
          </div>
        </form>
        <p className="text-center mt-3">
          Already have an account?{" "}
          <Link to="/login" className="link-primary">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};
export default Signup;

