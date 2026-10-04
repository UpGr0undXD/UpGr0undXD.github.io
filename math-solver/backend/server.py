"""
数学求解器 - Python后端服务
支持一元一次、一元二次、二元一次方程组求解

使用方式：
1. pip install -r requirements.txt
2. python server.py
3. 在 math-solver.js 中设置 USE_PYTHON_BACKEND = true

API 端点：
- POST /api/linear     - 求解一元一次方程
- POST /api/quadratic  - 求解一元二次方程
- POST /api/system     - 求解二元一次方程组
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import math
import json

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# ============= 求解器函数 =============

def solve_linear(a, b, c):
    """
    求解一元一次方程: ax + b = c
    返回: x = (c - b) / a
    """
    if a == 0:
        if b == c:
            return {"error": "方程有无穷多解"}
        else:
            return {"error": f"方程无解 (0x = {c - b})"}
    
    solution = (c - b) / a
    return {
        "solution": solution,
        "equation": f"{a}x + {b} = {c}"
    }

def solve_quadratic(a, b, c):
    """
    求解一元二次方程: ax² + bx + c = 0
    """
    if a == 0:
        return {"error": "二次项系数a不能为0，这不是二次方程"}
    
    discriminant = b * b - 4 * a * c
    
    if discriminant < 0:
        return {
            "error": "无实数解",
            "message": f"判别式 Δ = {discriminant} < 0",
            "discriminant": discriminant
        }
    
    sqrt_delta = math.sqrt(discriminant)
    x1 = (-b + sqrt_delta) / (2 * a)
    x2 = (-b - sqrt_delta) / (2 * a)
    
    return {
        "solutions": [x1, x2],
        "discriminant": discriminant,
        "equation": f"{a}x² + {b}x + {c} = 0"
    }

def solve_system(a1, b1, c1, a2, b2, c2):
    """
    求解二元一次方程组:
    a₁x + b₁y = c₁
    a₂x + b₂y = c₂
    
    使用克拉默法则
    """
    # 计算系数行列式
    D = a1 * b2 - a2 * b1
    
    if abs(D) < 1e-10:  # 行列式为0
        # 检查是否有无穷多解或无解
        if abs(a1 * c2 - a2 * c1) < 1e-10 and abs(b1 * c2 - b2 * c1) < 1e-10:
            return {"error": "方程组有无穷多解（两方程实际相同）"}
        else:
            return {"error": "方程组无解（矛盾方程组）"}
    
    # 克拉默法则
    x = (c1 * b2 - c2 * b1) / D
    y = (a1 * c2 - a2 * c1) / D
    
    return {
        "x": x,
        "y": y,
        "determinant": D,
        "equations": [
            f"{a1}x + {b1}y = {c1}",
            f"{a2}x + {b2}y = {c2}"
        ]
    }

# ============= API 路由 =============

@app.route('/api/linear', methods=['POST'])
def linear():
    """一元一次方程求解 API"""
    try:
        data = request.get_json()
        a = float(data.get('a', 0))
        b = float(data.get('b', 0))
        c = float(data.get('c', 0))
        
        result = solve_linear(a, b, c)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/quadratic', methods=['POST'])
def quadratic():
    """一元二次方程求解 API"""
    try:
        data = request.get_json()
        a = float(data.get('a', 1))
        b = float(data.get('b', 0))
        c = float(data.get('c', 0))
        
        result = solve_quadratic(a, b, c)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/system', methods=['POST'])
def system():
    """二元一次方程组求解 API"""
    try:
        data = request.get_json()
        a1 = float(data.get('a1'))
        b1 = float(data.get('b1'))
        c1 = float(data.get('c1'))
        a2 = float(data.get('a2'))
        b2 = float(data.get('b2'))
        c2 = float(data.get('c2'))
        
        result = solve_system(a1, b1, c1, a2, b2, c2)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/health', methods=['GET'])
def health():
    """健康检查"""
    return jsonify({"status": "ok", "message": "Math Solver Backend is running"})

# ============= 主程序 =============

if __name__ == '__main__':
    print("=" * 50)
    print("📐 数学求解器 - Python后端服务")
    print("=" * 50)
    print("\n✅ 服务启动成功！")
    print("🌐 地址: http://localhost:5000")
    print("\n📋 可用的API端点:")
    print("  - POST http://localhost:5000/api/linear")
    print("  - POST http://localhost:5000/api/quadratic")
    print("  - POST http://localhost:5000/api/system")
    print("  - GET  http://localhost:5000/api/health")
    print("\n💡 在前端调用前，请在 math-solver.js 中设置:")
    print("   USE_PYTHON_BACKEND = true")
    print("\n⏹️  按 Ctrl+C 停止服务")
    print("=" * 50 + "\n")
    
    app.run(debug=True, port=5000)
