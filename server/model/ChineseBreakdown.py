import csv

import spacy
from flask import Blueprint
from flask import request
from spacy.util import filter_spans
from spacy.tokens import Span

from pypinyin import slug, Style, pinyin

ChineseBreakdown = Blueprint('ChineseBreakdown', __name__)

from spacy.matcher import Matcher
nlpZH = spacy.load('zh_core_web_trf')

'''
Check language.js for info on the return types of the functions below
'''

def remap_keys(mapping):
    return [{'key': k, 'value': v} for k, v in mapping.items()]

def pinyinize(text):
    return pinyin(text)

def getSubjectPhrase(d):
    subjectPhrases = []
    for sent in d.sents:
        for token in sent:
            if token.dep_ == 'nsubj' or (token.head.text == '有' and token.dep_ == 'dep'):
                start = token.i
                end = token.i
                while start > 0 and d[start - 1].dep_ in {'amod', 'compound', 'det', 'nummod', 'nmod:assmod'}:
                    start -= 1
                while end < len(d) - 1 and d[end + 1].dep_ in {'case', 'nummod', 'clf'}:
                    end += 1
                span = d[start:end + 1]
                if (span.text, start, end + 1) not in subjectPhrases:
                    subjectPhrases.append((span.text, span.start, span.end))
    return {'subjects': subjectPhrases}

    return {'subjects': subjectPhrases}

def getVerb(d):
    verbPhrases = []
    for sent in d.sents:
        for token in sent:
            if token.pos_ == "VERB":
                start = token.i
                end = token.i
                while start > 0 and d[start - 1].pos_ in {"AUX", "ADV", "PART"}:
                    start -= 1
                while end < len(d) - 1 and d[end + 1].pos_ in {"ADV", "PART", "SCONJ", "ADP", "NOUN"}:
                    end += 1
                span = d[start:end + 1]
                if span.text not in verbPhrases:
                    verbPhrases.append((span.text, span.start, span.end))
    return {'verbs': verbPhrases}

def getAdjPhrases(d):
    adjectivePhrases = []
    for sent in d.sents:
        for token in sent:
            if token.pos_ in {"ADJ", 'NUM'}:
                start = token.i
                end = token.i
                while start > 0 and d[start - 1].pos_ in {"ADV", "PART"}:
                    start -= 1
                while end < len(d) - 1 and d[end + 1].pos_ in {"PART", "ADP", "SCONJ"}:
                    end += 1
                span = d[start:end + 1]
                if (span.text, start, end + 1) not in adjectivePhrases:
                    adjectivePhrases.append((span.text, span.start, span.end))
    return {'adjectives': adjectivePhrases}

def getBaConstructions(d):
    baConstructions = []
    for sent in d.sents:
        for token in sent:
            if token.text == "把" and token.dep_ == "aux:ba":
                ba_entry = {'ba': (token.i, token.i + 1), "subject": None, "object": None, "verb": None}
                for ancestor in token.ancestors:
                    if ancestor.pos_ == "VERB":
                        ba_entry["verb"] = (ancestor.text, ancestor.i, ancestor.i + 1)
                        for sub in ancestor.children:
                            if sub.dep_ == "nsubj":
                                ba_entry["subject"] = (sub.text, sub.i, sub.i + 1)
                                break
                        break
                for descendant in token.head.children:
                    if descendant.dep_ in {"dobj", "dep"}:
                        ba_entry["object"] = (descendant.text, descendant.i, descendant.i + 1)
                        break
                baConstructions.append(ba_entry)
    return {'baConstructions': baConstructions}

def getBeiConstruction(d):
    beiConstructions = []
    for sent in d.sents:
        for token in sent:
            if token.text == "被" and token.dep_ == "auxpass":
                bei_entry = {'bei': (token.i, token.i + 1), "subject": None, "object": None, "verb": None}
                for ancestor in token.ancestors:
                    if ancestor.pos_ == "VERB":
                        bei_entry["verb"] = (ancestor.text, ancestor.i, ancestor.i + 1)
                        for sub in ancestor.children:
                            if sub.dep_ == "nsubj":
                                bei_entry["subject"] = (sub.text, sub.i, sub.i + 1)
                                break
                        break
                countSubj = 0
                for descendant in token.head.children:
                    if descendant.dep_ == 'nsubjpass':
                        bei_entry["object"] = (descendant.text, descendant.i, descendant.i + 1)
                        break
                    elif descendant.dep_ == 'nsubj':
                        countSubj += 1
                        if countSubj == 1: continue
                        bei_entry["object"] = (descendant.text, descendant.i, descendant.i + 1)
                        break
                beiConstructions.append(bei_entry)
    return {'beiConstructions': beiConstructions}

# TODO: Special handling for "de"(all 3 types)
def getParticles(d):
    particles = []
    for sent in d.sents:
        for token in sent:
            if token.pos_ == "PART":
                particles.append((token.text, token.i, token.i + 1))
    return {'particles': particles}

