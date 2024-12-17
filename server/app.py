from flask import Blueprint, Flask
from model import SpanishBreakdown, translation

app = Flask(__name__)

app.register_blueprint(SpanishBreakdown)
app.register_blueprint(translation)

if __name__ == '__main__':
    app.run(debug=True)
