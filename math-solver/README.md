# 📐 数学求解器

快速求解一元一次方程、一元二次方程和二元一次方程组的在线工具。

## ✨ 功能特性

### 1️⃣ 一元一次方程
- **格式**: `ax + b = c`
- **求解**: 直接计算或解析方程字符串
- **验证**: 自动验证答案

### 2️⃣ 一元二次方程
- **格式**: `ax² + bx + c = 0`
- **求解**: 使用求根公式（判别式法）
- **结果**: 显示判别式、两个根及求解步骤

### 3️⃣ 二元一次方程组
- **格式**: 
  ```
  a₁x + b₁y = c₁
  a₂x + b₂y = c₂
  ```
- **求解**: 克拉默法则（行列式法）
- **验证**: 自动验证x和y的正确性

## 🚀 快速开始

### 前端使用（不需要后端）
直接打开 `index.html`，无需任何配置，即可使用前端版本。

```bash
# macOS 快速打开
open math-solver/index.html

# 或在浏览器中访问
file:///Users/haolindu/Desktop/UpGr0undXD.github.io/math-solver/index.html
```

## 🔧 扩展为Python后端

当你需要更复杂的数学功能时，可以启用Python后端服务。

**详见** [PYTHON_DEPLOYMENT.md](PYTHON_DEPLOYMENT.md) **获取完整部署指南**

### 快速启动

```bash
# 方式1：使用自动脚本（推荐）
cd /Users/haolindu/Desktop/UpGr0undXD.github.io/math-solver/backend
./start.sh

# 方式2：手动启动
python3 -m pip install -r requirements.txt
python3 server.py
```

## 📋 项目结构

```
math-solver/
├── index.html              # 主页面
├── math-solver.css         # 样式表
├── math-solver.js          # 前端逻辑 + API调用
├── README.md               # 本文件
└── backend/
    ├── server.py           # Python Flask服务器
    ├── solver.py           # 纯数学求解模块（可选，未来扩展）
    └── requirements.txt    # Python依赖
```

## 🔌 API接口文档

### 一元一次方程
```
POST /api/linear
Content-Type: application/json

请求体:
{
  "a": 2,      // x的系数
  "b": 3,      // 常数项
  "c": 7       // 右边
}

响应:
{
  "solution": 2,
  "equation": "2x + 3 = 7"
}
```

### 一元二次方程
```
POST /api/quadratic
Content-Type: application/json

请求体:
{
  "a": 1,      // x²的系数
  "b": -5,     // x的系数
  "c": 6       // 常数项
}

响应:
{
  "solutions": [3, 2],
  "discriminant": 1,
  "equation": "1x² + -5x + 6 = 0"
}
```

### 二元一次方程组
```
POST /api/system
Content-Type: application/json

请求体:
{
  "a1": 1,     // 第一个方程x的系数
  "b1": 1,     // 第一个方程y的系数
  "c1": 3,     // 第一个方程右边
  "a2": 1,
  "b2": -1,
  "c2": 1
}

响应:
{
  "x": 2,
  "y": 1,
  "determinant": -2,
  "equations": ["1x + 1y = 3", "1x + -1y = 1"]
}
```

## 🎯 使用示例

### 例1: 求解 2x + 3 = 7
```
输入 a=2, b=3, c=7
点击 "求解 ax + b = c"
结果: x = 2
```

### 例2: 求解 x² - 5x + 6 = 0
```
输入 a=1, b=-5, c=6
点击 "求解 ax² + bx + c = 0"
结果: x₁ = 3, x₂ = 2
```

### 例3: 求解方程组
```
x + y = 3
x - y = 1

输入:
方程1: a₁=1, b₁=1, c₁=3
方程2: a₂=1, b₂=-1, c₂=1

点击 "求解方程组"
结果: x = 2, y = 1
```

## 🛠️ 后续功能扩展建议

- [ ] 支持一元三次、四次方程
- [ ] 支持方程组的矩阵求解（3元以上）
- [ ] 支持不等式求解
- [ ] 支持函数绘图
- [ ] 支持多项式因式分解
- [ ] 添加数学公式的LaTex渲染
- [ ] 支持导出求解步骤为PDF
- [ ] 用户历史记录保存

## 💡 开发笔记

### 前端架构
- **框架**: 纯JavaScript（无框架依赖）
- **响应式**: 支持桌面和移动设备
- **API模式**: 异步调用Python后端（可选）

### Python后端架构
- **框架**: Flask + Flask-CORS
- **端口**: 5000
- **跨域**: 启用CORS支持
- **可扩展**: 易于添加新的求解器

## ⚠️ 注意事项

1. **数值精度**: JavaScript和Python都使用浮点数，可能存在精度问题
2. **无穷解/无解**: 程序会特殊处理这些情况
3. **复数解**: 二次方程如果判别式<0，目前只提示无实数解
4. **CORS**: 前端和后端必须在同一域或配置好CORS头

## 📝 许可证

自由使用和修改

---

**最后更新**: 2026年10月4日
