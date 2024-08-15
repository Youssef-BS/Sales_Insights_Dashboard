import Papa from 'papaparse';
import { useState, useEffect, useCallback } from 'react';
import { Select, Table } from 'antd';
import { Column, Pie } from '@ant-design/plots';
import 'bootstrap/dist/css/bootstrap.min.css';

const { Option } = Select;

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedCommerc, setSelectedCommerc] = useState('all');
  const [productOptions, setProductOptions] = useState([]);
  const [commercOptions, setCommercOptions] = useState([]);
  const [timeFilter, setTimeFilter] = useState('all');

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

      setProductOptions([...new Set(combinedData.map(item => item.NumeroValeur))]);
      setCommercOptions([...new Set(combinedData.map(item => item.COMMERC))]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filterByTime = (data, filter) => {
    const now = new Date();
    return data.filter(item => {
      const date = new Date(item.DATETRANSACTION);
      if (filter === 'lastMonth') {
        return date >= new Date(now.getFullYear(), now.getMonth() - 1, 1) && date < new Date(now.getFullYear(), now.getMonth(), 1);
      }
      if (filter === 'lastYear') {
        return date >= new Date(now.getFullYear() - 1, 0, 1) && date < new Date(now.getFullYear(), 0, 1);
      }
      return true;
    });
  };

  const filteredData = filterByTime(
    data.filter(item => (
      (selectedProduct === 'all' || item.NumeroValeur === selectedProduct) &&
      (selectedCommerc === 'all' || item.COMMERC === selectedCommerc)
    )),
    timeFilter
  );

  const calculateStats = (data) => {
    const totalRevenue = data.reduce((acc, curr) => acc + curr.Montant, 0);
    const totalQuantity = data.reduce((acc, curr) => acc + curr.QuantiteNegociee, 0);
    const totalTransactions = data.length;

    const nbVente = data.filter(item => item.SensTransaction === 'V').length;
    const nbAchat = data.filter(item => item.SensTransaction === 'A').length;

    const tunisSfaxStats = data.reduce((acc, curr) => {
      if (!acc[curr.TUNSFAX]) {
        acc[curr.TUNSFAX] = 0;
      }
      acc[curr.TUNSFAX] += 1;
      return acc;
    }, {});

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

    const commercRevenuePercentage = Object.entries(commercStats).map(([commerc, stats]) => ({
      commerc,
      percentage: (stats.revenue / totalRevenue) * 100,
    }));

    return { totalRevenue, totalQuantity, totalTransactions, nbVente, nbAchat, tunisSfaxStats, commercStats, productStats, commercRevenuePercentage };
  };

  const { totalRevenue, totalQuantity, totalTransactions, nbVente, nbAchat, tunisSfaxStats, commercStats, productStats, commercRevenuePercentage } = calculateStats(filteredData);

  const generalConfig = {
    data: [
      { type: 'Total Revenue', value: totalRevenue },
      { type: 'Total Quantity', value: totalQuantity },
      { type: 'Total Transactions', value: totalTransactions },
      { type: 'Number of Sales', value: nbVente },
      { type: 'Number of Purchases', value: nbAchat }
    ],
    xField: 'type',
    yField: 'value',
    color: '#134B70',
  };

  const tunisSfaxData = Object.entries(tunisSfaxStats).map(([tunsfax, count]) => ({
    type: tunsfax === 'T' ? 'Tunis' : 'Sfax',
    value: count,
  }));

  const tunisSfaxConfig = {
    data: tunisSfaxData,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    color: ['#508C9B', '#134B70'],
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
    color: '#134B70',
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
    color: '#134B70',
  };

  const commercRevenueConfig = {
    data: commercRevenuePercentage,
    angleField: 'percentage',
    colorField: 'commerc',
    radius: 1,
    label: {
      type: 'outer',
      content: '{name} {percentage}%',
    },
    color: ['#508C9B', '#134B70', '#82CA9D', '#D45087', '#FF7F50'],
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-5">Dashboard</h2>

      <div className="row mb-4">
        <div className="col-md-4">
          <Select
            value={selectedProduct}
            onChange={value => setSelectedProduct(value)}
            className="form-select"
            style={{ width: '100%' }}
          >
            <Option value="all">All Products</Option>
            {productOptions.map(product => (
              <Option key={product} value={product}>{product}</Option>
            ))}
          </Select>
        </div>
        <div className="col-md-4">
          <Select
            value={selectedCommerc}
            onChange={value => setSelectedCommerc(value)}
            className="form-select"
            style={{ width: '100%' }}
          >
            <Option value="all">All Commercs</Option>
            {commercOptions.map(commerc => (
              <Option key={commerc} value={commerc}>{commerc}</Option>
            ))}
          </Select>
        </div>
        <div className="col-md-4">
          <Select
            value={timeFilter}
            onChange={value => setTimeFilter(value)}
            className="form-select"
            style={{ width: '100%' }}
          >
            <Option value="all">All Time</Option>
            <Option value="lastMonth">Last Month</Option>
            <Option value="lastYear">Last Year</Option>
          </Select>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              General Statistics
            </div>
            <div className="card-body">
              <Column {...generalConfig} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              Tunis vs Sfax Transactions
            </div>
            <div className="card-body">
              <Pie {...tunisSfaxConfig} />
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              Revenue by Product
            </div>
            <div className="card-body">
              <Column {...productConfig} />
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              Revenue by Commerc
            </div>
            <div className="card-body">
              <Column {...commercConfig} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              Commerc Revenue Percentage
            </div>
            <div className="card-body">
              <Pie {...commercRevenueConfig} />
            </div>
          </div>
        </div>
      </div>
      <div className="row mt-5">
        <div className='card'>
        <div className="card-header bg-primary text-white">
          All Data
        </div>
        <div className="card-body">
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
              { title: 'Tunis or Sfax', dataIndex: 'TUNSFAX', render: value => (value === 'T' ? 'Tunis' : 'Sfax') },
            ]}
            dataSource={filteredData}
            rowKey={(record, index) => index}
            pagination={{ pageSize: 10 }}
          />
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
