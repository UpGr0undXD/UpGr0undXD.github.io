#!/bin/bash

# 数学求解器 - Python后端启动脚本
# Math Solver - Python Backend Launcher

echo "=========================================="
echo "📐 数学求解器 - Python后端"
echo "Math Solver - Python Backend"
echo "=========================================="
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "✅ 后端目录: $SCRIPT_DIR"
echo ""

# 检查Python版本
echo "🐍 检查Python环境..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未找到，请先安装 Python 3.7 或更高版本"
    exit 1
fi

PYTHON_VERSION=$(python3 --version)
echo "✅ $PYTHON_VERSION"
echo ""

# 检查依赖
echo "📦 检查依赖..."
if ! python3 -m pip show Flask > /dev/null 2>&1; then
    echo "⚠️  缺少依赖，正在安装..."
    python3 -m pip install -r "$SCRIPT_DIR/requirements.txt"
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
else
    echo "✅ 所有依赖已安装"
fi

echo ""
echo "=========================================="
echo "🚀 启动服务..."
echo "=========================================="
echo ""

# 启动Flask服务
cd "$SCRIPT_DIR"
python3 server.py

# 如果服务意外退出
echo ""
echo "❌ 服务已停止"
