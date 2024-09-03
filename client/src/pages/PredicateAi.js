import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Column, Pie } from '@ant-design/plots';
import ReactPaginate from 'react-paginate';

const PredicateAi = () => {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(20);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
        setResult(null); 
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

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    const paginatedData = result?.data.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage) || [];

    const configColumn = {
        data: result ? paginatedData : [],
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
        data: result ? paginatedData : [],
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
                            <h1>Commerc Number : {result.data[0].COMMERC}</h1>
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
                                    {paginatedData.map((row, index) => (
                                        <tr key={index}>
                                            <td>{Number(row.QTITEVAL).toLocaleString()}</td>
                                            <td>{row.Percentage.toFixed(2)}%</td>
                                            <td>{row.Cumulative_Percentage.toFixed(2)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {result.data.length > itemsPerPage && (
                                <ReactPaginate
                                    previousLabel={'Previous'}
                                    nextLabel={'Next'}
                                    breakLabel={'...'}
                                    pageCount={Math.ceil(result.data.length / itemsPerPage)}
                                    marginPagesDisplayed={2}
                                    pageRangeDisplayed={5}
                                    onPageChange={handlePageClick}
                                    containerClassName={'pagination'}
                                    pageClassName={'page-item'}
                                    pageLinkClassName={'page-link'}
                                    previousClassName={'page-item'}
                                    previousLinkClassName={'page-link'}
                                    nextClassName={'page-item'}
                                    nextLinkClassName={'page-link'}
                                    breakClassName={'page-item'}
                                    breakLinkClassName={'page-link'}
                                    activeClassName={'active'}
                                />
                            )}

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
