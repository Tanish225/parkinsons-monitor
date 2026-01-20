import random
import csv

NUM_SAMPLES = 600
OUTPUT_FILE = "data/neuro_dataset.csv"

HEALTHY = {
    "tremor": (0.001, 0.006),
    "grip": (0.65, 1.0),
    "tapping": (4.2, 6.2),
    "alternation": (0.75, 1.0)
}

IMPAIRED = {
    "tremor": (0.01, 0.06),
    "grip": (0.15, 0.55),
    "tapping": (1.2, 3.2),
    "alternation": (0.25, 0.65)
}

def severity_score(t, g, tap, alt):
    tremor = min(t / 0.06, 1)
    grip = 1 - min(g / 1.0, 1)
    tap = 1 - min(tap / 6.5, 1)
    alt = 1 - alt
    return round((0.4*tremor + 0.2*grip + 0.2*tap + 0.2*alt) * 100, 1)

with open(OUTPUT_FILE, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["tremor", "grip", "tapping", "alternation", "severity"])

    for _ in range(NUM_SAMPLES):
        impaired = random.random() < 0.5
        r = IMPAIRED if impaired else HEALTHY

        t = random.uniform(*r["tremor"])
        g = random.uniform(*r["grip"])
        tap = random.uniform(*r["tapping"])
        alt = random.uniform(*r["alternation"])

        writer.writerow([
            round(t, 6),
            round(g, 3),
            round(tap, 2),
            round(alt, 2),
            severity_score(t, g, tap, alt)
        ])

print("Dataset created successfully")
