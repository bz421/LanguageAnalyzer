import csv

import spacy
from flask import Blueprint
from flask import request
from spacy.util import filter_spans
from spacy.tokens import Span

from pypinyin import slug, Style

ChineseBreakdown = Blueprint('ChineseBreakdown', __name__)

from spacy.matcher import Matcher
nlpZH = spacy.load('zh_core_web_trf')

'''
Check language.js for info on the return types of the functions below
'''

def remap_keys(mapping):
    return [{'key': k, 'value': v} for k, v in mapping.items()]

@ChineseBreakdown.route('/api/zh/pinyin', methods=['POST'])
def pinyinize():
    data = request.get_json()
    if not data or 'q' not in data:
        return {'error': 'No query provided'}, 400
    out = slug(data['q'], style=Style.TONE, separator=' ')
    return {'pinyin': out}, 200

@ChineseBreakdown.route('/api/zh/getSubj', methods=['POST'])
def getSubjectPhrase():
    data = request.get_json()
    print('Subject:' + str(data))
    if not data or 'q' not in data:
        return {'error': 'No query provided'}, 400
    d = nlpZH(data['q'])

    subjectPhrases = []
    for sent in d.sents:
        for token in sent:
            # Identify subjects
            if token.dep_ == 'nsubj' or (token.head.text == '有' and token.dep_ == 'dep'):
                start = token.i
                end = token.i

                # Include modifiers or compounds to the left
                while start > 0 and d[start - 1].dep_ in {'amod', 'compound', 'det', 'nummod', 'nmod:assmod'}:
                    start -= 1

                # Include complements to the right
                while end < len(d) - 1 and d[end + 1].dep_ in {'case', 'nummod', 'clf'}:
                    end += 1

                # Extract the span and add it to the list of subject phrases
                span = d[start:end + 1]
                if (span.text, start, end + 1) not in subjectPhrases:
                    subjectPhrases.append((span.text, span.start_char, span.end_char))

    return {'subjects': subjectPhrases}, 200

# TODO: Create getVerb

# TODO: Create getAdj

# TODO: Create getBaConstruction

# TODO: Create getBeiConstruction

# TODO: Create getParticles

def findChengyu(string : str):
    with open('Texts/Chengyu.csv', encoding='utf8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if string == row['chengyu_sim'] or string == row['chengyu_trad']:
                return dict(row)
    return None

@ChineseBreakdown.route('/api/zh/getChengyu', methods=['POST'])
def getChengyu():
    data = request.get_json()
    if not data or 'q' not in data:
        return {'error': 'No query provided'}, 400
    d = nlpZH(data['q'])

    out = list()
    for token in d:
        chengyuDict = findChengyu(token.text)
        if chengyuDict:
            out.append(chengyuDict)

    print(out)
    return {'chengyu': out}, 200

print('Ready Chinese')
