  import Papa from 'papaparse';
  import { useState, useEffect, useCallback } from 'react';
  import { Select, Table } from 'antd';
  import { Column, Pie , Line } from '@ant-design/plots';
  import 'bootstrap/dist/css/bootstrap.min.css';
  import ChatClient from './ChatClient';

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
              transformHeader: (header) => header.trim(),
              transform: (value, header) =>
                header === 'Montant' ? parseFloat(value.replace(',', '.')) : value,
              complete: (results) => {
                resolve(
                  results.data.map((item) => {
                    // Custom date parsing function
                    const parseDate = (dateString) => {
                      const [datePart, timePart] = dateString.split(' ');
                      const [day, month, year] = datePart.split('/');
                      return new Date(`${year}-${month}-${day}T${timePart}`);
                    };
        
                    const parsedDate = parseDate(item.DATETRANSACTION);
        
                    return {
                      ...item,
                      DATETRANSACTION: !isNaN(parsedDate) ? parsedDate : null, // Handle invalid dates
                      QuantiteNegociee: parseFloat(item.QuantiteNegociee.replace(',', '.')),
                    };
                  })
                );
              },
              error: (error) => {
                reject(error);
              },
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
        if (filter === 'weekly') {
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          return date >= startOfWeek && date <= new Date();
        }
        if (filter === 'monthly') {
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }
        if (filter === 'quarterly') {
          const quarter = Math.floor(now.getMonth() / 3);
          return Math.floor(date.getMonth() / 3) === quarter && date.getFullYear() === now.getFullYear();
        }
        if (filter === 'yearly') {
          return date.getFullYear() === now.getFullYear();
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
      const nbVente = data.filter(item => item.SensTransaction === 'V').length;
      const nbAchat = data.filter(item => item.SensTransaction === 'A').length;
      
      const totalRevenue = data.reduce((acc, curr) => acc + curr.Montant, 0);

      const totalQuantityA = data
          .filter(item => item.SensTransaction === 'A')
          .reduce((acc, curr) => acc + curr.QuantiteNegociee, 0);

      const totalQuantityV = data
          .filter(item => item.SensTransaction === 'V')
          .reduce((acc, curr) => acc + curr.QuantiteNegociee, 0);

      const totalQuantity = totalQuantityA - totalQuantityV;
      const totalTransactions = data.length;

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
        percentage: totalRevenue !== 0 ? (stats.revenue / totalRevenue) * 100 : 0, 
        revenue: stats.revenue,
        transactions: stats.transactions,
    }));

    const actifNetTotal = data.reduce((acc, curr) => {
      const quantity = typeof curr.QuantiteNegociee === 'string'
          ? parseFloat(curr.QuantiteNegociee.replace(',', '.'))
          : curr.QuantiteNegociee;

      const price = typeof curr.CoursTransaction === 'string'
          ? parseFloat(curr.CoursTransaction.replace(',', '.'))
          : curr.CoursTransaction;
      const adjustedQuantity = curr.SensTransaction === 'A' ? quantity : -quantity;
      return acc + (adjustedQuantity * price);
  }, 0);



      const productRevenueStats = data.reduce((acc, curr) => {
          if (curr.NumeroValeur === 474 || curr.NumeroValeur === 1570) {
              const multiplier = curr.NumeroValeur === 474 ? 0.75 : 0.8;
              const revenue = curr.QuantiteNegociee * curr.Montant * multiplier * 365;

              if (!acc[curr.NumeroValeur]) {
                  acc[curr.NumeroValeur] = { revenue: 0, days: 0 };
              }
              acc[curr.NumeroValeur].revenue += revenue;
              acc[curr.NumeroValeur].days += 1;
          }
          return acc;
      }, {});

      return { 
          totalRevenue, 
          totalQuantityA, 
          totalQuantityV, 
          totalQuantity, 
          totalTransactions, 
          nbVente, 
          nbAchat, 
          tunisSfaxStats, 
          commercStats, 
          productStats, 
          commercRevenuePercentage, 
          actifNetTotal, 
          productRevenueStats 
      };
  };


    const { totalRevenue, totalQuantity, totalTransactions, nbVente, nbAchat, tunisSfaxStats, commercStats, productStats, commercRevenuePercentage, actifNetTotal } = calculateStats(filteredData);
    const calculateActifNetEvolution = (data) => {
      const actifNetByDate = data.reduce((acc, curr) => {
        const date = curr.DATETRANSACTION.toISOString().split('T')[0]; 
        const quantity = typeof curr.QuantiteNegociee === 'string'
          ? parseFloat(curr.QuantiteNegociee.replace(',', '.'))
          : curr.QuantiteNegociee;
    
        const price = typeof curr.CoursTransaction === 'string'
          ? parseFloat(curr.CoursTransaction.replace(',', '.'))
          : curr.CoursTransaction;
    
        const adjustedQuantity = curr.SensTransaction === 'A' ? quantity : -quantity;
        const actifNetValue = adjustedQuantity * price;
    
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += actifNetValue;
        return acc;
      }, {});
    
      return Object.entries(actifNetByDate).map(([date, value]) => ({
        date,
        value,
      }));
    };
    
    const actifNetEvolutionData = calculateActifNetEvolution(filteredData);

    const calculateCoursTransactionEvolution = (data) => {
      const coursByDate = data.reduce((acc, curr) => {
        const date = curr.DATETRANSACTION.toISOString().split('T')[0]; 
        const coursTransaction = typeof curr.CoursTransaction === 'string'
          ? parseFloat(curr.CoursTransaction.replace(',', '.'))
          : curr.CoursTransaction;
    
        if (!acc[date]) {
          acc[date] = { total: 0, count: 0 };
        }
        acc[date].total += coursTransaction;
        acc[date].count += 1;
    
        return acc;
      }, {});
    
      // Convert the aggregated object into an array for the chart
      return Object.entries(coursByDate).map(([date, { total, count }]) => ({
        date,
        value: total / count, // Calculate the average
      }));
    };
    
    const coursTransactionEvolutionData = calculateCoursTransactionEvolution(filteredData);

    const generalConfig = {
      data: [
        { type: 'Total Revenue', value: totalRevenue },
        { type: 'Total Quantity', value: totalQuantity },
        { type: 'Total Transactions', value: totalTransactions },
        { type: 'Number of Sales', value: nbVente },
        { type: 'Number of Purchases', value: nbAchat },
        { type: 'Actif Net Total', value: actifNetTotal }
      ],
      xField: 'type',
      yField: 'value',
      color: '#201E43',
    };

    const generalTableData = generalConfig.data.map(item => ({
      key: item.type,
      type: item.type,
      value: item.value,
    }));

    const columns = [
      { title: 'Type', dataIndex: 'type', key: 'type' },
      { title: 'Value', dataIndex: 'value', key: 'value' },
    ];

    const tunisSfaxData = Object.entries(tunisSfaxStats).map(([tunsfax, count]) => ({
      type: tunsfax === 'T' ? 'Tunis' : 'Sfax',
      value: count,
    }));

    const tunisSfaxConfig = {
      data: tunisSfaxData.map(item => ({
        ...item,
        type: item.type === 'T' ? 'Tunisia' : item.type === 'S' ? 'Sfax' : item.type
      })),
      angleField: 'value',
      colorField: 'type',
      radius: 1,
      label: {
        type: 'outer',
        content: '{name}',
      },
      color: ['#C8A1E0', '#674188'], 
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
      color: '#201E43',
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
      color: '#201E43',
    };

    const commercRevenueConfig = {
      data: commercRevenuePercentage,
      angleField: 'percentage',
      colorField: 'commerc',
      radius: 1,
      label: {
        type: 'outer',
        content: '{name}',
      },
      color : [
  '#EF5A6F', 
  '#FF76CE', 
  '#1E0342', 
  '#1AACAC', 
  '#D2E0FB', 
  '#6C3428', 
  '#D20062', 
  '#F5DD61', 
  '#9EB8D9', 
  '#A25772', 
  '#FF4500', 
  '#00CED1', 
  '#708090', 
  '#F08080', 
  '#FFD700', 
  '#32CD32', 
  '#8A2BE2', 
  '#C71585', 
  '#4682B4', 
]
    };

    const actifNetEvolutionConfig = {
      data: actifNetEvolutionData,
      xField: 'date',
      yField: 'value',
      xAxis: {
        label: {
          formatter: (v) => v.split('-').reverse().join('/'), // Assuming v is a date string
        },
      },
      yAxis: {
        label: {
          formatter: (v) => (typeof v === 'number' ? v.toFixed(2) : v), // Ensure v is a number before formatting
        },
      },
      lineStyle: {
        stroke: '#0066CC',
        lineWidth: 2,
      },
      point: {
        size: 5,
        shape: 'circle',
        style: {
          fill: '#0066CC',
        },
      },
      tooltip: {
        fields: ['date', 'value'],
        formatter: (datum) => ({
          name: 'Actif Net',
          value: typeof datum.value === 'number' ? datum.value.toFixed(2) : datum.value, // Ensure formatting
        }),
      },
    };

    const coursTransactionEvolutionConfig = {
      data: coursTransactionEvolutionData,
      xField: 'date',
      yField: 'value',
      xAxis: {
        label: {
          formatter: (v) => v.split('-').reverse().join('/'), 
        },
      },
      yAxis: {
        label: {
          formatter: (v) => (typeof v === 'number' ? v.toFixed(2) : v), 
        },
      },
      lineStyle: {
        stroke: '#0066CC', 
        lineWidth: 2,
      },
      point: {
        size: 5,
        shape: 'circle',
        style: {
          fill: '#66CCFF', 
        },
      },
      tooltip: {
        fields: ['date', 'value'],
        formatter: (datum) => ({
          name: 'Cours Transaction',
          value: typeof datum.value === 'number' ? datum.value.toFixed(2) : datum.value, 
        }),
      },
    };
    

    

    return (
      <div className="container mt-5 ">
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
              <Option value="all">ALl Time</Option>
              <Option value="weekly">Week</Option>
              <Option value="monthly">Monthly</Option>
              <Option value="quarterly">3 Months</Option>
              <Option value="yearly">Yearly</Option>
            </Select>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
        
          <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            General Statistics
          </div>
          <div className="card-body">
            <Table
              dataSource={generalTableData}
              columns={columns}
              pagination={false}
              bordered
            />
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
              Actif Net Evolution by Date
            </div>
            <div className="card-body">
              <Line {...actifNetEvolutionConfig} />
            </div>
          </div>
        </div>
      </div>
      <div className="row mt-4">
  <div className="col-md-12">
    <div className="card">
      <div className="card-header bg-primary text-white">
        Cours Transaction Evolution by Date
      </div>
      <div className="card-body">
        <Line {...coursTransactionEvolutionConfig} />
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
        <ChatClient />
      </div>
    );
  };

  export default Dashboard;