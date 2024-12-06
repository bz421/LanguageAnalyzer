import spacy
nlp = spacy.load('en_core_web_trf')

text = 'The ball was squashed by the reindeer.'
doc = nlp(text)

import spacy

token = doc[0]  # 'I'
print(token)
print(token.morph)  # 'Case=Nom|Number=Sing|Person=1|PronType=Prs'
print(token.morph.get("PronType"))  # ['Prs']

lemmatizer = nlp.get_pipe('lemmatizer')
lemmaDoc = nlp('He had been in Vienna when the earthquake struck.')
print([token.lemma_ for token in lemmaDoc])

