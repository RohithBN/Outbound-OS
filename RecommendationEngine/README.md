Recommendation Engine
=====================

This project provides a simple, fast recommendation engine that, given a role (e.g. "Data Scientist"), returns candidate prospects and the multiple sources where they can be sourced (LinkedIn, GitHub, Apollo, etc.). It also includes a dataset generator to create a large synthetic dataset for testing and experimentation.

What's included
- `src/generate_dataset.py` — synthetic dataset generator (CSV output). Default sizes can be large (e.g. 50_000) but you can tune it.
- `src/recommender.py` — a simple TF-IDF + cosine-similarity recommender that returns top candidates and groups them by source.
- `scripts/run_recommender.py` — small CLI to generate (optional) and run queries.
- `tests/test_recommender.py` — minimal unit test.
- `requirements.txt` — python deps.
 - `src/api.py` — small Flask API that exposes `/sources?role=...` and returns JSON with recommended sources and scores.
 - `scripts/run_api.py` — launcher for the Flask API.

Quick start
1. Create a virtualenv and activate it (macOS zsh):

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Generate a dataset (optional). Example generating 10,000 rows for a demo (change `--n 50000` for a large dataset):

```bash
python3 src/generate_dataset.py --out data/dataset.csv --n 10000
```

3. Get recommended sources from the CLI (role -> sources only):

```bash
python3 scripts/run_recommender.py --dataset data/dataset.csv --role "Sales Representative" --top 5
```

4. Run the HTTP API and query sources (returns JSON):

Start the API (this will launch the Flask app on port 5000):

```bash
python3 scripts/run_api.py --dataset data/dataset.csv
```

Then query the sources endpoint (example):

```bash
curl "http://127.0.0.1:5000/sources?role=Data%20Scientist"
```

Response format (JSON):

{
	"role": "Data Scientist",
	"sources": [
		{"source": "github", "score": 0.76, "prior": 1.0, "evidence_score": 0.61, "count": 102},
		{"source": "stackoverflow", "score": 0.33, "prior": 0.52, "evidence_score": 0.39, "count": 66}
	]
}

Notes
- Generating 50,000+ rows is supported but may take some time and memory; for experimentation, start with 5k.
- The dataset is synthetic and intended for prototyping—replace with your real data when ready.

Next steps / ideas
- Add embedding-based semantic search (OpenAI/FAISS) for better matching.
- Add more realistic source-specific fields (location, current company, contact metadata).
- Provide an HTTP API wrapper for programmatic access.