def findChengyu(string : str):
    with open('Texts/Chengyu.csv', encoding='utf8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if string == row['chengyu_sim'] or string == row['chengyu_trad']:
                return dict(row)
    return None

def getChengyu(d):
    out = list()
    for token in d:
        chengyuDict = findChengyu(token.text)
        if chengyuDict:
            out.append((chengyuDict, token.i, token.i + 1))
    return {'chengyu': out}

@ChineseBreakdown.route('/api/zh/getData', methods=['POST'])
def getData():
    data = request.get_json()
    if not data or 'q' not in data:
        return {'error': 'No query provided'}, 400
    doc = nlpZH(data['q'])

    tokenized = [token.text for token in nlpZH(data['q'])]
    print(tokenized)

    Pinyin = pinyinize(data['q'])
    subjects = getSubjectPhrase(doc)
    verbs = getVerb(doc)
    adjectives = getAdjPhrases(doc)
    baConstructions = getBaConstructions(doc)
    beiConstructions = getBeiConstruction(doc)
    particles = getParticles(doc)
    chengyu = getChengyu(doc)

    print("Pinyin:", pinyinize(data['q']))
    print("Subjects:", getSubjectPhrase(doc))
    print("Verbs:", getVerb(doc))
    print("Adjectives:", getAdjPhrases(doc))
    print("Ba Constructions:", getBaConstructions(doc))
    print("Bei Constructions:", getBeiConstruction(doc))
    print("Particles:", getParticles(doc))
    print("Chengyu:", getChengyu(doc))

    out = {'sentence': data['q'], 'tokens': []}
    for token in tokenized:
        out['tokens'].append(
            {'text': token, 'pinyin': '', 'tags': [], 'baSubjects': [], 'beiSubjects': [], 'baObjects': [], 'beiObjects': [], 'baVerbs': [], 'beiVerbs': [], 'chengyuIndex': None}
        )

    pinyinI = 0
    for (idx, token) in enumerate(out['tokens']):
        # print(i, len(token['text']))
        token['pinyin'] = Pinyin[pinyinI:pinyinI + len(token['text'])]
        pinyinI += len(token['text'])

    for text, begin, end in subjects['subjects']:
        for i in range(begin, end):
            print(i, text)
            out['tokens'][i]['tags'].append('subject')

    for text, begin, end in verbs['verbs']:
        for i in range(begin, end):
            out['tokens'][i]['tags'].append('verb')

    for text, begin, end in adjectives['adjectives']:
        for i in range(begin, end):
            out['tokens'][i]['tags'].append('adjective')

    for text, begin, end in particles['particles']:
        for i in range(begin, end):
            out['tokens'][i]['tags'].append('particle')

    for entry in chengyu['chengyu']:
        for i in range(entry[1], entry[2]):
            out['tokens'][i]['tags'].append('chengyu')
            out['tokens'][i]['chengyuIndex'] = entry[0]['idx']

    for entry in baConstructions['baConstructions']:
        for i in range(entry['ba'][0], entry['ba'][1]):
            out['tokens'][i]['tags'].append('baParticle')
            out['tokens'][i]['baVerbs'].append((entry['verb'][1], entry['verb'][2]))
            out['tokens'][i]['baSubjects'].append((entry['subject'][1], entry['subject'][2]))
            out['tokens'][i]['baObjects'].append((entry['object'][1], entry['object'][2]))
        for i in range(entry['verb'][1], entry['verb'][2]):
            out['tokens'][i]['tags'].append('baVerb')
            out['tokens'][i]['baSubjects'].append((entry['subject'][1], entry['subject'][2]))
            out['tokens'][i]['baObjects'].append((entry['object'][1], entry['object'][2]))
        for i in range(entry['subject'][1], entry['subject'][2]):
            out['tokens'][i]['tags'].append('baSubject')
        for i in range(entry['object'][1], entry['object'][2]):
            out['tokens'][i]['tags'].append('baObject')

    for entry in beiConstructions['beiConstructions']:
        for i in range(entry['bei'][0], entry['bei'][1]):
            out['tokens'][i]['tags'].append('beiParticle')
            out['tokens'][i]['beiVerbs'].append((entry['verb'][1], entry['verb'][2]))
            out['tokens'][i]['beiSubjects'].append((entry['subject'][1], entry['subject'][2]))
            out['tokens'][i]['beiObjects'].append((entry['object'][1], entry['object'][2]))
        for i in range(entry['verb'][1], entry['verb'][2]):
            out['tokens'][i]['tags'].append('beiVerb')
            out['tokens'][i]['beiSubjects'].append((entry['subject'][1], entry['subject'][2]))
            out['tokens'][i]['beiObjects'].append((entry['object'][1], entry['object'][2]))
        for i in range(entry['subject'][1], entry['subject'][2]):
            out['tokens'][i]['tags'].append('beiSubject')
        for i in range(entry['object'][1], entry['object'][2]):
            out['tokens'][i]['tags'].append('beiObject')

    # for entry in beiConstructions['beiConstructions']:
    #     for i in range(entry['bei'][0], entry['bei'][1]):
    #         out['tokens'][i]['tags'].append('beiParticle')
    #     for i in range(entry['verb'][1], entry['verb'][2]):
    #         out['tokens'][i]['tags'].append('beiVerb')
    #         out['tokens'][i]['beiSubjects'].append((entry['subject'][1], entry['subject'][2]))
    #         out['tokens'][i]['beiObjects'].append((entry['object'][1], entry['object'][2]))
    #     for i in range(entry['subject'][1], entry['subject'][2]):
    #         out['tokens'][i]['tags'].append('beiSubject')
    #     for i in range(entry['object'][1], entry['object'][2]):
    #         out['tokens'][i]['tags'].append('beiObject')

    return out, 200

print('Ready Chinese')
