import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

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

  const [whichFile, setWhichFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLine((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddLine = async () => {
    try {
      const fileName = whichFile === '1' ? 't1.csv' : 't2.csv'; 
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
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="card shadow-lg">
            <div className="card-header bg-primary text-white">
              <h4>Add New Line</h4>
            </div>
            <div className="card-body">
              <Form>
                <Form.Group>
                  <Form.Label>Select File</Form.Label>
                  <div className="mb-3">
                    <Form.Check
                      inline
                      label="Add in data 1570"
                      type="radio"
                      name="data"
                      value="1"
                      onChange={(e) => setWhichFile(e.target.value)}
                    />
                    <Form.Check
                      inline
                      label="Add in data 474"
                      type="radio"
                      name="data"
                      value="2"
                      onChange={(e) => setWhichFile(e.target.value)}
                    />
                  </div>
                </Form.Group>

                <Form.Group controlId="DATETRANSACTION">
                  <Form.Label>Date Transaction</Form.Label>
                  <Form.Control
                    type="date"
                    name="DATETRANSACTION"
                    value={newLine.DATETRANSACTION}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group controlId="NumeroValeur" className="mt-3">
                  <Form.Label>Numero Valeur</Form.Label>
                  <Form.Control
                    as="select"
                    name="NumeroValeur"
                    value={newLine.NumeroValeur}
                    onChange={handleInputChange}
                  >
                    <option value="">Select</option>
                    <option value="474">474</option>
                    <option value="1570">1570</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="TUNSFAX" className="mt-3">
                  <Form.Label>TUNS/SFAX</Form.Label>
                  <Form.Control
                    as="select"
                    name="TUNSFAX"
                    value={newLine.TUNSFAX}
                    onChange={handleInputChange}
                  >
                    <option value="">Select</option>
                    <option value="T">T</option>
                    <option value="S">S</option>
                  </Form.Control>
                </Form.Group>

                {/* Render other form fields dynamically */}
                {Object.keys(newLine)
                  .filter((field) => !['DATETRANSACTION', 'NumeroValeur', 'TUNSFAX'].includes(field))
                  .map((field) => (
                    <Form.Group controlId={field} key={field} className="mt-3">
                      <Form.Label>{field}</Form.Label>
                      <Form.Control
                        type="text"
                        name={field}
                        value={newLine[field]}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  ))}

                <Button variant="primary" className="mt-4" onClick={handleAddLine}>
                  Add Line to CSV
                </Button>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AddNewLine;
