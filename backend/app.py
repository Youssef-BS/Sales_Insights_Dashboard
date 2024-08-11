from flask import Flask, request, jsonify , send_file
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, current_user, logout_user, login_required
from flask_cors import CORS
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import os
import csv
import io

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
CORS(app)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:@localhost/statproject'
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

@login_manager.user_loader
def load_user(user_id): 
    return User.query.get(int(user_id))

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data or not all(key in data for key in ('username', 'email', 'password')):
        return jsonify({'error': 'Invalid data'}), 400

    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(username=data['username'], email=data['email'], password=hashed_password)
    db.session.add(user)
    db.session.commit()
    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email
    }
    return jsonify({'message': 'User registered successfully','user':user_data}), 201

@app.route('/updateAccount/<int:id>', methods=['PUT', 'POST'])
def update_account(id):
    data = request.get_json()
    
    if not data or not all(key in data for key in ('username', 'email')):
        return jsonify({'error': 'Invalid data'}), 400
    user = User.query.get(int(id))
    if user:
        user.username = data['username']
        user.email = data['email']
        db.session.commit()
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
        return jsonify({'message': 'Account updated successfully','user':user_data})
    else:
        return jsonify({'error': 'User not found'}), 404
    

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not all(key in data for key in ('email', 'password')):
        return jsonify({'error': 'Invalid data'}), 400

    user = User.query.filter_by(email=data['email']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        login_user(user)
        user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email
    }
        return jsonify({'message': 'Login successful','user':user_data})
    else:
        return jsonify({'error': 'Login failed'}), 401

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logout successful'}), 200

@app.route('/user', methods=['GET'])
@login_required
def get_user():
    return jsonify({'username': current_user.username, 'email': current_user.email})




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

model = RandomForestRegressor()

df = load_data_from_csv('../client/public/t2.csv')
X = df[['QuantiteNegociee', 'CoursTransaction']]
y = df['Montant']
model.fit(X, y)

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    df = load_data_from_csv(file)
    return jsonify(df.to_dict(orient='records'))

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    df = pd.DataFrame(data)
    df['QuantiteNegociee'] = df['QuantiteNegociee'].astype(float)
    df['CoursTransaction'] = df['CoursTransaction'].astype(float)
    predictions = model.predict(df[['QuantiteNegociee', 'CoursTransaction']])
    return jsonify(predictions.tolist())


@app.route('/addLineToCsv', methods=['POST'])
def add_line_to_csv():
    data = request.json
    file_name = data.get('fileName')
    new_line = data.get('newLine')
    file_path = os.path.join(os.path.dirname(__file__), '../client/public', file_name)
    
    print(f"File path: {file_path}")
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found.'}), 404
    csv_line = f"{new_line['DATETRANSACTION']};{new_line['NumClient']};{new_line['SensTransaction']};{new_line['NumeroValeur']};{new_line['QuantiteNegociee']};{new_line['CoursTransaction']};{new_line['Montant']};{new_line['NAT']};{new_line['GESTION']};{new_line['COMMERC']};{new_line['SOLDE']};{new_line['Depose']};{new_line['TUNSFAX']}\n"

    try:
        with open(file_path, 'a') as file:
            file.write(csv_line)
        return jsonify({'message': 'Line added successfully.'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)