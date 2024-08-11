import React, { useState } from 'react';
import axios from 'axios';

const AddNewLine = () => {
  const [newLine, setNewLine] = useState({
    DATETRANSACTION: '',
    NumClient: '',
    SensTransaction: '',
    NumeroValeur: '',
    QuantiteNegociee: '',
    CoursTransaction: '',
    Montant: '',
    NAT: '',
    GESTION: '',
    COMMERC: '',
    SOLDE: '',
    Depose: '',
    TUNSFAX: '',
  });

  const [wichfile , setWichFile] = useState(null);

  console.log(wichfile)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLine((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleAddLine = async () => {
    try {
      const fileName = wichfile === '1' ? 't1.csv' : 't2.csv'; 
      const response = await axios.post('http://127.0.0.1:5000/addLineToCsv', {
        fileName,
        newLine,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      alert(response.data.message);
      console.log(fileName, newLine);
    } catch (err) {
      console.error('Failed to add line:', err);
      alert('Failed to add line to CSV.');
    }
  };
  
  

  return (
    <div className="container mt-5">


      <div className="mt-4">
        <h4>Enter New Line Details</h4>
        <h1>choose file</h1>
        Add in data 1570<input type='radio' name='data' value="1" onChange={(e)=> setWichFile(e.target.value)}/>  <br/>
        Add in data 474<input type='radio' name='data' value="2" onChange = {(e)=>setWichFile(e.target.value)}/>
        {Object.keys(newLine).map((field) => (
          <div key={field} className="form-group">
            <label htmlFor={field}>{field}</label>
            <input
              type="text"
              className="form-control"
              id={field}
              name={field}
              value={newLine[field]}
              onChange={handleInputChange}
            />
          </div>
        ))}
      </div>

      <button className="btn btn-primary mt-3" onClick={handleAddLine}>
        Add Line to CSV
      </button>
    </div>
  );
};

export default AddNewLine;
