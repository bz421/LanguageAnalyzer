A sentence analyzer application for language-learning that will break up an input sentence into its constituent parts.

---
# Building the project
1. Install all the required node_modules
    - `npm i`
    - `cd client`
    - `npm i`
    - `cd ..`
    - `cd server`
    - `npm i`
2. Make sure you have installed all the required python packages
    - Flask
    - Waitress(optional: for optimized Flask server)
    - spaCy
       - `es_dep_news_trf` for Spanish model
       - `fr_dep_news_trf` for French model
       - `zh_core_web_trf` for Chinese model
    - requests
    - deep_translator
    - pypinyin
3. Run the components (in the following order)
    - Python backend: `python <filename>`(flask) or `waitress-serve --host=0.0.0.0 --port=5000 app:app`(waitress)
    - React webpage: `cd client` then `npm start`
