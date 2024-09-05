from flask import Flask, request, jsonify , send_file
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, current_user, logout_user, login_required
from flask_cors import CORS
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.pipeline import Pipeline
from sklearn.naive_bayes import MultinomialNB
import os
import logging
from flask_jwt_extended import JWTManager, create_access_token
from flask_mail import Mail, Message
import secrets
from flask_login import UserMixin
from itsdangerous import URLSafeTimedSerializer, SignatureExpired
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier



app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
CORS(app)
logging.basicConfig(level=logging.INFO)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:@localhost/statproject'
db = SQLAlchemy(app)
#crypt password
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)

app.config['JWT_SECRET_KEY'] = 'TEST'
jwt = JWTManager(app)




#class user ==> attributs 
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    email_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(120), unique=True, nullable=True)

@login_manager.user_loader
def load_user(user_id): 
    return User.query.get(int(user_id))


#setup email 

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = 'wassimna68@gmail.com'
app.config['MAIL_PASSWORD'] = 'blavsuxydmqtqtjc'
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False

mail = Mail(app)


#send verification code 

def send_verification_email(user):
    token = secrets.token_urlsafe(20)
    user.verification_token = token
    db.session.commit()

    verification_url = f"http://127.0.0.1:3000/verify-email/{token}"
    msg = Message('Please verify your email', sender='your-email@example.com', recipients=[user.email])
    msg.body = f'Please click the link to verify your email address: {verification_url}'
    mail.send(msg)


#register function to create a new user

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data or not all(key in data for key in ('username', 'email', 'password')):
        return jsonify({'error': 'Invalid data'}), 400

    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(username=data['username'], email=data['email'], password=hashed_password)
    db.session.add(user)
    db.session.commit()
    send_verification_email(user)
    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email
    }
    return jsonify({'message': 'User registered successfully','user':user_data}), 201


#verification code 

@app.route('/verify/<token>', methods=['GET'])
def verify_email(token):
    user = User.query.filter_by(verification_token=token).first()

    if user:
        user.email_verified = True
        user.verification_token = None
        db.session.commit()
        return jsonify({'message': 'Email verified successfully!'}), 200
    else:
        return jsonify({'error': 'Invalid or expired verification token.'}), 400

#update user by Id

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
    

#function login 

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not all(key in data for key in ('email', 'password')):
        return jsonify({'error': 'Invalid data'}), 400

    # Fetch the user by email
    user = User.query.filter_by(email=data['email']).first()

    # Check if user exists and the password is correct
    if user and bcrypt.check_password_hash(user.password, data['password']):
        if user.email_verified:  # Check if the email is verified
            login_user(user)  # Logs in the user session

            # Generate a JWT token
            access_token = create_access_token(identity=user.id)

            # Prepare user data to return
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }

            # Return user data and the JWT token
            return jsonify({'message': 'Login successful', 'user': user_data, 'token': access_token}), 200
        else:
            return jsonify({'error': 'Email not verified'}), 403
    else:
        return jsonify({'error': 'Login failed'}), 401



# get user data  

@app.route('/user', methods=['GET'])
@login_required
def get_user():
    return jsonify({'username': current_user.username, 'email': current_user.email})





#reset password 

@app.route('/reset-password-request', methods=['POST'])
def reset_password_request():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()

    if user:
        # Generate a password reset token
        serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
        token = serializer.dumps(email, salt='reset-password')

        # Create password reset URL
        reset_url = f"http://127.0.0.1:3000/reset-password/{token}"

        # Send password reset email
        msg = Message("Password Reset Request", sender='your-email@example.com', recipients=[email])
        msg.body = f"Please click the link to reset your password: {reset_url}"
        mail.send(msg)

        return jsonify({'message': 'Password reset email sent'}), 200

    return jsonify({'error': 'Email not found'}), 404


# 2 nd function 

@app.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    data = request.get_json()
    new_password = data.get('password')

    if not new_password:
        return jsonify({'error': 'Password is required'}), 400

    try:
        # Verify the token
        serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
        email = serializer.loads(token, salt='reset-password', max_age=3600)  # Token expires in 1 hour

        user = User.query.filter_by(email=email).first()

        if user:
            # Update the user's password
            user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
            user.verification_token = None  # Clear the token after use
            db.session.commit()

            return jsonify({'message': 'Password reset successful'}), 200

        return jsonify({'error': 'User not found'}), 404

    except SignatureExpired:
        return jsonify({'error': 'Token expired'}), 400



#Ai 

DATASET_COLUMNS = [
    "DATETRANSACTION", "NumClient", "SensTransaction", "NumeroValeur", 
    "QuantiteNegociee", "CoursTransaction", "Montant", "NAT", 
    "GESTION", "COMMERC", "SOLDE", "Depose", "TUNSFAX"
]

def load_transaction_data(data_file):
    if not os.path.exists(data_file):
        raise FileNotFoundError(f"Data file '{data_file}' not found.")
    
    with open(data_file, 'r') as df:
        lines = df.readlines()

    if not lines:
        raise ValueError(f"Data file '{data_file}' is empty.")

    transactions = []
    for line in lines:
        values = line.strip().split(';')
        if len(values) == len(DATASET_COLUMNS):
            transactions.append(dict(zip(DATASET_COLUMNS, values)))
        else:
            logging.warning(f"Line skipped due to incorrect format: {line.strip()}")

    logging.info(f"Loaded {len(transactions)} transactions.")
    return transactions


# Load the dataset
transactions = load_transaction_data('../client/public/t1.csv')

model = Pipeline([
    ('vect', CountVectorizer()),
    ('tfidf', TfidfTransformer()),
    ('clf', MultinomialNB()),
])

