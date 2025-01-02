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

@ChineseBreakdown.route('/api/zh/getVerb', methods=['POST'])
def getVerb():
    data = request.get_json()
    if not data or 'q' not in data:
        return {'error': 'No query provided'}, 400
    d = nlpZH(data['q'])

    verbPhrases = []
    for sent in d.sents:
        for token in sent:
            # Identify verbs
            if token.pos_ == "VERB":
                # Expand to include auxiliary verbs, adverbs, and complements
                start = token.i
                end = token.i

                # Include auxiliary verbs or modifiers to the left
                while start > 0 and d[start - 1].pos_ in {"AUX", "ADV", "PART"}:
                    start -= 1

                # Include complements and particles to the right
                while end < len(d) - 1 and d[end + 1].pos_ in {"ADV", "PART", "SCONJ", "ADP", "NOUN"}:
                    end += 1

                # Extract the span and add it to the list of verb phrases
                span = d[start:end + 1]
                if span.text not in verbPhrases:
                    verbPhrases.append((span.text, span.start_char, span.end_char))

    return {'verbs': verbPhrases}, 200

@ChineseBreakdown.route('/api/zh/getAdj', methods=['POST'])
def getAdjPhrases():
    data = request.get_json()
    if not data or 'q' not in data:
        return {'error': 'No query provided'}, 400
    d = nlpZH(data['q'])

    adjectivePhrases = []
    for sent in d.sents:
        for token in sent:
            # Identify adjectives
            if token.pos_ in {"ADJ", 'NUM'}:
                # print(token.text)
                # Expand to include adverbs or intensifiers to the left
                start = token.i
                end = token.i

                # Include modifiers or intensifiers to the left
                while start > 0 and d[start - 1].pos_ in {"ADV", "PART"}:
                    start -= 1

                # Include complements or particles to the right
                while end < len(d) - 1 and d[end + 1].pos_ in {"PART", "ADP", "SCONJ"}:
                    end += 1

                # Extract the span and add it to the list of adjective phrases
                span = d[start:end + 1]
                if (span.text, start, end + 1) not in adjectivePhrases:
                    adjectivePhrases.append((span.text, span.start_char, span.end_char))

    return {'adjectives': adjectivePhrases}, 200

@ChineseBreakdown.route('/api/zh/getBaConstructions', methods=['POST'])
def getBaConstructions():
    data = request.get_json()
    if not data or 'q' not in data:
        return {'error': 'No query provided'}, 400
    d = nlpZH(data['q'])

    baConstructions = []
    for sent in d.sents:
        for token in sent:
            # Identify "把" tokens
            if token.text == "把" and token.dep_ == "aux:ba":
                ba_entry = {"subject": None, "object": None, "verb": None}
                # Find verb and its subject
                for ancestor in token.ancestors:
                    if ancestor.pos_ == "VERB":
                        ba_entry["verb"] = (ancestor.text, ancestor.idx, ancestor.idx + len(ancestor.text))
                        for sub in ancestor.children:
                            if sub.dep_ == "nsubj":
                                ba_entry["subject"] = (sub.text, sub.idx, sub.idx + len(sub.text))
                                break
                        break

                # Find object
                for descendant in token.head.children:
                    if descendant.dep_ in {"dobj", "dep"}:
                        ba_entry["object"] = (descendant.text, descendant.idx, descendant.idx + len(descendant.text))
                        break

                baConstructions.append(ba_entry)

    return {'baConstructions': baConstructions}, 200

@ChineseBreakdown.route('/api/zh/getBeiConstructions', methods=['POST'])
def getBeiConstruction():
    data = request.get_json()
    if not data or 'q' not in data:
        return {'error': 'No query provided'}, 400
    d = nlpZH(data['q'])

    beiConstructions = []
    for sent in d.sents:
        for token in sent:
            # Identify "被" tokens
            if token.text == "被" and token.dep_ == "auxpass":
                bei_entry = {"subject": None, "object": None, "verb": None}
                # Find verb and its subject
                for ancestor in token.ancestors:
                    if ancestor.pos_ == "VERB":
                        bei_entry["verb"] = (ancestor.text, ancestor.idx, ancestor.idx + len(ancestor.text))
                        for sub in ancestor.children:
                            if sub.dep_ == "nsubj":
                                bei_entry["subject"] = (sub.text, sub.idx, sub.idx + len(sub.text))
                                break
                        break

                # Find agent (object)
                countSubj = 0
                for descendant in token.head.children:
                    print(descendant.text)
                    if descendant.dep_ == 'nsubjpass':
                        bei_entry["object"] = (descendant.text, descendant.idx, descendant.idx + len(descendant.text))
                        break
                    elif descendant.dep_ == 'nsubj':
                        print('nsubj got here', descendant.text)
                        countSubj += 1
                        if countSubj == 1: continue

                        print('trying', descendant.text)
                        bei_entry["object"] = (descendant.text, descendant.idx, descendant.idx + len(descendant.text))
                        break

                beiConstructions.append(bei_entry)

    return {'beiConstructions': beiConstructions}, 200

# TODO: Special handling for "de"(all 3 types)
@ChineseBreakdown.route('/api/zh/getParticles', methods=['POST'])
def getParticles():
    data = request.get_json()
    if not data or 'q' not in data:
        return {'error': 'No query provided'}, 400
    d = nlpZH(data['q'])

    particles = []
    # Iterate through tokens in the document
    for sent in d.sents:
        for token in sent:
            if token.pos_ == "PART":
                particles.append((token.text, token.idx, token.idx + len(token.text)))

    return {'particles': particles}, 200

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
