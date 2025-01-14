import spacy
from flask import Blueprint
from flask import request
from spacy.util import filter_spans
from deep_translator import GoogleTranslator

FrenchBreakdown = Blueprint('FrenchBreakdown', __name__)
translator = GoogleTranslator(source='fr', target='en')

from spacy.matcher import Matcher
nlpFR = spacy.load('fr_dep_news_trf')

"""
Check language.js for info on the return types of the functions below
"""

frenchPronoun = {
    ('1', 'Sing'): 'je',
    ('2', 'Sing'): 'tu',
    ('3', 'Sing'): 'il/elle/on',
    ('1', 'Plur'): 'nous',
    ('2', 'Plur'): 'vous',
    ('3', 'Plur'): 'ils/elles'
}

def remap_keys(mapping):
    return [{'key': k, 'value': v} for k, v in mapping.items()]

def getImplicitSubjects(d):
    implicitPattern = [
        [
            {'POS': 'VERB', 'DEP': 'ROOT', 'MORPH': {'IS_SUPERSET': ['VerbForm=Fin']}} # Conjugated verb with dropped pronoun
        ],
        [
            {'LEMMA': 'être', 'MORPH': {'IS_SUPERSET': ['VerbForm=Fin']}}  # Ser edge case
        ]
    ]

    matcher = Matcher(nlpFR.vocab)
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
        person = frenchPronoun[(mapping[string].morph.get('Person')[0]), (mapping[string].morph.get('Number')[0])]
        out.append(('(' + person + ') ' + text, filtered[idx][1], filtered[idx][2]))
        idx+=1
    return out

