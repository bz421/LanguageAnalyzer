from typing import Tuple, Dict, List

import spacy
from spacy import displacy
from spacy.tokens import Span
from spacy.util import filter_spans

from flask import Flask, request
from flask import Blueprint

SpanishBreakdown = Blueprint('SpanishBreakdown', __name__)

from spacy.matcher import Matcher

nlpES = spacy.load('es_dep_news_trf')

"""
Check language.js for info on the return types of the functions below
"""

spanishPronoun = {
    ('1', 'Sing'): 'yo',
    ('2', 'Sing'): 'tú',
    ('3', 'Sing'): 'él/ella/usted',
    ('1', 'Plur'): 'nosotros/nosotras',
    ('3', 'Plur'): 'ellos/ellas/ustedes'
}


def remap_keys(mapping):
    return [{'key': k, 'value': v} for k, v in mapping.items()]


def getImplicitSubjects(d):
    implicitPattern = [
        [
            {'POS': 'VERB', 'DEP': 'ROOT', 'MORPH': {'IS_SUPERSET': ['VerbForm=Fin']}}
            # Conjugated verb with dropped pronoun
        ],
        [
            {'LEMMA': 'ser', 'MORPH': {'IS_SUPERSET': ['VerbForm=Fin']}}  # Ser edge case
        ]
    ]

    matcher = Matcher(nlpES.vocab)
    matcher.add('ImplicitSubject', implicitPattern)
    matches = matcher(d)
    spans = [d[start:end] for _, start, end in matches]
    filtered = filter_spans(spans)
    filtered = [(str(f), f.start, f.end) for f in filtered]

    mapping = dict()
    for f in filtered:
        for token in d:
            if token.text == f[0]:
                mapping[f[0]] = token
                break
    out = []
    idx = 0
    for string in mapping:
        text = mapping[string].text
        person = spanishPronoun[(mapping[string].morph.get('Person')[0]), (mapping[string].morph.get('Number')[0])]
        out.append(('(' + person + ') ' + text, filtered[idx][1], filtered[idx][2]))
        idx += 1
    return out


@SpanishBreakdown.route('/api/es/getSubj', methods=['POST'])
def getSubjectPhrase():
    data = request.get_json()
    print('Subject:' + str(data))
    if not data or 'q' not in data:
        return {'error': 'No query provided'}, 400
    d = nlpES(data['q'])

    matcher = Matcher(nlpES.vocab)
    subjectPattern = [
        [
            {'DEP': 'det', 'OP': '?'},  # Determiner
            {'DEP': 'amod', 'OP': '*'},  # adjectival modifiers
            {'POS': {'IS_SUBSET': ['NOUN', 'ADJ', 'DET', 'PRON']}, 'DEP': 'nsubj'},  # Subject
            {'POS': 'ADJ', 'OP': '*'}  # Optional adjectives
        ],
        [
            {'DEP': 'det', 'OP': '?'},  # Determiner
            {'DEP': 'amod', 'OP': '*'},  # adjectival modifiers
            {'POS': 'PROPN', 'DEP': 'nsubj'},  # Subject(proper noun)
            {'POS': 'PROPN', 'DEP': 'flat', 'OP': '*'},  # The rest of the proper noun(e.g. full names)
            {'POS': 'ADJ', 'OP': '*'}  # Optional adjectives
        ]
    ]
    matcher.add('Subject', subjectPattern)
    matches = matcher(d)
    spans = [d[start:end] for _, start, end, in matches]
    filtered = filter_spans(spans)
    filtered = [(str(f), f.start, f.end) for f in filtered]
    filtered += getImplicitSubjects(d)

    return {'subjects': filtered}, 200


@SpanishBreakdown.route('/api/es/getVerb', methods=['POST'])
def getVerbPhrases():
    data = request.get_json()
    if not data or 'q' not in data:
        return {'error': 'No query provided'}, 400
    d = nlpES(data['q'])

    verbPattern = [
        {'POS': 'PRON', 'DEP': 'expl:pv', 'OP': '?'},
        # Reflexive pronoun in front of main verb (sometimes doesn't work)
        {'POS': 'VERB', 'OP': '?'},  # Auxiliary, helping verbs
        {'POS': 'ADV', 'OP': '*'},  # Auxiliary adjectives
        {'POS': 'AUX', 'OP': '*'},  # Other auxiliary verbs
        {'POS': {'IN': ['VERB', 'AUX']}, 'OP': '+'}  # Main verb
    ]
    matcher = Matcher(nlpES.vocab)
    matcher.add('Verb phrases', [verbPattern])
    matches = matcher(d)
    spans = [d[start:end] for _, start, end in matches]
    filtered = filter_spans(spans)
    out = dict()

    for f in filtered:
        for token in f:
            if token.pos_ == 'VERB':
                form = token.morph.get('VerbForm', ['Not applicable'])
                mood = token.morph.get('Mood', ['Not applicable'])
                tense = token.morph.get('Tense', ['Not applicable'])
                person = token.morph.get('Person', ['Not applicable'])
                number = token.morph.get('Number', ['Not applicable'])
                try:
                    out[(token.text, token.i)].append((form, mood, tense, person, number))
                except:
                    out[(token.text, token.i)] = []
                    out[(token.text, token.i)].append((form, mood, tense, person, number))

    return {'verbs': remap_keys(out)}, 200


