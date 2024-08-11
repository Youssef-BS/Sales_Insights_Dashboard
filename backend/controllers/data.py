from flask import Blueprint, request, jsonify
import pandas as pd
import os

data_bp = Blueprint('data', __name__)

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

@data_bp.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    df = load_data_from_csv(file)
    return jsonify(df.to_dict(orient='records'))

@data_bp.route('/addLineToCsv', methods=['POST'])
def add_line_to_csv():
    data = request.json
    file_name = data.get('fileName')
    new_line = data.get('newLine')
    file_path = os.path.join(os.path.dirname(__file__), '../client/public', file_name)

    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found.'}), 404
    csv_line = f"{new_line['DATETRANSACTION']};{new_line['NumClient']};{new_line['SensTransaction']};{new_line['NumeroValeur']};{new_line['QuantiteNegociee']};{new_line['CoursTransaction']};{new_line['Montant']};{new_line['NAT']};{new_line['GESTION']};{new_line['COMMERC']};{new_line['SOLDE']};{new_line['Depose']};{new_line['TUNSFAX']}\n"

    try:
        with open(file_path, 'a') as file:
            file.write(csv_line)
        return jsonify({'message': 'Line added successfully.'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