train_data = [
    "Hello", 
    "Hi", 
    "How are you?", 
    "Good morning", 
    "Good evening", 
    "Nice to meet you", 
    "What's up?", 
    "How's it going?", 
    "Help", 
    "Assistance", 
    "Show me the transaction details", 
    "What is the status of transaction number 474?", 
    "How many transactions were made by client 55586?",
    "Why is the net asset stagnant?",
    "What can be done to increase purchases?",
    "How to increase the net asset?",
    "Propose a marketing strategy",
    "Factors of increase or decrease",
    "How to attract new clients?"
]

train_labels = [
    "Hello! How can I assist you?", 
    "Hello!", 
    "I'm fine, how about you?", 
    "Good morning!", 
    "Good evening!", 
    "Nice to meet you too!", 
    "Not much, just hanging out.", 
    "All good here, how about you?", 
    "How can I assist you?", 
    "I'm here to help!", 
    "Please provide the transaction number.", 
    "Transaction 474 is a buy transaction with a total amount of 52,124.", 
    "Client 55586 made 1 transaction.",
    "The net asset might be stagnant due to lack of growth in revenue or high expenses.",
    "To increase purchases, consider promotional campaigns, discounts, or loyalty programs.",
    "To increase the net asset, focus on reducing expenses, increasing sales, and optimizing investments.",
    "Consider a marketing strategy that targets new demographics, uses digital marketing, or enhances product visibility.",
    "Factors that may cause an increase or decrease include market conditions, customer demand, and operational efficiency.",
    "To attract new clients, enhance customer service, improve product offerings, and leverage social media marketing."
]





model.fit(train_data, train_labels)
logging.info("Chatbot model training complete.")

def generate_response(text):
    text = text.lower()  # Convert text to lowercase
    try:
        predicted_label = model.predict([text])[0]
    except Exception as e:
        logging.error(f"Error generating response: {e}")
        predicted_label = "I'm not sure how to respond to that."
    return predicted_label

# Route to handle chat messages
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        if 'message' not in data:
            raise ValueError("No message field provided in JSON payload.")

        message = data['message']
        response = generate_response(message)

        if "transaction number" in message.lower():
            # Extract the transaction number from the message
            transaction_number = extract_transaction_number(message)
            if transaction_number:
                response = get_transaction_details(transaction_number)
            else:
                response = "I couldn't find the transaction number in your message."

        elif "client" in message.lower():
            # Extract the client number from the message
            client_number = extract_client_number(message)
            if client_number:
                response = get_client_transactions(client_number)
            else:
                response = "I couldn't find the client number in your message."

        return jsonify({'message': response})

    except Exception as e:
        logging.error(f"Error processing request: {e}")
        return jsonify({'error': 'An error occurred while processing your request.'}), 500

def extract_transaction_number(message):
    # Implement logic to extract transaction number from the message
    import re
    match = re.search(r'\btransaction number (\d+)\b', message.lower())
    return match.group(1) if match else None

def extract_client_number(message):
    # Implement logic to extract client number from the message
    import re
    match = re.search(r'\bclient (\d+)\b', message.lower())
    return match.group(1) if match else None

def get_transaction_details(transaction_number):
    # Retrieve transaction details from the dataset
    for transaction in transactions:
        if transaction["NumeroValeur"] == transaction_number:
            return f"Transaction {transaction_number} details: {transaction}"
    return f"No transaction found with number {transaction_number}."

def get_client_transactions(client_number):
    # Retrieve transactions made by a specific client
    client_transactions = [t for t in transactions if t["NumClient"] == client_number]
    if client_transactions:
        return f"Client {client_number} made {len(client_transactions)} transactions."
    return f"No transactions found for client {client_number}."



#new stat with upload file
@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    if file and file.filename.endswith('.csv'):
        try:
            df = pd.read_csv(file, delimiter=';')  # Use semicolon as the delimiter
        except Exception as e:
            return jsonify({'error': f'Error reading CSV file: {str(e)}'}), 400

        if set(['NUMVAL', 'NOMVAL', 'COURS', 'DTCOURS', 'NUMCLI', 'COMMERC', 'QTITEVAL']).issubset(df.columns):
            return process_file(df)
        else:
            return jsonify({'error': 'CSV file is missing required columns.'}), 400
    else:
        return jsonify({'error': 'Invalid file format. Please upload a .csv file.'}), 400

def process_file(df):
    # Replace NaT values in the 'DTCOURS' column with an empty string or a specific placeholder
    df['DTCOURS'] = df['DTCOURS'].fillna(value='')

    # Convert the 'DTCOURS' column to a string format if necessary
    df['DTCOURS'] = df['DTCOURS'].astype(str)

    # Calculate the total QTITEVAL
    total_quantity = df['QTITEVAL'].sum()

    # Calculate the percentage each client holds
    df['Percentage'] = (df['QTITEVAL'] / total_quantity) * 100

    # Sort by QTITEVAL in descending order
    df = df.sort_values('QTITEVAL', ascending=False)

    # Calculate cumulative percentage
    df['Cumulative_Percentage'] = df['Percentage'].cumsum()

    # Risk assessment based on the cumulative percentage
    top_20_percent = df[df['Cumulative_Percentage'] <= 20]
    remaining_80_percent = df[df['Cumulative_Percentage'] > 20]

    # Determine if it's risky
    risk_status = "Safe"
    if top_20_percent['QTITEVAL'].sum() > (0.8 * total_quantity):
        risk_status = "Risky"

    # Convert the DataFrame to a list of dictionaries for JSON response
    data = df.to_dict(orient='records')

    # Return the processed data and risk status
    return jsonify({'risk_status': risk_status, 'data': data})




if __name__ == '__main__':
    app.run(debug=True)