"""Simple CLI to run the recommender.

Example:
    python3 scripts/run_recommender.py --dataset data/dataset.csv --role "Data Scientist" --top 10

If dataset doesn't exist, you can generate one by running `src/generate_dataset.py`.
"""
import argparse
import os
import sys

# Ensure project root is on sys.path so `from src import ...` works when running scripts
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from src.recommender import Recommender


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", "-d", default="data/dataset.csv")
    parser.add_argument("--role", "-r", required=True)
    parser.add_argument("--top", "-t", type=int, default=10)
    parser.add_argument("--show-sources", action="store_true", help="Also print recommended sources summary")
    parser.add_argument("--sources-only", action="store_true", help="Print only recommended sources (concise)")
    args = parser.parse_args()

    if not os.path.exists(args.dataset):
        print(f"Dataset not found at {args.dataset}. Please generate it via `python3 src/generate_dataset.py --out {args.dataset}`")
        return

    rec = Recommender(args.dataset)
    # For this tool we focus only on source recommendations (role -> sources)
    srcs = rec.recommend_sources_only(args.role, top_k_sources=args.top)
    print(f"Recommended sources for role '{args.role}':\n")
    for s in srcs:
        print(f"- {s['source']}: score={s['score']:.4f} (prior={s['prior']:.2f}, evidence={s['evidence_score']:.2f}, count={s['count']})")


if __name__ == '__main__':
    main()
