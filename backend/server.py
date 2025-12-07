import os
import traceback
from datetime import timedelta

import bcrypt
import nltk
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (JWTManager, create_access_token, get_jwt_identity,
                                jwt_required)
from nltk.tokenize import sent_tokenize
from transformers import pipeline

import pymysql

# Download NLTK resources (runs once; you can remove after first run)
nltk.download('punkt', quiet=True)

app = Flask(__name__)
CORS(app)

# JWT Config
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'ab#123Uty')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=2)
jwt = JWTManager(app)

# Summarizer (loads model at startup - may take time & requires torch)
summarizer = pipeline("summarization", model="t5-small")


def get_db_connection():
    """
    Connect using pymysql. Use environment variables if present:
    DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
    """
    try:
        connection = pymysql.connect(
            host=os.environ.get('DB_HOST', 'localhost'),
            user=os.environ.get('DB_USER', 'root'),
            password=os.environ.get('DB_PASSWORD', '2929'),
            database=os.environ.get('DB_NAME', 'demo'),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.Cursor,
            autocommit=False
        )
        return connection
    except pymysql.MySQLError as e:
        print("Database Connection Failed:", str(e))
        return None


@app.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    username, email, password = data.get('username'), data.get('email'), data.get('password')
    if not username or not email or not password:
        return jsonify({"msg": "Missing fields"}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    connection = get_db_connection()
    if not connection:
        return jsonify({"msg": "Database connection failed"}), 500

    cursor = connection.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"msg": "User with this email already exists"}), 400

        cursor.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
                       (username, email, hashed_password.decode('utf-8')))
        connection.commit()
        return jsonify({"msg": "User registered successfully!"}), 201
    except pymysql.MySQLError as e:
        connection.rollback()
        return jsonify({"msg": "Database error", "error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()


@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email, password = data.get('email'), data.get('password')
    if not email or not password:
        return jsonify({"msg": "Missing fields"}), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({"msg": "Database connection failed"}), 500

    cursor = connection.cursor()
    try:
        cursor.execute("SELECT email, password FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"msg": "User does not exist"}), 401

        stored_hashed_password = user[1].encode('utf-8')
        if bcrypt.checkpw(password.encode('utf-8'), stored_hashed_password):
            access_token = create_access_token(identity=user[0])  # identity = email
            return jsonify(access_token=access_token), 200
        else:
            return jsonify({"msg": "Invalid credentials"}), 401
    except Exception as e:
        traceback.print_exc()
        return jsonify({"msg": "Internal Server Error", "error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()


# Meeting ID generation
@app.route('/get_next_meeting_id', methods=['GET'])
@jwt_required()
def get_next_meeting_id():
    current_user = get_jwt_identity()
    connection = get_db_connection()
    if not connection:
        return jsonify({"msg": "Database connection failed"}), 500
    cursor = connection.cursor()
    try:
        cursor.execute("SELECT MAX(meet_id) FROM summaries WHERE user_email = %s", (current_user,))
        result = cursor.fetchone()
        max_meet_id = result[0] if result and result[0] is not None else 0
        next_meeting_id = max_meet_id + 1
        return jsonify({"next_meeting_id": next_meeting_id}), 200
    except Exception as e:
        return jsonify({"msg": "Error fetching meeting ID", "error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()


# Extractive summarization helper
def extractive_summary(text, num_sentences=3):
    sentences = sent_tokenize(text)
    return ' '.join(sentences[:num_sentences])


# Generate Summary + Optional Bullet Points
@app.route('/get_summary', methods=['POST'])
@jwt_required()
def get_summary():
    data = request.get_json()
    text = data.get('text')
    summary_type = data.get('type')  # 'extractive' or 'abstractive'
    meeting_id = data.get('meeting_id')
    generate_bullets = data.get('generate_bullets', False)
    user_email = get_jwt_identity()

    if not text or not meeting_id:
        return jsonify({"msg": "Text and Meeting ID are required"}), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({"msg": "Database connection failed"}), 500
    cursor = connection.cursor()

    try:
        # Chunk large text
        max_input_length = 1024
        chunk_size = max_input_length - 50
        chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]

        summaries = []
        if summary_type == 'extractive':
            for chunk in chunks:
                summary = extractive_summary(chunk)
                summaries.append(summary)
        else:
            for chunk in chunks:
                result = summarizer(chunk, max_length=130, min_length=30, do_sample=False)
                summaries.append(result[0]['summary_text'])

        final_summary = ' '.join(summaries)

        # Prevent duplicate meeting IDs
        cursor.execute("SELECT 1 FROM summaries WHERE meet_id = %s AND user_email = %s", (meeting_id, user_email))
        if cursor.fetchone():
            return jsonify({"msg": f"Meeting ID {meeting_id} already exists."}), 400

        # Save summary to database
        cursor.execute("INSERT INTO summaries (meet_id, user_email, ptext, summary) VALUES (%s, %s, %s, %s)",
                       (meeting_id, user_email, text, final_summary))
        connection.commit()

        bullet_points_text = ""
        if generate_bullets:
            sentences = text.replace('\n', ' ').split('. ')
            bullet_points_text = '\n'.join([f"• {sentence.strip()}" for sentence in sentences if sentence.strip()])

            # Save bullet points in DB
            cursor.execute("INSERT INTO bullet_points (meet_id, user_email, ptext, bullets) VALUES (%s, %s, %s, %s)",
                           (meeting_id, user_email, text, bullet_points_text))
            connection.commit()

        return jsonify({
            "msg": "Summary generated successfully",
            "summary": final_summary,
            "bullets": bullet_points_text if generate_bullets else None
        }), 200

    except Exception as e:
        connection.rollback()
        traceback.print_exc()
        return jsonify({"msg": "Failed to generate summary", "error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()


# Fetch summaries by user
@app.route('/get_summary_by_id', methods=['GET'])
@jwt_required()
def get_summary_by_id():
    user_email = get_jwt_identity()
    connection = get_db_connection()
    if not connection:
        return jsonify({"msg": "Database connection failed"}), 500
    cursor = connection.cursor()
    try:
        cursor.execute("""
            SELECT s.meet_id, s.ptext, s.summary, b.bullets 
            FROM summaries s 
            LEFT JOIN bullet_points b 
            ON s.meet_id = b.meet_id AND s.user_email = b.user_email
            WHERE s.user_email = %s
        """, (user_email,))

        results = cursor.fetchall()
        if results:
            summaries = [{
                'meeting_id': row[0],
                'ptext': row[1],
                'summary': row[2],
                'bullet_points': row[3] if row[3] else ''
            } for row in results]
            return jsonify({"summaries": summaries}), 200
        else:
            return jsonify({"msg": "No summaries found"}), 404
    except pymysql.MySQLError as e:
        return jsonify({"msg": "Failed to fetch summaries", "error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()


# Generate bullet points (separate endpoint if needed)
@app.route('/get_bullet_points', methods=['POST'])
@jwt_required()
def get_bullet_points():
    data = request.get_json()
    text, meeting_id = data.get('text'), data.get('meeting_id')
    user_email = get_jwt_identity()

    if not text or not meeting_id:
        return jsonify({"msg": "Text and Meeting ID are required"}), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({"msg": "Database connection failed"}), 500
    cursor = connection.cursor()

    try:
        sentences = text.replace('\n', ' ').split('. ')
        bullets = '\n'.join([f"• {sentence.strip()}" for sentence in sentences if sentence.strip()])

        cursor.execute("INSERT INTO bullet_points (meet_id, user_email, ptext, bullets) VALUES (%s, %s, %s, %s)",
                       (meeting_id, user_email, text, bullets))
        connection.commit()

        return jsonify({"msg": "Bullet points generated successfully", "bullets": bullets}), 200
    except Exception as e:
        connection.rollback()
        print("Error generating bullet points:", e)
        return jsonify({"msg": "Failed to generate bullet points", "error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()


# Delete Summary
@app.route('/delete_summary/<int:meeting_id>', methods=['DELETE'])
@jwt_required()
def delete_summary(meeting_id):
    user_email = get_jwt_identity()
    connection = get_db_connection()
    if not connection:
        return jsonify({"msg": "Database connection failed"}), 500
    cursor = connection.cursor()
    try:
        cursor.execute("DELETE FROM summaries WHERE meet_id = %s AND user_email = %s", (meeting_id, user_email))
        connection.commit()
        if cursor.rowcount == 0:
            return jsonify({"msg": "Summary not found or permission denied"}), 404
        return jsonify({"msg": "Summary deleted successfully"}), 200
    except Exception as e:
        connection.rollback()
        return jsonify({"msg": "Failed to delete summary", "error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()


if __name__ == '__main__':
    # Optional: set env vars before run, or keep defaults in code
    # os.environ['DB_PASSWORD'] = 'shaikhfamily'
    app.run(debug=True)