@SpanishBreakdown.route('/api/es/getAdj', methods=['POST'])
def getAdjPhrases():
    data = request.get_json()
    if not data or 'q' not in data:
        return {'error': 'No query provided'}, 400
    d = nlpES(data['q'])

    adjectivePattern = [
        [
            {'POS': 'ADV', 'DEP': 'advmod', 'OP': '?'},  # optional adverb(modifier for adjective)
            {'POS': 'ADJ', 'DEP': {'IN': ['amod', 'advmod']}, 'OP': '+'},  # adjective
        ],
        [
            {'POS': 'ADV', 'DEP': 'advmod', 'OP': '?'},  # optional adverb(modifier for adjective)
            {'POS': 'ADV', 'DEP': {'IN': ['amod', 'advmod']}, 'OP': '+'},  # adverb
        ],
        [
            {'POS': 'DET', 'DEP': 'det', 'OP': '*'},
            {'POS': 'NOUN', 'DEP': 'obl'},
        ],
        [
            {'POS': 'ADP', 'DEP': 'case'},  # optional adposition
            {'POS': 'NOUN', 'DEP': {'IN': ['obl', 'obl:mod']}}  # optional noun modifier
        ],
        [
            {'POS': 'ADP', 'DEP': 'case'},  # optional adposition
            {'POS': 'DET', 'DEP': 'det'},  # optional determiner
            {'POS': 'NOUN', 'DEP': {'IN': ['obl', 'obl:mod']}}  # optional noun modifier
        ],
        [
            {'POS': 'ADP', 'DEP': 'case'},  # optional adposition
            {'POS': 'NUM', 'DEP': 'nummod'},  # optional number modifier
            {'POS': 'NOUN', 'DEP': {'IN': ['obl', 'obl:mod']}}  # optional noun modifier
        ]
    ]

    cconjPatterns = [
        [
            {'POS': 'CCONJ', 'DEP': 'cc'},  # CCONJ
            {'POS': 'ADV', 'DEP': 'advmod', 'OP': '?'},  # optional adverb(modifier for adjective)
            {'POS': 'ADJ', 'OP': '+'},  # adjective
        ],
        [
            {'POS': 'CCONJ', 'DEP': 'cc'},  # CCONJ
            {'POS': 'ADV', 'DEP': 'advmod', 'OP': '?'},  # optional adverb(modifier for adjective)
            {'POS': 'ADJ', 'DEP': 'advmod', 'OP': '+'},  # adverb
        ]
    ]
    advMatcher = Matcher(nlpES.vocab)
    advMatcher.add('Adjective phrases', adjectivePattern)
    matches = advMatcher(d)
    spans = [d[start:end] for _, start, end in matches]

    filtered = filter_spans(spans)

    cconjMatcher = Matcher(nlpES.vocab)
    cconjMatcher.add('Conjuntive phrases', cconjPatterns)
    matches = cconjMatcher(d)
    spans = [d[start:end] for _, start, end in matches]

    filtered += filter_spans(spans)

    filtered = [(str(f), f.start, f.end) for f in filtered]

    print(filtered)
    return {'adjectives': filtered}, 200


@SpanishBreakdown.route('/api/es/getObj', methods=['POST'])
def getObjects():
    data = request.get_json()
    print('Object: ' + str(data))
    if not data or 'q' not in data:
        return {'error': 'No query provided'}, 400
    d = nlpES(data['q'])

    matcher = Matcher(nlpES.vocab)
    objectPattern = [
        [
            {'POS': 'ADP', 'OP': '?'},
            {'POS': 'DET', 'OP': '?'},
            {'POS': 'NUM', 'DEP': 'nummod', 'OP': '?'},  # number modifier
            {'POS': 'NOUN', 'DEP': {'IN': ['obj', 'nsubj']}, 'OP': '*'},  # noun being modified
            {'POS': 'ADV', 'DEP': 'advmod', 'OP': '?'},  # optional adverb(modifier for adjective)
            {'POS': 'ADJ', 'DEP': 'amod', 'OP': '*'},  # adjective
            {'POS': 'PRON', 'DEP': {'IN': ['obj', 'iobj']}, 'OP': '*'},  # final pronoun
            {'POS': 'ADP', 'DEP': 'case', 'OP': '?'},  # optional adposition
            {'POS': 'NOUN', 'DEP': 'nmod', 'OP': '?'}  # optional noun modifier
        ]
    ]
    matcher.add('Object', objectPattern)
    matches = matcher(d)
    spans = [d[start:end] for _, start, end, in matches]
    filtered = filter_spans(spans)

    out = dict()
    idx = 0
    for f in filtered:
        for token in f:
            if token.dep_ in ['obj', 'iobj']:
                head = token.head
                try:
                    out[(head.text, head.i)].append((filtered[idx].text, filtered[idx].start, filtered[idx].end))
                except:
                    out[(head.text, head.i)] = []
                    out[(head.text, head.i)].append((filtered[idx].text, filtered[idx].start, filtered[idx].end))

        idx += 1
    # print('Object before remapping: ' + str(out))
    print('Object after remapping: ' + str(remap_keys(out)))
    return {'objects': remap_keys(out)}, 200


print('Ready Spanish')
# Mi mamá alta quiere bailar con sus mejores amigas.
