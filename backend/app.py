from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import mysql.connector 
from dotenv import load_dotenv
import os 

# load environment variables from .env file
load_dotenv()

app = Flask(__name__, static_folder="../frontend", static_url_path="/")
CORS(app)  # allows frontend JS to call backend APIs

# --- MySQL connection setup ---
db = mysql.connector.connect(
    host=os.getenv("DB_HOST"),  # change if needed
    user=os.getenv("DB_USER"),  # change if needed
    password=os.getenv("DB_PASSWORD"),  # change this
    database=os.getenv("DB_NAME")  # change if needed
)

# --- Serve frontend ---
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

# --- API: Fetch questions ---
@app.route('/questions')
def get_questions():
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, question FROM questions")
    questions = cursor.fetchall()
    return jsonify(questions)

# --- API: Submit answers ---
@app.route('/submit', methods=['POST'])
def submit_quiz():
    data = request.get_json()
    username = data.get('username')
    answers = data.get('answers')

    score = 0
    cursor = db.cursor(dictionary=True)
    for qid, ans in answers.items():
        cursor.execute("SELECT answer FROM questions WHERE id=%s", (qid,))
        correct = cursor.fetchone()
        if correct and ans.lower() == correct['answer'].lower():
            score += 1

    cursor.execute("INSERT INTO results (username, score) VALUES (%s, %s)", (username, score))
    db.commit()

    return jsonify({
        "username": username,
        "score": score,
        "message": "Thanks for playing!"
    })

if __name__ == '__main__':
    app.run(debug=True)
