"""Synthetic dataset generator for hiring prospects.

Creates a CSV with columns:
- id, name, role, skills, experience_years, location, source, profile_url, summary

Usage:
    python3 src/generate_dataset.py --out data/dataset.csv --n 5000
"""
import argparse
import random
import csv
from faker import Faker
import numpy as np
from tqdm import trange

fake = Faker()

ROLES = [
    "Data Scientist",
    "Machine Learning Engineer",
    "Data Engineer",
    "Backend Engineer",
    "Frontend Engineer",
    "Full Stack Engineer",
    "DevOps Engineer",
    "Site Reliability Engineer",
    "Product Manager",
    "UX Designer",
    "Mobile Engineer",
    "QA Engineer",
    "Security Engineer",
    "Sales Representative",
    "Account Executive",
    "Marketing Manager",
    # Additional roles for broader coverage
    "Customer Success",
    "Technical Support",
    "Business Analyst",
    "Data Analyst",
    "Research Scientist",
    "Embedded Engineer",
    "Hardware Engineer",
    "Site Reliability Engineer",
    "Cloud Architect",
    "Full Stack Developer",
    "Growth Marketer",
    "Content Strategist",
    "People Operations",
    "Recruiter",
    "Finance Manager",
]

ROLE_SKILLS = {
    "Data Scientist": ["python", "pandas", "numpy", "scikit-learn", "statistics", "sql"],
    "Machine Learning Engineer": ["python", "tensorflow", "pytorch", "mlops", "docker", "aws"],
    "Data Engineer": ["sql", "spark", "airflow", "python", "etl", "kafka"],
    "Backend Engineer": ["python", "java", "go", "rest", "sql", "docker"],
    "Frontend Engineer": ["javascript", "react", "css", "html", "typescript"],
    "Full Stack Engineer": ["javascript", "react", "nodejs", "python", "sql"],
    "DevOps Engineer": ["kubernetes", "docker", "ci/cd", "terraform", "aws"],
    "Site Reliability Engineer": ["monitoring", "kubernetes", "prometheus", "sre"],
    "Product Manager": ["roadmap", "stakeholder", "analytics", "prioritization"],
    "UX Designer": ["figma", "ux", "user research", "prototyping"],
    "Mobile Engineer": ["android", "ios", "kotlin", "swift", "react-native"],
    "QA Engineer": ["testing", "selenium", "automation", "pytest"],
    "Security Engineer": ["security", "pentesting", "network", "iam"],
    "Sales Representative": ["sales", "crm", "outreach", "negotiation"],
    "Account Executive": ["sales", "accounts", "enterprise", "negotiation"],
    "Marketing Manager": ["seo", "content", "analytics", "campaign"],
}

SOURCES = ["linkedin", "github", "apollo", "angellist", "stackoverflow", "twitter"]

LOCATIONS = [
    "San Francisco, CA",
    "New York, NY",
    "Austin, TX",
    "Seattle, WA",
    "London, UK",
    "Berlin, Germany",
    "Bangalore, India",
    "Remote"
]


def make_profile(i):
    role = random.choice(ROLES)
    skills_pool = ROLE_SKILLS.get(role, [])
    # sample 2-5 skills
    skills = random.sample(skills_pool, k=max(1, min(len(skills_pool), random.randint(2, 5))))
    years = max(0, int(np.random.exponential(scale=3))) + random.randint(0, 10)
    location = random.choice(LOCATIONS)
    source = random.choices(SOURCES, weights=[0.35, 0.2, 0.15, 0.08, 0.12, 0.1])[0]
    id_ = f"cand_{i:07d}"
    # Make profile URL use id to avoid names in the dataset
    profile_url = f"https://{source}.com/profiles/{id_}"

    summary = f"A {role} with {years} years experience. Skills: {', '.join(skills)}. Located in {location}."

    return {
        "id": id_,
        "role": role,
        "skills": ", ".join(skills),
        "experience_years": years,
        "location": location,
        "source": source,
        "profile_url": profile_url,
        "summary": summary,
    }


def generate(n, out_path):
    header = ["id", "role", "skills", "experience_years", "location", "source", "profile_url", "summary"]
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=header)
        writer.writeheader()
        for i in trange(n, desc="Generating dataset"):
            row = make_profile(i)
            writer.writerow(row)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", "-o", default="data/dataset.csv", help="Output CSV path")
    parser.add_argument("--n", type=int, default=5000, help="Number of rows to generate (default 5000). Use 50000+ for a large dataset")
    args = parser.parse_args()
    # Ensure path exists
    import os
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    generate(args.n, args.out)
    print(f"Wrote {args.n} rows to {args.out}")
