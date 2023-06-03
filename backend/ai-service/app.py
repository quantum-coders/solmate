from flask import Flask, request, jsonify
from questions import askEmbed
from dotenv import load_dotenv

app = Flask(__name__)
app.config['DEBUG'] = False

@app.route('/ask', methods=['POST'])
def ask():
    try:
        question = request.json['question']
        context = request.json['context']
        res =  askEmbed(question, context)
        response = jsonify({
            'data': res
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    except Exception as e:
        app.logger.error(f"Unexpected error: {e}")
        return jsonify(error=str(e)), 500
