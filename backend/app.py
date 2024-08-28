from flask import Flask, request, jsonify , send_file
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, current_user, logout_user, login_required
from flask_cors import CORS
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.pipeline import Pipeline
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
import os
import logging
from flask_jwt_extended import JWTManager, create_access_token


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
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

@login_manager.user_loader
def load_user(user_id): 
    return User.query.get(int(user_id))


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
    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email
    }
    return jsonify({'message': 'User registered successfully','user':user_data}), 201

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

    user = User.query.filter_by(email=data['email']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        login_user(user)
        
        # Generate a JWT token
        access_token = create_access_token(identity=user.id)
        
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }

        # Return user data and the token
        return jsonify({'message': 'Login successful', 'user': user_data, 'token': access_token})
    else:
        return jsonify({'error': 'Login failed'}), 401

#logout function

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logout successful'}), 200


# get user data  

@app.route('/user', methods=['GET'])
@login_required
def get_user():
    return jsonify({'username': current_user.username, 'email': current_user.email})





#Ai 

def load_training_data(data_file, labels_file):
    if not os.path.exists(data_file):
        raise FileNotFoundError(f"Data file '{data_file}' not found.")
    if not os.path.exists(labels_file):
        raise FileNotFoundError(f"Labels file '{labels_file}' not found.")
    
    with open(data_file, 'r') as df, open(labels_file, 'r') as lf:
        train_data = [line.strip() for line in df.readlines()]
        train_labels = [line.strip() for line in lf.readlines()]

    if not train_data:
        raise ValueError(f"Data file '{data_file}' is empty.")
    if not train_labels:
        raise ValueError(f"Labels file '{labels_file}' is empty.")
    if len(train_data) != len(train_labels):
        raise ValueError("The number of lines in data and labels files do not match.")

    logging.info(f"Raw training data: {train_data}")
    logging.info(f"Raw training labels: {train_labels}")

    # Filter out empty lines and lines with only stop words
    filtered_data = []
    filtered_labels = []
    for data, label in zip(train_data, train_labels):
        words = data.split()
        if words and not all(word in ENGLISH_STOP_WORDS for word in words):
            filtered_data.append(data)
            filtered_labels.append(label)

    logging.info(f"Filtered training data: {filtered_data}")
    logging.info(f"Filtered training labels: {filtered_labels}")

    return filtered_data, filtered_labels

# Load training data and labels
train_data, train_labels = load_training_data('train_data.txt', 'train_labels.txt')

# Check if training data is empty after filtering
if not train_data:
    raise ValueError("Training data is empty after filtering out empty and stop-word-only lines.")

logging.info(f"Training data size: {len(train_data)}")
logging.info(f"Training labels size: {len(train_labels)}")

# Create a pipeline with CountVectorizer, TfidfTransformer, and MultinomialNB
model = Pipeline([
    ('vect', CountVectorizer()),
    ('tfidf', TfidfTransformer()),
    ('clf', MultinomialNB()),
])

# Fit the model
try:
    model.fit(train_data, train_labels)
    logging.info("Model training complete.")
except ValueError as e:
    logging.error(f"Error fitting the model: {e}")
    raise

# Function to generate responses with preprocessing
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
        return jsonify({'message': response})

    except Exception as e:
        logging.error(f"Error processing request: {e}")
        return jsonify({'error': 'An error occurred while processing your request.'}), 500




if __name__ == '__main__':
    app.run(debug=True)