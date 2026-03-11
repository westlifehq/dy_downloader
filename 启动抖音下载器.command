#!/bin/bash
echo "正在启动抖音视频下载器..."

# 获取当前脚本所在目录
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# 检查 3000 端口是否被占用，如果是，先杀掉占用进程
PORT=3000
PID=$(lsof -ti:$PORT)
if [ ! -z "$PID" ]; then
    echo "清理被占用的 $PORT 端口 (PID: $PID)..."
    kill -9 $PID
fi

# 启动 Node 服务并在后台运行
node server.js &
NODE_PID=$!

# 等待 1 秒确保服务启动
sleep 1

# 用默认浏览器打开本地网页
open "http://localhost:$PORT"

echo ""
echo "==============================================="
echo "✅ 服务已运行！你可以直接在这个终端窗口看到下载进度"
echo "⚠️  如果要停止程序，请直接关闭这个终端窗口即可"
echo "==============================================="

# 让脚本等待后台 Node 进程，防止终端闪退
wait $NODE_PID
