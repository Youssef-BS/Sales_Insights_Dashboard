import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const PredicateAi = () => {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file before uploading.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setResult(response.data);
        } catch (err) {
            console.error('Error uploading file:', err);
            setError('Failed to upload the file. Please try again.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="card">
                <div className="card-body">
                    <h2 className="card-title">Upload Portfolio File</h2>
                    <div className="mb-3">
                        <input
                            type="file"
                            className="form-control"
                            onChange={handleFileChange}
                            accept=".csv"
                        />
                    </div>
                    <button className="btn btn-primary" onClick={handleUpload}>Upload</button>
                    
                    {error && <p className="text-danger mt-3">{error}</p>}

                    {result && (
                        <div className="mt-4">
                            <h3>Risk Assessment: {result.risk_status}</h3>
                            <h4>Data:</h4>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Quantity</th>
                                        <th>Percentage</th>
                                        <th>Cumulative Percentage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.data.map((row, index) => (
                                        <tr key={index}>
                                            <td>{row.QTITEVAL}</td>
                                            <td>{row.Percentage.toFixed(2)}%</td>
                                            <td>{row.Cumulative_Percentage.toFixed(2)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PredicateAi;
