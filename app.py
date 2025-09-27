import sys

from flask import Flask, request, jsonify, render_template, make_response
from flask_cors import CORS
from services import HitChecker, HistoryManager
from shapes import QuadrantShape, Triangle, Rectangle, QuarterCircle, Point
import time, datetime
import json

app = Flask(__name__)
CORS(app)

shapes = [
    QuadrantShape(Rectangle(), 4),
    QuadrantShape(Triangle(), 3),
    QuadrantShape(QuarterCircle(), 2)
]

hit_checker = HitChecker(shapes)
history_manager = HistoryManager()

@app.route("/", methods=["GET"])
def index():
    resp = make_response(render_template("index.html"))
    # пробуем прочитать тему и X/Y из куки, если нет — defaults
    theme = request.cookies.get("theme", "light")
    selectedXs = request.cookies.get("selectedXs", "")
    y_val = request.cookies.get("y", "")
    r_val = request.cookies.get("selectedR", "1")
    resp.set_cookie("theme", theme, path="/", samesite="Lax")
    resp.set_cookie("selectedXs", selectedXs, path="/", samesite="Lax")
    resp.set_cookie("y", y_val, path="/", samesite="Lax")
    resp.set_cookie("selectedR", r_val, path="/", samesite="Lax")
    return resp

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
        record = Point(
            x=x,
            y=y,
            r=r,
            result=result,
            now=now
        )
        history_manager.add_to_history(record)
        results.append(record)

    exec_time = round((time.perf_counter() - start_time) * 1000, 3)

    response = make_response(jsonify({
        "exec_time": exec_time,
        "now": now,
        "results": [p.to_dict() for p in results],
        "history": history_manager.get_history()
    }))

    ui_state = {
    "selectedXs": xs,
    "y": y,
    "r": r,
    "lastPoints": [p.to_dict() for p in results],
    "theme": request.cookies.get("theme") or "light"  # берем текущую тему из cookie, если есть
    }

    response.set_cookie("uiState", value=json.dumps(ui_state), max_age=60*60*24, path="/", samesite="Lax")

    return response

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
