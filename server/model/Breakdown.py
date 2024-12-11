from typing import Tuple, Dict, List

import spacy
from spacy import displacy
from spacy.tokens import Span
from spacy.util import filter_spans

from flask import Flask, request
from flask import Blueprint

breakdown = Blueprint('breakdown', __name__)

from spacy.matcher import Matcher
nlpES = spacy.load('es_dep_news_trf')

@breakdown.route('/api/getSubj', methods=['POST'])
def getSubjectPhrase() -> tuple[dict[str, str], int] | tuple[dict[str, list[str]], int]:
    data = request.get_json()
    if not data or 'q' not in data:
        return {'error': 'No query provided'}, 400
    d = nlpES(data['q'])

    matcher = Matcher(nlpES.vocab)
    subjectPattern = [
        [
            {'DEP': 'det', 'OP': '?'},  # Determiner
            {'DEP': 'amod', 'OP': '*'}, # adjectival modifiers
            {'POS': 'NOUN', 'DEP': 'nsubj'},  # Subject
            {'POS': 'ADJ', 'OP': '*'}  # Optional adjectives
        ],
        [
            {'DEP': 'det', 'OP': '?'},  # Determiner
            {'DEP': 'amod', 'OP': '*'},  # adjectival modifiers
            {'POS': 'PRON', 'DEP': 'nsubj'},  # Subject(pronoun)
            {'POS': 'ADJ', 'OP': '*'}  # Optional adjectives
        ],
        [
            {'DEP': 'det', 'OP': '?'},  # Determiner
            {'DEP': 'amod', 'OP': '*'},  # adjectival modifiers
            {'POS': 'PROPN', 'DEP': 'nsubj'},  # Subject(proper noun)
            {'POS': 'PROPN', 'DEP': 'flat', 'OP': '*'}, # The rest of the proper noun(e.g. full names)
            {'POS': 'ADJ', 'OP': '*'}  # Optional adjectives
        ]
    ]
    matcher.add('Subject', subjectPattern)
    matches = matcher(d)
    spans = [d[start:end] for _, start, end, in matches]
    filtered = filter_spans(spans)
    filtered = [str(f) for f in filtered]

    return {'subjects': filtered}, 200


# 'to be' is a copula when predicative, otherwise it is auxiliary. It is never a verb.
# TODO: Search for and attach objects to verbs
@breakdown.route('/api/getVerb', methods=['POST'])
def getVerbPhrases() -> tuple[dict[str, str], int] | tuple[dict[str, list[str]], int]:
    data = request.get_json()
    if not data or 'q' not in data:
        return {'error': 'No query provided'}, 400
    d = nlpES(data['q'])

    verbPattern = [
        {'POS': 'PRON', 'DEP': 'expl:pv', 'OP': '?'}, # Reflexive pronoun in front of main verb (sometimes doesn't work)
        {'POS': 'VERB', 'OP': '?'},  # Auxiliary, helping verbs
        {'POS': 'ADV', 'OP': '*'},  # Auxiliary adjectives
        {'POS': 'AUX', 'OP': '*'},  # Other auxiliary verbs
        {'POS': 'VERB', 'OP': '+'}  # Main verb
    ]
    matcher = Matcher(nlpES.vocab)
    matcher.add('Verb phrases', [verbPattern])
    matches = matcher(d)
    spans = [d[start:end] for _, start, end in matches]
    filtered = filter_spans(spans)
    filtered = [str(f) for f in filtered]

    return {'verbs': filtered}, 200

@breakdown.route('/api/getAdj', methods=['POST'])
def getAdvPhrases() -> tuple[dict[str, str], int] | tuple[dict[str, list[str]], int]:
    data = request.get_json()
    if not data or 'q' not in data:
        return {'error': 'No query provided'}, 400
    d = nlpES(data['q'])

    adjectivePattern = [
        [
            {'POS': 'ADV', 'DEP': 'advmod', 'OP': '?'}, # optional adverb(modifier for adjective)
            {'POS': 'ADJ', 'DEP': 'amod', 'OP': '+'} # adjective
        ],
        [
            {'POS': 'ADV', 'DEP': 'advmod', 'OP': '?'},  # optional adverb(modifier for adjective)
            {'POS': 'ADV', 'DEP': 'advmod', 'OP': '+'}  # adverb
        ]
    ]
    matcher = Matcher(nlpES.vocab)
    matcher.add('Adjective phrases', adjectivePattern)
    matches = matcher(d)
    spans = [d[start:end] for _, start, end in matches]
    filtered = filter_spans(spans)
    filtered = [str(f) for f in filtered]

    return {'adjectives': filtered}, 200

print('Ready')

# if __name__ == '__main__':
#     app.run(debug=True)
    # while True:
    #     doc = nlpES(input())
    #     print(f'Subjects: {getSubjectPhrase(doc)}')
    #     print(f'Verb Phrases: {getVerbPhrases(doc)}')
    #     print(f'Adjective Phrases: {getAdvPhrases(doc)}')

# Mi mamá alta quiere bailar con sus mejores amigas.