import sys

from flask import Flask, request, jsonify, render_template, session, Response
from flask_cors import CORS
from services import HitChecker, HistoryManager, StateManager, State, HistoryEntry
from shapes import QuadrantShape, Triangle, Rectangle, QuarterCircle, Point
from dataclasses import asdict
import time, datetime, uuid, json

def get_session_id() -> str:
    if "id" not in session:
        session["id"] = str(uuid.uuid4())
    return session["id"]

app = Flask(__name__)
CORS(app)
app.secret_key = "super_secret_key228"

shapes = [
    QuadrantShape(Rectangle(), 4),
    QuadrantShape(Triangle(), 3),
    QuadrantShape(QuarterCircle(), 2)
]

hit_checker = HitChecker(shapes)
history_manager = HistoryManager()
state_manager = StateManager()

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/api/state/get", methods=["GET"])
def get_state():
    try:
        sid = get_session_id()
        state = state_manager.get_state(sid)
        return jsonify(asdict(state))
    except Exception:
        return jsonify({
            "now": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "reason": "Cannot get state"
        }), 500

@app.route("/api/state/update", methods=["GET"])
def update_state():
    try:
        sid = get_session_id()
        new_state_dict = request.args.to_dict(flat=True)

        if "selectedXs" in new_state_dict:
            new_state_dict["selectedXs"] = [int(x) for x in new_state_dict["selectedXs"].split(",") if x]
        if "y" in new_state_dict:
            new_state_dict["y"] = float(new_state_dict["y"]) if new_state_dict["y"] else None
        if "r" in new_state_dict:
            new_state_dict["r"] = int(new_state_dict["r"])

        new_state = State(**new_state_dict)
        state_manager.update_state(sid, new_state)
        return Response(status=200)
    except (TypeError, ValueError):
        return jsonify({
            "now": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "reason": "Invalid params of state"
        }), 400

@app.route("/api/history/get", methods=["GET"])
def get_history():
    try:
        sid = get_session_id()
        history = history_manager.get_session_history(sid)
        history = [asdict(entry) for entry in history]
        return jsonify(history)
    except Exception:
        return jsonify({
            "now": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "reason": "Cannot get history"
        }), 500
    
@app.route("/api/history/clear", methods=["GET"])
def clear_history():
    try:
        sid = get_session_id()
        history_manager.clear_session_history(sid)
        return Response(status=200)
    except Exception:
        return jsonify({
            "now": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "reason": "Cannot clear history"
        }), 500


@app.route("/api/check", methods=["GET"])
def check_point():
    try:
        start_time = time.perf_counter()
        sid = get_session_id()

        try:
            xs = request.args.getlist("x", type=int)
            y = float(request.args.get("y"))
            r = int(request.args.get("r"))
        except (TypeError, ValueError):
            return jsonify({
                "now": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "reason": "Invalid params"
            }), 400

        results = []
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        for x in xs:
            point = Point(x=x, y=y, r=r)
            result = hit_checker.is_hit(point)
            results.append((point, result))

        exec_time = round((time.perf_counter() - start_time) * 1000, 3)

        json_results = []

        for point, result in results:
            history_entry = HistoryEntry(point=point, result=result, now=now, exec_time=exec_time)
            history_manager.add_entry(sid, history_entry)
            json_results.append(asdict(history_entry))

        return jsonify({
            "results": json_results,
            "exec_time": exec_time,
        })
    except Exception:
        return jsonify({
            "now": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "reason": "Unexpected server error"
        }), 500

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
