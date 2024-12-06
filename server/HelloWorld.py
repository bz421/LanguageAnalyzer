import sys
from flask import Flask

app = Flask(__name__)

@app.route('/hello')
def hello_world():
    return {'message': 'Hello from Python backend!'}

if __name__ == '__main__':
    app.run(debug=True)
# def myAdd(a, b):
#     print(f'Adding {a} and {b}!')
#     return a + b
#
# def mySub(a, b):
#     print(f'Subtracting {a} and {b}!')
#     return a - b
#
# def myMul(a, b):
#     print(f'Multiplying {a} and {b}!')
#     return a * b
#
# def myDiv(a, b):
#     if b == 0: return None
#     print(f'Dividing {a} and {b}!')
#     return a / b
#
# o1 = int(sys.argv[1])
# o2 = int(sys.argv[2])
# operation = sys.argv[3]
#
#
# if operation == 'add':
#     print(myAdd(o1, o2))
#     sys.stdout.flush()
# elif operation == 'subtract':
#     print(mySub(o1, o2))
#     sys.stdout.flush()
# elif operation == 'multiply':
#     print(myMul(o1, o2))
#     sys.stdout.flush()
# elif operation == 'divide':
#     print(myDiv(o1, o2))
#     sys.stdout.flush()
# else:
#     print('Invalid')
#     sys.stdout.flush()
