import serial
import csv
import json
import threading
import time
from datetime import datetime

# ------------------------
# CONFIG
# ------------------------
PORT = "COM4"
BAUD = 115200

READ_TIME = 3        # seconds to read instructions
TREMOR_TIME = 5     # seconds
GRIP_TIME = 5       # seconds
TAP_TIME = 10       # seconds
POST_DELAY = 2      # seconds before next session

MAX_SESSIONS = 5    # <-- LIMIT HERE

latest_data = None
running = True
session_id = 0

# ------------------------
# SERIAL THREAD
# ------------------------
def read_serial():
    global latest_data, running

    ser = serial.Serial(PORT, BAUD, timeout=1)
    print("Connected to Arduino on", PORT)

    while running:
        try:
            line = ser.readline().decode("utf-8").strip()
            if not line:
                continue

            try:
                data = json.loads(line)
                latest_data = data
                print("LIVE:", data)
            except json.JSONDecodeError:
                pass
        except:
            break

    ser.close()

# ------------------------
# COUNTDOWN UTILITY
# ------------------------
def countdown(seconds):
    for i in range(seconds, 0, -1):
        print(f"Starting in {i}...")
        time.sleep(1)

# ------------------------
# CLINICAL FLOW
# ------------------------
def run_session():
    print("\n=== NEW CLINICAL SESSION ===")
    print("Read instructions carefully")
    time.sleep(READ_TIME)

    print("\nSTEP 1: Hold device still (TREMOR TEST)")
    countdown(3)
    time.sleep(TREMOR_TIME)

    print("\nSTEP 2: Squeeze FSR (GRIP TEST)")
    countdown(3)
    time.sleep(GRIP_TIME)

    print("\nSTEP 3: Tap LEFT-RIGHT alternately (TAPPING TEST)")
    countdown(3)
    time.sleep(TAP_TIME)

    print("\nProcessing results...")
    time.sleep(1)

# ------------------------
# LOGGER LOOP
# ------------------------
def main():
    global running, session_id

    with open("neuro_clinical_log.csv", "a", newline="") as f:
        writer = csv.writer(f)

        # Write header once per run
        writer.writerow([
            "timestamp",
            "session_id",
            "tremor",
            "grip",
            "tapping",
            "alternation"
        ])

        print("\nClinical Logger Started")
        print(f"Max sessions: {MAX_SESSIONS}")
        print("Press Ctrl+C to stop early\n")

        while session_id < MAX_SESSIONS:
            try:
                run_session()

                if latest_data is None:
                    print("No data received from Arduino!")
                else:
                    session_id += 1

                    row = [
                        datetime.now().isoformat(timespec="seconds"),
                        session_id,
                        latest_data["tremor"],
                        latest_data["grip"],
                        latest_data["tapping"],
                        latest_data["alternation"]
                    ]

                    writer.writerow(row)
                    print("\nSAVED SESSION:", row)

                if session_id < MAX_SESSIONS:
                    print(f"\nNext session starts in {POST_DELAY} seconds...\n")
                    time.sleep(POST_DELAY)

            except KeyboardInterrupt:
                running = False
                print("\nStopping Clinical Logger...")
                break

        print("\n=== TEST COMPLETE ===")
        print(f"{session_id} sessions saved to neuro_clinical_log.csv")
        running = False

# ------------------------
# START
# ------------------------
thread = threading.Thread(target=read_serial, daemon=True)
thread.start()

main()
