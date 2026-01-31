"""Small Flask API exposing the recommender.

Endpoints:
- GET /sources?role=<role>&top=<n>&combine=true|false -> JSON list of recommended sources with scores
- GET /recommend?role=<role>&top=<n> -> top candidate profiles (with score)

Run: python3 src/api.py --dataset data/dataset.csv --host 127.0.0.1 --port 5000
"""
import os
import sys
import argparse
from flask import Flask, request, jsonify

# ensure project root in path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from src.recommender import Recommender


def create_app(dataset_path: str):
    app = Flask(__name__)
    # instantiate recommender once
    rec = Recommender(dataset_path)

    @app.route('/sources')
    def sources():
        role = request.args.get('role')
        if not role:
            return jsonify({'error': 'missing role parameter'}), 400
        try:
            top = int(request.args.get('top', 5))
        except ValueError:
            top = 5
        combine = request.args.get('combine', 'true').lower() not in ('0', 'false', 'no')
        srcs = rec.recommend_sources_only(role, top_k_sources=top, combine_with_data=combine)
        # srcs already contains score/prior/evidence/count
        return jsonify({'role': role, 'sources': srcs})

    @app.route('/recommend')
    def recommend():
        role = request.args.get('role')
        if not role:
            return jsonify({'error': 'missing role parameter'}), 400
        try:
            top = int(request.args.get('top', 10))
        except ValueError:
            top = 10
        results = rec.recommend(role, top_n=top)
        # Return minimal safe fields for clients
        out = []
        for r in results:
            out.append({
                'id': r.get('id'),
                'name': r.get('name'),
                'role': r.get('role'),
                'source': r.get('source'),
                'profile_url': r.get('profile_url'),
                'score': r.get('score'),
            })
        return jsonify({'role': role, 'candidates': out})

    return app


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--dataset', '-d', default='data/dataset.csv')
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=5000)
    args = parser.parse_args()
    if not os.path.exists(args.dataset):
        print(f"Dataset not found at {args.dataset}. Please create it first.")
        raise SystemExit(1)
    app = create_app(args.dataset)
    app.run(host=args.host, port=args.port)
"""Flask HTTP API for the recommender.

Endpoints:
- GET /recommend?role=...&top=10 -> returns JSON list of candidates
- GET /sources?role=...&top=5&combine_with_data=1 -> returns JSON list of recommended sources

The app loads a dataset at startup (env var DATASET or default data/dataset_demo.csv).
"""
import os
import sys
from flask import Flask, request, jsonify

# Ensure project root is importable when running the file directly
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from src.recommender import Recommender

app = Flask(__name__)

DATASET_PATH = os.environ.get("DATASET", os.path.join(PROJECT_ROOT, "data", "dataset_demo.csv"))

print(f"Loading dataset from: {DATASET_PATH}")
recommender = Recommender(DATASET_PATH)


@app.route("/recommend", methods=["GET"])
def recommend_route():
    role = request.args.get("role")
    if not role:
        return jsonify({"error": "missing required param: role"}), 400
    try:
        top = int(request.args.get("top", 10))
    except ValueError:
        top = 10

    results = recommender.recommend(role, top_n=top)
    # Only expose a subset of fields in the API
    out = []
    for r in results:
        out.append({
            "id": r.get("id"),
            "name": r.get("name"),
            "role": r.get("role"),
            "skills": r.get("skills"),
            "experience_years": r.get("experience_years"),
            "location": r.get("location"),
            "source": r.get("source"),
            "profile_url": r.get("profile_url"),
            "score": r.get("score"),
        })
    return jsonify({"role": role, "top": top, "results": out})


@app.route("/sources", methods=["GET"])
def sources_route():
    role = request.args.get("role")
    if not role:
        return jsonify({"error": "missing required param: role"}), 400
    try:
        top = int(request.args.get("top", 5))
    except ValueError:
        top = 5
    combine = request.args.get("combine_with_data", "1")
    combine_with_data = combine not in ("0", "false", "False")

    srcs = recommender.recommend_sources_only(role, top_n_candidates=500, top_k_sources=top, combine_with_data=combine_with_data)
    return jsonify({"role": role, "top": top, "combine_with_data": combine_with_data, "sources": srcs})


if __name__ == "__main__":
    # Allow passing a different port via env or CLI arg
    port = int(os.environ.get("PORT", 5000))
    host = os.environ.get("HOST", "127.0.0.1")
    app.run(host=host, port=port)
