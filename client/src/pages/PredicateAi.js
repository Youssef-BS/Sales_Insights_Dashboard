import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Column, Pie } from '@ant-design/plots';
import Papa from 'papaparse';

const PredicateAi = () => {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
        setResult(null); // Reset result on file change
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file before uploading.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        setLoading(true);

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
        } finally {
            setLoading(false);
        }
    };

    const configColumn = {
        data: result ? result.data : [],
        xField: 'QTITEVAL',
        yField: 'Percentage',
        xAxis: {
            label: {
                autoRotate: true,
            },
        },
        label: {
            position: 'middle',
            style: {
                fill: '#FFFFFF',
                opacity: 0.6,
            },
        },
        color: '#5B8FF9',
        height: 400,
    };

    const configPie = {
        appendPadding: 10,
        data: result ? result.data : [],
        angleField: 'Percentage',
        colorField: 'QTITEVAL',
        radius: 0.8,
        label: {
            type: 'outer',
            content: '{name} {percentage}',
        },
        interactions: [
            {
                type: 'element-active',
            },
        ],
        height: 400,
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
                    <button className="btn btn-primary" onClick={handleUpload} disabled={loading}>
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>
                    
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
                                            <td>{Number(row.QTITEVAL).toLocaleString()}</td>
                                            <td>{row.Percentage.toFixed(2)}%</td>
                                            <td>{row.Cumulative_Percentage.toFixed(2)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="mt-4">
                                <h4>Percentage Distribution</h4>
                                <Column {...configColumn} />
                            </div>

                            <div className="mt-4">
                                <h4>Quantity Distribution</h4>
                                <Pie {...configPie} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PredicateAi;
