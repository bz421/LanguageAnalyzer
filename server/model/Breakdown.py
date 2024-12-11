import spacy
from spacy import displacy
from spacy.util import filter_spans

from spacy.matcher import Matcher
nlpES = spacy.load('es_dep_news_trf')
def getSubjectPhrase(d : spacy.tokens.doc.Doc):
    global nlpES
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
        ]
    ]
    matcher.add('Subject', subjectPattern)
    matches = matcher(d)
    spans = [d[start:end] for _, start, end, in matches]
    return filter_spans(spans)


# 'to be' is a copula when predicative, otherwise it is auxiliary. It is never a verb.
def getVerbPhrases(d : spacy.tokens.doc.Doc):
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
    return filter_spans(spans)


def getAdvPhrases(d : spacy.tokens.doc.Doc):
    adjectivePattern = [
        {'POS': 'ADV', 'DEP': 'advmod', 'OP': '?'}, # optional adverb(modifier for adjective)
        {'POS': 'ADJ', 'DEP': 'amod', 'OP': '+'} # adjective
    ]
    matcher = Matcher(nlpES.vocab)
    matcher.add('Adjective phrases', [adjectivePattern])
    matches = matcher(d)
    spans = [d[start:end] for _, start, end in matches]
    return filter_spans(spans)
print('Ready')

while True:
    doc = nlpES(input())
    print(f'Subjects: {getSubjectPhrase(doc)}')
    print(f'Verb Phrases: {getVerbPhrases(doc)}')
    print(f'Adjective Phrases: {getAdvPhrases(doc)}')

# Mi mamá alta quiere bailar con sus mejores amigas.