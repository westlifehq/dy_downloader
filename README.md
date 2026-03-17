# Video Downloader (全平台视频无水印下载器)

> 🚀 一个基于 Node.js 构建的现代化、极简、高颜值的全平台视频内容解析及下载工具。

![UI Preview](https://img.shields.io/badge/Status-Active-success)
![Version](https://img.shields.io/badge/Version-1.1.0-blue)
![Nodejs](https://img.shields.io/badge/Node.js-18.x-blue)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 核心特性

- **跨平台解析**：支持 **抖音 (Douyin)** 和 **小红书 (Xiaohongshu)** 视频内容解析，自动识别平台并切换引擎。
- **无水印原画质**：直取底层接口，下载官方无压缩、无水印的 1080P/720P 原视频。
- **自动短链追踪**：完美支持分享短链接，自动识别并跟随 302 重定向。
- **极速批量处理**：支持在输入框同时粘贴多条链接，自动剥离文字，多线程并行解析与下载。
- **高级定制 UI v2**：采用全新的 **Premium Minimalist (紫/靛蓝)** 暗色毛玻璃设计，视觉更高级。
- **跨平台一键部署**：无论是 Mac、Windows 还是 Linux，仅需 Node 环境即可轻松跑满带宽。

---

## 📸 功能演示

<img width="715" height="267" alt="image" src="https://github.com/user-attachments/assets/d88a4760-5625-45e0-aad0-2799da7286db" />


---

## 🛠 快速开始 / Quick Start

### 环境依赖
确保你已经安装了 [Node.js](https://nodejs.org/) (推荐 v16 以上版本)。

### 安装步骤

1. 克隆本项目到本地
```bash
git clone https://github.com/yourusername/douyin-downloader.git
cd douyin-downloader
```

2. 安装依赖模块
```bash
npm install
```

3. 本地启动服务（Mac 用户可直接双击项目中的 `启动抖音下载器.command`）
```bash
npm run dev
# 或直接执行 node server.js
```

4. 自动打开浏览器体验
服务启动后，浏览器会自动运行或手动访问 [http://localhost:3000](http://localhost:3000) 。

---

## 📦 如何打包成可执行文件 (.exe)

如果你想发给没有安装 Node.js 的 Windows 朋友使用，本项目已内置 `pkg` 打包脚本。

```bash
# 生成 Windows 64 位单文件程序
npm run build:exe
```
生成的 `douyin-downloader.exe` 可以拷贝到任何 Windows 电脑双击即用（会默认启动 3000 端口）。

<details>
<summary><b>pkg 打包兼容性说明</b></summary>
提示：为了完美兼容 `pkg` 对动态加载模块的封装，项目中已将请求库 `axios` 锁定为原生友好的 `0.27.2` 经典版本。请勿轻易升级 axios 版本，否则可能导致 `.exe` 打包后运行时报错找不到模块。
</details>

---

## ⚙ 技术栈

* **后端**：`Node.js`, `Express`, `Axios`
* **前端**：`Vanilla JavaScript`, `CSS3 Variables`, `HTML5`
* **打包工具**：`pkg`

---

## ⚠️ 免责声明 (Disclaimer)

* 本项目**仅供个人学习、技术研究与编程练习使用**。
* 请遵守国家法律法规及各平台的使用条款，**请勿将本工具用于商业牟利、侵权、非法传播或其他不当用途**。
* 一切因滥用本工具而产生的法律纠纷或平台封禁，开发者概不负责。

---

## 🤝 贡献与支持 (Contributing)

欢迎提交 [Issue](https://github.com/yourusername/douyin-downloader/issues) 反馈 Bug 或提交 [Pull Request](https://github.com/yourusername/douyin-downloader/pulls) 完善功能。

如果你觉得这个小工具好用，不妨点个 ⭐️ **Star** 支持一下开发者！

---
## 📝 License
[MIT License](LICENSE) © 2024