def getSubjectPhrase(d):
    matcher = Matcher(nlpFR.vocab)
    subjectPattern = [
        [
            {'DEP': 'det', 'OP': '?'},  # Determiner
            {'DEP': 'amod', 'OP': '*'}, # adjectival modifiers
            {'POS': {'IS_SUBSET' : ['NOUN', 'ADJ', 'DET', 'PRON']}, 'DEP': 'nsubj'},  # Subject
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
    filtered = [(str(f), f.start, f.end) for f in filtered]
    filtered += getImplicitSubjects(d)

    return {'subjects': filtered}


def getVerbPhrases(d):

    verbPattern = [
        {'POS': 'PRON', 'DEP': 'expl:pv', 'OP': '?'}, # Reflexive pronoun in front of main verb (sometimes doesn't work)
        {'POS': 'VERB', 'OP': '?'},  # Auxiliary, helping verbs
        {'POS': 'ADV', 'OP': '*'},  # Auxiliary adjectives
        {'POS': 'AUX', 'OP': '*'},  # Other auxiliary verbs
        {'POS': {'IN': ['VERB', 'AUX']}, 'OP': '+'}  # Main verb
    ]
    matcher = Matcher(nlpFR.vocab)
    matcher.add('Verb phrases', [verbPattern])
    matches = matcher(d)
    spans = [d[start:end] for _, start, end in matches]
    filtered = filter_spans(spans)
    out = dict()

    for f in filtered:
        for token in f :
            if token.pos_ == 'VERB' or token.lemma_.upper() == 'ÊTRE':
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

    return {'verbs': remap_keys(out)}

def getAdjPhrases(d):

    adjectivePattern = [
        [
            {'POS': 'ADV', 'DEP': 'advmod', 'OP': '?'}, # optional adverb(modifier for adjective)
            {'POS': 'ADJ', 'DEP': {'IN': ['amod', 'advmod']}, 'OP': '+'}, # adjective
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
            {'POS': 'CCONJ', 'DEP': 'cc'}, # CCONJ
            {'POS': 'ADV', 'DEP': 'advmod', 'OP': '?'},  # optional adverb(modifier for adjective)
            {'POS': 'ADJ', 'OP': '+'},  # adjective
        ],
        [
            {'POS': 'CCONJ', 'DEP': 'cc'}, # CCONJ
            {'POS': 'ADV', 'DEP': 'advmod', 'OP': '?'},  # optional adverb(modifier for adjective)
            {'POS': 'ADJ', 'DEP': 'advmod', 'OP': '+'},  # adverb
        ]
    ]
    advMatcher = Matcher(nlpFR.vocab)
    advMatcher.add('Adjective phrases', adjectivePattern)
    matches = advMatcher(d)
    spans = [d[start:end] for _, start, end in matches]

    filtered = filter_spans(spans)

    cconjMatcher = Matcher(nlpFR.vocab)
    cconjMatcher.add('Conjunctive phrases', cconjPatterns)
    matches = cconjMatcher(d)
    spans = [d[start:end] for _, start, end in matches]

    filtered += filter_spans(spans)

    filtered = [(str(f), f.start, f.end) for f in filtered]

    # print(filtered)
    return {'adjectives': filtered}

def getObjects(d):
    out = dict()

    for token in d:
        # Check if the token is a verb
        if token.pos_ == 'VERB':
            verb = token
            objects = []

            # Look for direct objects (obj) and indirect objects (iobj)
            for child in verb.children:
                if child.dep_ in ['obj', 'iobj']:
                    # Extract the full phrase using the subtree but stop at a conjunction
                    subtree = list(child.subtree)
                    phrase_start = subtree[0].i
                    for idx, subtoken in enumerate(subtree):
                        if subtoken.pos_ == 'CCONJ':
                            break
                    else:
                        idx = len(subtree)

                    phrase_end = subtree[idx - 1].i + 1
                    object_text = d[phrase_start:phrase_end].text
                    objects.append((object_text, phrase_start, phrase_end))

                    # Check for compound objects linked via conjunctions
                    for conj in child.children:
                        if conj.dep_ == 'conj' and conj.pos_ in ['NOUN', 'PRON']:
                            # Extract the compound object phrase
                            conj_subtree = list(conj.subtree)
                            start_idx = conj_subtree[0].i
                            for j, subtoken in enumerate(conj_subtree):
                                if subtoken.pos_ == 'CCONJ':
                                    break
                            else:
                                j = len(conj_subtree)

                            end_idx = conj_subtree[j - 1].i + 1
                            conj_text = d[start_idx:end_idx].text
                            objects.append((conj_text, start_idx, end_idx))

            # Add the verb and its objects to the output
            if objects:
                out[(verb.text, verb.i)] = objects

    # print('Object before remapping: ' + str(out))
    print('Object after remapping: ' + str(remap_keys(out)))
    return {'objects': remap_keys(out)}

@FrenchBreakdown.route('/api/fr/getData', methods=['POST'])
def frenchData():
    data = request.get_json()
    if not data or 'q' not in data:
        return {'error': 'No query provided'}, 400
    doc = nlpFR(data['q'])

    tokenized = [token.text for token in nlpFR(data['q'])]
    # print(tokenized)

    subjects = getSubjectPhrase(doc)
    verbs = getVerbPhrases(doc)
    adjectives = getAdjPhrases(doc)
    objects = getObjects(doc)

    out = {'sentence': data['q'], 'tokens': []}
    for token in tokenized:
        out['tokens'].append({'text': token, 'translation': translator.translate(token), 'tags': [], 'info': None, 'objectReference': []})

    print('Subjects', subjects)
    print('verbs', verbs)
    print('adjs', adjectives)
    print('objs', objects)

    for text, begin, end in subjects['subjects']:
        for i in range(begin, end):
            out['tokens'][i]['tags'].append('subject')

    for pair in verbs['verbs']:
        # for i in range(pair['key'][1], pair['key'][2]):
        for e in out['tokens'][pair['key'][1]]['tags']:
            if e == 'subject':
                out['tokens'][pair['key'][1]]['tags'].remove(e)
                out['tokens'][pair['key'][1]]['tags'].append('implicit subject')
        out['tokens'][pair['key'][1]]['tags'].append('verb')
        out['tokens'][pair['key'][1]]['info'] = pair['value']

    for text, begin, end in adjectives['adjectives']:
        for i in range(begin, end):
            out['tokens'][i]['tags'].append('adjective')

    for pair in objects['objects']:
        for text, begin, end in pair['value']:
            out['tokens'][pair['key'][1]]['objectReference'].append((begin, end))
        for obj in pair['value']:
            for i in range(obj[1], obj[2]):
                out['tokens'][i]['tags'].append('object')

    # print('out', json.dumps(out, indent=4))
    return out, 200

print('Ready French')
# J'irai à l'université dans 3 ans.