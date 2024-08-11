import Papa from 'papaparse';
import { useState, useEffect, useCallback } from 'react';
import { Select, Table } from 'antd';
import { Column, Line } from '@ant-design/plots';

const { Option } = Select;

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedCommerc, setSelectedCommerc] = useState('all');
  const [productOptions, setProductOptions] = useState([]);
  const [commercOptions, setCommercOptions] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const [dataset1, dataset2] = await Promise.all([
        fetch('/t1.csv').then(res => res.text()),
        fetch('/t2.csv').then(res => res.text())
      ]);

      const processCSV = (csvData) => {
        return new Promise((resolve, reject) => {
          Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true,
            transformHeader: header => header.trim(),
            transform: (value, header) => header === 'Montant' ? parseFloat(value.replace(',', '.')) : value,
            complete: (results) => {
              resolve(results.data.map(item => ({
                ...item,
                DATETRANSACTION: new Date(item.DATETRANSACTION),
                QuantiteNegociee: parseFloat(item.QuantiteNegociee),
              })));
            }
          });
        });
      };

      const [data1, data2] = await Promise.all([
        processCSV(dataset1),
        processCSV(dataset2),
      ]);

      const combinedData = [...data1, ...data2];
      setData(combinedData);

      // Set options for products and commercs
      setProductOptions([...new Set(combinedData.map(item => item.NumeroValeur))]);
      setCommercOptions([...new Set(combinedData.map(item => item.COMMERC))]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredData = data.filter(item => (
    (selectedProduct === 'all' || item.NumeroValeur === selectedProduct) &&
    (selectedCommerc === 'all' || item.COMMERC === selectedCommerc)
  ));

  const calculateStats = (data) => {
    const totalRevenue = data.reduce((acc, curr) => acc + curr.Montant, 0);
    const totalQuantity = data.reduce((acc, curr) => acc + curr.QuantiteNegociee, 0);
    const totalTransactions = data.length;

    const commercStats = data.reduce((acc, curr) => {
      if (!acc[curr.COMMERC]) {
        acc[curr.COMMERC] = { revenue: 0, transactions: 0 };
      }
      acc[curr.COMMERC].revenue += curr.Montant;
      acc[curr.COMMERC].transactions += 1;
      return acc;
    }, {});

    const productStats = data.reduce((acc, curr) => {
      if (!acc[curr.NumeroValeur]) {
        acc[curr.NumeroValeur] = { revenue: 0, quantity: 0 };
      }
      acc[curr.NumeroValeur].revenue += curr.Montant;
      acc[curr.NumeroValeur].quantity += curr.QuantiteNegociee;
      return acc;
    }, {});

    return { totalRevenue, totalQuantity, totalTransactions, commercStats, productStats };
  };

  const { totalRevenue, totalQuantity, totalTransactions, commercStats, productStats } = calculateStats(filteredData);

  const generalConfig = {
    data: [{ type: 'Total Revenue', value: totalRevenue }, { type: 'Total Quantity', value: totalQuantity }, { type: 'Total Transactions', value: totalTransactions }],
    xField: 'type',
    yField: 'value',
    color: '#ffd333',
  };

  const productData = Object.entries(productStats).map(([product, stats]) => ({
    product,
    revenue: stats.revenue,
    quantity: stats.quantity,
  }));

  const productConfig = {
    data: productData,
    xField: 'product',
    yField: 'revenue',
    color: '#007bff',
  };

  const commercData = Object.entries(commercStats).map(([commerc, stats]) => ({
    commerc,
    revenue: stats.revenue,
    transactions: stats.transactions,
  }));

  const commercConfig = {
    data: commercData,
    xField: 'commerc',
    yField: 'revenue',
    color: '#28a745',
  };

  return (
    <div>
      <Select
        value={selectedProduct}
        onChange={value => setSelectedProduct(value)}
        style={{ width: 200, marginRight: 16 }}
      >
        <Option value="all">All Products</Option>
        {productOptions.map(product => (
          <Option key={product} value={product}>{product}</Option>
        ))}
      </Select>
      <Select
        value={selectedCommerc}
        onChange={value => setSelectedCommerc(value)}
        style={{ width: 200 }}
      >
        <Option value="all">All Commercs</Option>
        {commercOptions.map(commerc => (
          <Option key={commerc} value={commerc}>{commerc}</Option>
        ))}
      </Select>

      <h3 className="mb-4 title">Dashboard</h3>

      {/* General Statistics */}
      <div className="general-stats">
        <h3 className="mb-5 title">General Statistics</h3>
        <Column {...generalConfig} />
      </div>

      {/* Product Statistics */}
      <div className="product-stats mt-4">
        <h3 className="mb-5 title">Product Statistics</h3>
        <Line {...productConfig} />
      </div>

      {/* Commerc Statistics */}
      <div className="commerc-stats mt-4">
        <h3 className="mb-5 title">Commerc Statistics</h3>
        <Line {...commercConfig} />
      </div>

      {/* Detailed Table */}
      <div className="mt-4">
        <h3 className="mb-5 title">Detailed Data</h3>
        <Table
          columns={[
            { title: 'Date', dataIndex: 'DATETRANSACTION', render: date => new Date(date).toLocaleString() },
            { title: 'Client Number', dataIndex: 'NumClient' },
            { title: 'Transaction Type', dataIndex: 'SensTransaction' },
            { title: 'Product Number', dataIndex: 'NumeroValeur' },
            { title: 'Quantity', dataIndex: 'QuantiteNegociee' },
            { title: 'Price per Unit', dataIndex: 'CoursTransaction' },
            { title: 'Amount', dataIndex: 'Montant' },
            { title: 'Commerc', dataIndex: 'COMMERC' },
            // Add more columns as needed
          ]}
          dataSource={filteredData}
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  );
};

export default Dashboard;
