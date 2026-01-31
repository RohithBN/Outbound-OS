#!/usr/bin/env python3
"""Launcher for the Flask API.

Usage:
    python3 scripts/run_api.py --dataset data/dataset_demo.csv

The script sets RECOMMENDER_DATASET env var and starts the Flask app in `src/api.py`.
"""
import os
import argparse
import subprocess
import sys

parser = argparse.ArgumentParser()
parser.add_argument("--dataset", "-d", default="data/dataset_demo.csv")
parser.add_argument("--host", default="127.0.0.1")
parser.add_argument("--port", type=int, default=5000)
args = parser.parse_args()

dataset_path = os.path.abspath(args.dataset)
if not os.path.exists(dataset_path):
    print(f"Dataset not found at {dataset_path}. Please generate it first.")
    sys.exit(1)

# Set env var and launch the api module
env = os.environ.copy()
env["RECOMMENDER_DATASET"] = dataset_path
print(f"Starting API with dataset: {dataset_path}")
subprocess.run([sys.executable, "-u", "-m", "src.api"], env=env)
"""Utility script to run the Flask API from the project root.

Usage:
    python3 scripts/run_api.py --dataset data/dataset_demo.csv --host 127.0.0.1 --port 5000
"""
import os
import sys
import subprocess
import argparse

# ensure project root on path for imports (optional)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dataset', '-d', default='data/dataset_demo.csv')
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=5000)
    args = parser.parse_args()

    cmd = [sys.executable, os.path.join(PROJECT_ROOT, 'src', 'api.py'), '--dataset', args.dataset, '--host', args.host, '--port', str(args.port)]
    print('Starting API with:', ' '.join(cmd))
    # Launch in foreground
    subprocess.run(cmd)


if __name__ == '__main__':
    main()
"""Launcher for the Flask API.

Usage:
    python3 scripts/run_api.py --dataset data/dataset_demo.csv --port 5000
"""
import argparse
import os
import sys
import subprocess

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", "-d", default=os.path.join(PROJECT_ROOT, "data", "dataset_demo.csv"))
    parser.add_argument("--port", "-p", default="5000")
    args = parser.parse_args()
    env = os.environ.copy()
    env["DATASET"] = args.dataset
    cmd = [sys.executable, os.path.join(PROJECT_ROOT, "src", "api.py")]
    print("Starting API: dataset=", args.dataset)
    # Start server in foreground so logs are visible
    subprocess.run(cmd, env=env)


if __name__ == '__main__':
    main()
