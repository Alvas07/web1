import sys

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from services import HitChecker, HistoryManager
import time, datetime

app = Flask(__name__)
CORS(app)

hit_checker = HitChecker()
history_manager = HistoryManager()

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/api/check", methods=["GET"])
def check_point():
    start_time = time.perf_counter()

    try:
        xs = request.args.getlist("x", type=int)
        y = float(request.args.get("y"))
        r = int(request.args.get("r"))
    except (TypeError, ValueError):
        return jsonify({
            "now": datetime.datetime.now().strftime("%H:%M:%S"),
            "reason": "Invalid params"
        }), 400

    results = []
    now = datetime.datetime.now().strftime("%H:%M:%S")

    for x in xs:
        result = hit_checker.is_hit(x, y, r)
        record = {
            "x": x,
            "y": y,
            "r": r,
            "result": result,
            "now": now
        }
        history_manager.add_to_history(record)
        results.append(record)

    exec_time = round((time.perf_counter() - start_time) * 1000, 3)

    return jsonify({
        "exec_time": exec_time,
        "now": now,
        "results": results,
        "history": history_manager.get_history()
    })

if __name__ == "__main__":
    debug = False
    port = 5000
    if len(sys.argv) == 2:
        try:
            port = int(sys.argv[1])
        except Exception:
            print("Invalid port")
    elif len(sys.argv) > 2:
        try:
            port = int(sys.argv[1])
            debug = True if sys.argv == "True" else False
        except Exception:
            print("Invalid port or debug mode")

    print(f"Server started on port {port}. DebugMode: {debug}")

    app.run(host="0.0.0.0", port=port, debug=debug)
