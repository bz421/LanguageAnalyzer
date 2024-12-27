import spacy
from spacy.tokens import Span
from spacy.util import filter_spans

from flask import Flask, request
from flask import Blueprint

import csv

ChineseBreakdown = Blueprint('ChineseBreakdown', __name__)

from spacy.matcher import Matcher
nlpZH = spacy.load('zh_core_web_trf')

"""
Check language.js for info on the return types of the functions below
"""

def remap_keys(mapping):
    return [{'key': k, 'value': v} for k, v in mapping.items()]

@ChineseBreakdown.route('/api/zh/getSubj', methods=['POST'])
def getSubjectPhrase():
    data = request.get_json()
    print('Subject:' + str(data))
    if not data or 'q' not in data:
        return {'error': 'No query provided'}, 400
    d = nlpZH(data['q'])

    matcher = Matcher(nlpZH.vocab)
    subjectPattern = [
        [
            {'DEP': 'det', 'OP': '?'},  # Determiner
            {'DEP': {'IN': ['amod', 'nmod:assmod']}, 'OP': '*'},  # adjectival modifiers
            {'DEP': 'case', 'POS': 'PART', 'OP': '?'},  # Case particle
            {'POS': {'IS_SUBSET': ['NOUN', 'ADJ', 'DET', 'PRON']}, 'DEP': 'nsubj'},  # Subject
            {'POS': 'ADJ', 'OP': '*'}  # Optional adjectives
        ],
        [
            {'DEP': 'det', 'OP': '?'},  # Determiner
            {'DEP': {'IN': ['amod', 'nmod:assmod']}, 'OP': '*'},  # adjectival modifiers
            {'POS': 'ADJ', 'OP': '*'},  # Optional adjectives
            {'DEP': 'case', 'POS': 'PART', 'OP': '?'},  # Case particle
            {'POS': 'PROPN', 'DEP': 'nsubj'},  # Subject(proper noun)
            {'POS': 'PROPN', 'DEP': 'flat', 'OP': '*'},  # The rest of the proper noun(e.g. full names)
        ],
    ]
    matcher.add('Subject', subjectPattern)
    matches = matcher(d)
    spans = [d[start:end] for _, start, end, in matches]
    filtered = filter_spans(spans)
    filtered = [(str(f), f.start, f.end) for f in filtered]

    return {'subjects': filtered}, 200

# TODO: Create getAdj

# TODO: Create getVerb

# TODO: Create getObj

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
