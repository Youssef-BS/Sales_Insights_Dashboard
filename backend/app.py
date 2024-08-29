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
app.config['MAIL_USERNAME'] = 'test2104e@gmail.com'
app.config['MAIL_PASSWORD'] = 'Aazzee@1'
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False

mail = Mail(app)


#send verification code 

def send_verification_email(user):
    token = secrets.token_urlsafe(20)
    user.verification_token = token
    db.session.commit()

    verification_url = f"http://yourdomain.com/verify/{token}"
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
        return jsonify({'error': 'Login failed'}), 401



# get user data  

@app.route('/user', methods=['GET'])
@login_required
def get_user():
    return jsonify({'username': current_user.username, 'email': current_user.email})





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
    "Hello", "Hi", "How are you?", "Good morning", "Good evening", 
    "Nice to meet you", "What's up?", "How's it going?", "Help", 
    "Assistance", "Show me the transaction details", 
    "What is the status of transaction number 474?", 
    "How many transactions were made by client 55586?"
]

train_labels = [
    "Hello! How can I assist you?", "Hello!", "I'm fine, how about you?", 
    "Good morning!", "Good evening!", "Nice to meet you too!", 
    "Not much, just hanging out.", "All good here, how about you?", 
    "How can I assist you?", "I'm here to help!", 
    "Please provide the transaction number.", 
    "Transaction 474 is a buy transaction with a total amount of 52,124.", 
    "Client 55586 made 1 transaction."
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



if __name__ == '__main__':
    app.run(debug=True)