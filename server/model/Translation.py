import requests
from flask import Flask, request, Blueprint
from deep_translator import GoogleTranslator
translator = GoogleTranslator(source='auto', target='en')

translation = Blueprint('translation', __name__)

@translation.route('/api/echo', methods=['POST'])
def echo():
    data = request.get_json()
    if not data or 'message' not in data:
        return {'error': 'No message provided'}, 400
    message = data['message']
    return {'message': message}, 200

@translation.route('/api/translate', methods=['POST'])
def translate():
    data = request.get_json()
    if not data or 'q' not in data:
        return {'error': 'No q provided'}, 400
    params = {
        'client': 'gtx',
        'sl': 'auto',
        'tl': 'en',
        'dt': 't',
        'q': data['q']
    }
    r = requests.get(r'https://translate.googleapis.com/translate_a/single?', params=params)
    result = translator.translate(data['q'])
    language = r.json()[2]
    return {'result': result, 'language': language}, 200


@translation.route('/api/hello')
def hello_world():
    return {'message': 'Hello from Python backend!'}


# if __name__ == '__main__':
#     translation.run(debug=True)
