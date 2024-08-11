import React, { useState } from 'react';
import { Button, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { Column, Line, Pie } from '@ant-design/plots';
import 'bootstrap/dist/css/bootstrap.min.css';

const PredicateAI = () => {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const predictionResponse = await axios.post('http://localhost:5000/predict', response.data);
      setPrediction(predictionResponse.data);
    } catch (err) {
      setError('Error uploading file or predicting data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Configure the charts with prediction data
  const columnConfig = {
    data: prediction.map((item, index) => ({
      type: `Record ${index + 1}`,
      value: item
    })),
    xField: 'type',
    yField: 'value',
    color: '#134B70',
  };

  const lineConfig = {
    data: prediction.map((item, index) => ({
      x: index + 1,
      y: item
    })),
    xField: 'x',
    yField: 'y',
    color: '#134B70',
  };

  const pieConfig = {
    data: prediction.map((item, index) => ({
      type: `Record ${index + 1}`,
      value: item
    })),
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    color: ['#508C9B', '#134B70'],
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm">
        <h3 className="text-center mb-4">Upload CSV and Get Prediction</h3>
        
        <Form>
          <Form.Group controlId="formFile">
            <Form.Label>Upload CSV File</Form.Label>
            <Form.Control type="file" accept=".csv" onChange={handleFileChange} />
          </Form.Group>
          
          <Button
            variant="primary"
            className="mt-3"
            onClick={handleFileUpload}
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : 'Upload and Predict'}
          </Button>
        </Form>

        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        {prediction.length > 0 && (
          <div className="mt-4">
            <h4 className="text-center mb-4">Prediction Results</h4>

            <div className="mb-5">
              <h5>Column Chart</h5>
              <Column {...columnConfig} />
            </div>

            <div className="mb-5">
              <h5>Line Chart</h5>
              <Line {...lineConfig} />
            </div>

            <div className="mb-5">
              <h5>Pie Chart</h5>
              <Pie {...pieConfig} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredicateAI;
