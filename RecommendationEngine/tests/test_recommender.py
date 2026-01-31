import os
import tempfile
from src.generate_dataset import generate
from src.recommender import Recommender


def test_recommender_basic():
    td = tempfile.mkdtemp()
    path = os.path.join(td, "test_dataset.csv")
    # small dataset for test
    generate(200, path)
    r = Recommender(path)
    results = r.recommend("Data Scientist", top_n=5)
    assert len(results) == 5
    # ensure sources exist and samples are non-empty
    srcs = r.recommend_sources("Data Scientist", top_n_candidates=100, top_k_sources=3)
    assert len(srcs) <= 3
    # Each recommended source should have samples
    for s in srcs:
        assert "samples" in s
        assert len(s["samples"]) >= 1


if __name__ == '__main__':
    test_recommender_basic()
    print("All tests passed")
