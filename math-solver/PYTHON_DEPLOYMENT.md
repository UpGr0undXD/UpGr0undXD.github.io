# Python 后端部署指南

## 📋 目录

1. [快速开始](#快速开始)
2. [环境配置](#环境配置)
3. [本地开发](#本地开发)
4. [生产部署](#生产部署)
5. [常见问题](#常见问题)
6. [后续功能扩展](#后续功能扩展)

---

## 🚀 快速开始

### 方式1：自动启动脚本（推荐）

```bash
cd /Users/haolindu/Desktop/UpGr0undXD.github.io/math-solver/backend
./start.sh
```

脚本会自动检查Python环境和依赖，然后启动服务。

### 方式2：手动启动

```bash
cd /Users/haolindu/Desktop/UpGr0undXD.github.io/math-solver/backend

# 方式2a: 使用python3
python3 -m pip install -r requirements.txt
python3 server.py

# 方式2b: 使用python
python -m pip install -r requirements.txt
python server.py
```

服务启动后会看到：
```
==================================================
📐 数学求解器 - Python后端服务
==================================================

✅ 服务启动成功！
🌐 地址: http://localhost:5000

📋 可用的API端点:
  - POST http://localhost:5000/api/linear
  - POST http://localhost:5000/api/quadratic
  - POST http://localhost:5000/api/system
  - GET  http://localhost:5000/api/health

...
```

---

## 🛠️ 环境配置

### 第一步：检查Python版本

```bash
python3 --version
# 需要 Python 3.7 或更高版本
```

### 第二步：安装依赖

```bash
# 方法A：使用requirements.txt（推荐）
python3 -m pip install -r requirements.txt

# 方法B：逐个安装
python3 -m pip install Flask==2.3.0
python3 -m pip install Flask-CORS==4.0.0
python3 -m pip install Werkzeug==2.3.0
```

### 第三步：验证安装

```bash
python3 -c "import flask, flask_cors; print('✅ 依赖安装成功')"
```

---

## 🔧 本地开发

### 启用调试模式

编辑 `server.py`，确保最后的启动代码是：

```python
if __name__ == '__main__':
    app.run(debug=True, port=5000)  # debug=True 启用热重载
```

### 测试API

启动服务后，使用curl或Postman测试：

```bash
# 测试健康检查
curl http://localhost:5000/api/health

# 测试一元一次方程求解
curl -X POST http://localhost:5000/api/linear \
  -H "Content-Type: application/json" \
  -d '{"a": 2, "b": 3, "c": 7}'

# 响应应该是: {"solution": 2.0, "equation": "2x + 3 = 7"}
```

### 前端连接后端

1. 打开 `math-solver/math-solver.js`
2. 找到这一行：
   ```javascript
   const USE_PYTHON_BACKEND = false;
   ```
3. 改为：
   ```javascript
   const USE_PYTHON_BACKEND = true;
   ```
4. 刷新网页，现在前端会调用Python后端

---

## 🌐 生产部署

### 部署在你自己的服务器（推荐）

#### 使用Gunicorn（生产级WSGI服务器）

1. **安装Gunicorn**
   ```bash
   python3 -m pip install gunicorn
   ```

2. **启动服务**
   ```bash
   cd /Users/haolindu/Desktop/UpGr0undXD.github.io/math-solver/backend
   gunicorn -w 4 -b 0.0.0.0:5000 server:app
   ```
   - `-w 4`: 启用4个worker进程（根据CPU核心数调整）
   - `-b 0.0.0.0:5000`: 监听所有网卡的5000端口

3. **使用Nginx反向代理**（可选）
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location /api/ {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

#### 部署到云平台

**选项A: Heroku**
```bash
# 创建 Procfile
echo "web: gunicorn server:app" > Procfile

# 创建 runtime.txt
echo "python-3.9.16" > runtime.txt

# 部署
git push heroku main
```

**选项B: Replit**
- 直接在Replit上创建Python项目
- 上传 `server.py` 和 `requirements.txt`
- 运行即可获得公网URL

**选项C: PythonAnywhere**
- 注册 www.pythonanywhere.com
- 上传代码并配置WSGI应用
- 自动获得 `your-username.pythonanywhere.com` 的域名

### 部署后的配置

更新前端配置，指向你的服务器：

```javascript
// math-solver/math-solver.js
const BACKEND_URL = 'https://your-server.com/api';
const USE_PYTHON_BACKEND = true;
```

---

## ❓ 常见问题

### Q1: pip 找不到

**问题**: `zsh: command not found: pip`

**解决方案**:
```bash
# 使用 python3 -m pip
python3 -m pip install -r requirements.txt
```

### Q2: Flask 导入错误

**问题**: `ModuleNotFoundError: No module named 'flask'`

**解决方案**:
```bash
python3 -m pip install Flask
python3 -m pip install Flask-CORS
```

### Q3: 端口5000被占用

**问题**: `Address already in use`

**解决方案**:
```bash
# 方法1: 使用不同端口
python3 server.py --port 8000

# 方法2: 杀死占用端口的进程
lsof -i :5000
kill -9 <PID>
```

### Q4: 前端无法连接后端

**问题**: 前端发送请求但超时或错误

**检查清单**:
- [ ] 后端服务是否运行？（看到"✅ 服务启动成功！"）
- [ ] `USE_PYTHON_BACKEND` 是否设为 `true`？
- [ ] 浏览器控制台是否有CORS错误？（应该没有，因为启用了CORS）
- [ ] 本地开发？使用 `http://localhost:5000`
- [ ] 远程服务器？确保防火墙允许5000端口

### Q5: 如何在后台运行服务？

**macOS/Linux**:
```bash
# 方式1：使用nohup
nohup python3 server.py > server.log 2>&1 &

# 方式2：使用screen
screen -S math-solver
python3 server.py
# 按 Ctrl+A，然后 D 退出screen

# 恢复screen
screen -r math-solver
```

**Windows**:
```batch
:: 使用pythonw（无窗口）
start pythonw server.py
```

---

## 🚀 后续功能扩展

### 现在已支持
- ✅ 一元一次方程
- ✅ 一元二次方程
- ✅ 二元一次方程组

### 容易添加的功能

**1. 一元三次方程**
```python
# 在 server.py 中添加
@app.route('/api/cubic', methods=['POST'])
def cubic():
    # 实现一元三次方程求解
    pass
```

**2. 方程求根的可视化图形**
```python
# 使用 matplotlib 生成图表
import matplotlib.pyplot as plt
# 返回图表URL到前端
```

**3. 支持多个方程组（矩阵求解）**
```python
# 使用 numpy
import numpy as np
# 支持任意大小的线性方程组
```

**4. 不等式求解**
```python
# 使用 sympy
from sympy import *
# solve_univariate_inequality() 等
```

**5. 多项式因式分解**
```python
from sympy import factor, symbols
x = symbols('x')
expr = x**2 - 5*x + 6
print(factor(expr))  # (x - 2)(x - 3)
```

### 添加新功能的步骤

1. **在 `server.py` 中添加求解函数**
   ```python
   def solve_cubic(a, b, c, d):
       # 实现数学逻辑
       return result
   ```

2. **添加API路由**
   ```python
   @app.route('/api/cubic', methods=['POST'])
   def cubic():
       # 调用求解函数并返回JSON
       pass
   ```

3. **在前端 `math-solver.js` 中调用**
   ```javascript
   function solveCubic() {
       // 获取系数
       // 发送POST请求到 /api/cubic
       // 显示结果
   }
   ```

4. **在 `index.html` 中添加UI**
   ```html
   <section id="cubic" class="tab-content">
       <!-- 输入表单 -->
   </section>
   ```

### 推荐的库

- **sympy**: 符号数学计算（因式分解、求导等）
- **numpy**: 数值计算和线性代数
- **scipy**: 科学计算（高级求解算法）
- **matplotlib**: 绘制函数图象
- **pandas**: 数据处理

安装：
```bash
python3 -m pip install sympy numpy scipy matplotlib pandas
```

---

## 📚 相关资源

- [Flask官方文档](https://flask.palletsprojects.com/)
- [Flask-CORS文档](https://flask-cors.readthedocs.io/)
- [SymPy数学库](https://www.sympy.org/)
- [Python数学方程求解](https://docs.python.org/3/library/cmath.html)

---

**最后更新**: 2026年10月4日

有任何问题？查看 [README.md](../README.md) 或提交Issue！
