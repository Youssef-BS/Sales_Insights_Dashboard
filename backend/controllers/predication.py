from flask import Blueprint, request, jsonify
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

prediction_bp = Blueprint('prediction', __name__)

# Load model and data
model = RandomForestRegressor()

# Assuming df is loaded from a CSV file for initial model training
def load_data_from_csv(file_path):
    df = pd.read_csv(file_path, delimiter=';')
    df.columns = df.columns.str.strip()
    df.rename(columns={
        'DATETRANSA': 'DATETRANSACTION',
        'QuantiteNegociee': 'QuantiteNegociee',
        'CoursTransaction': 'CoursTransaction',
        'Montant': 'Montant',
    }, inplace=True)
    df['DATETRANSACTION'] = pd.to_datetime(df['DATETRANSACTION'], format='%d/%m/%Y %H:%M')
    df['Montant'] = df['Montant'].astype(str).str.replace(',', '.').astype(float)
    df['QuantiteNegociee'] = df['QuantiteNegociee'].astype(str).str.replace(',', '.').astype(float)
    df['CoursTransaction'] = df['CoursTransaction'].astype(str).str.replace(',', '.').astype(float)
    return df

df = load_data_from_csv('../client/public/t2.csv')
X = df[['QuantiteNegociee', 'CoursTransaction']]
y = df['Montant']
model.fit(X, y)

@prediction_bp.route('/predict', methods=['POST'])
def predict():
    data = request.json
    df = pd.DataFrame(data)
    df['QuantiteNegociee'] = df['QuantiteNegociee'].astype(float)
    df['CoursTransaction'] = df['CoursTransaction'].astype(float)
    predictions = model.predict(df[['QuantiteNegociee', 'CoursTransaction']])
    return jsonify(predictions.tolist())
