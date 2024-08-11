import React from "react";

const CustomInput = ({ type, label, id, name, onChng, onBlr, val, IdentificationCard }) => {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      {type === "textarea" ? (
        <textarea
          className="form-control"
          id={id}
          name={name}
          onChange={onChng}
          onBlur={onBlr}
          value={val}
        ></textarea>
      ) : type === "file" ? (
        <div className="custom-file">
          <input
            type="file"
            className="custom-file-input"
            id={id}
            name={name}
            onChange={onChng}
            onBlur={onBlr}
            accept="image/*"
          />
          <label className="custom-file-label" htmlFor={id}>
            {IdentificationCard ? IdentificationCard : "Choose file"}
          </label>
        </div>
      ) : (
        <input
          type={type}
          className="form-control"
          id={id}
          name={name}
          onChange={onChng}
          onBlur={onBlr}
          value={val}
        />
      )}
    </div>
  );
};

export default CustomInput;
