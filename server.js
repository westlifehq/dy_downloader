const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const douyin = require('./lib/douyin');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 配置文件路径：适配 pkg 打包（process.cwd() 为真实运行目录的路径）
const isPkg = typeof process.pkg !== 'undefined';
const exeDir = isPkg ? path.dirname(process.execPath) : process.cwd();
const CONFIG_PATH = path.join(exeDir, 'config.json');

const readline = require('readline');
function pressAnyKeyToExit() {
    console.log('\n================================');
    console.log('程序遇到错误，请截图发给开发者。');
    console.log('按任意键退出...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 1));
}

// 全局异常捕获，防止黑窗口闪退
process.on('uncaughtException', (err) => {
    console.error('\n[致命错误]', err.message);
    console.error(err.stack);
    pressAnyKeyToExit();
});
process.on('unhandledRejection', (err) => {
    console.error('\n[未捕获的 Promise 错误]', err);
    pressAnyKeyToExit();
});

// 下载任务状态存储
const downloadTasks = new Map();

/**
 * 读取配置
 */
function readConfig() {
    try {
        return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    } catch {
        return { downloadDir: '' };
    }
}

/**
 * 写入配置
 */
function writeConfig(config) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

/**
 * GET /api/config — 获取配置
 */
app.get('/api/config', (req, res) => {
    const config = readConfig();
    // 如果没有设置下载目录，用默认值
    if (!config.downloadDir) {
        config.downloadDir = path.join(require('os').homedir(), 'Downloads', 'douyin');
    }
    res.json(config);
});

/**
 * POST /api/config — 保存配置
 */
app.post('/api/config', (req, res) => {
    const { downloadDir } = req.body;
    if (!downloadDir) {
        return res.status(400).json({ error: '下载目录不能为空' });
    }

    // 确保目录存在
    try {
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir, { recursive: true });
        }
        writeConfig({ downloadDir });
        res.json({ success: true, downloadDir });
    } catch (err) {
        res.status(500).json({ error: `目录创建失败: ${err.message}` });
    }
});

/**
 * POST /api/parse — 解析抖音链接
 */
app.post('/api/parse', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: '请提供抖音视频链接' });
    }

    try {
        console.log(`[解析] 输入链接: ${url}`);

        // 1. 解析短链接
        const realUrl = await douyin.resolveShareUrl(url);
        console.log(`[解析] 真实链接: ${realUrl}`);

        // 2. 提取 video ID
        const videoId = douyin.extractVideoId(realUrl);
        console.log(`[解析] 视频 ID: ${videoId}`);

        // 3. 获取视频详情 (包含无水印 URL 等所有信息)
        const info = await douyin.fetchVideoInfo(videoId);
        console.log(`[解析] 成功! 标题: ${info.title}, URL: ${info.videoUrl}`);

        res.json({
            success: true,
            data: info,
        });
    } catch (err) {
        console.error(`[解析] 失败: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/download — 开始下载视频
 */
app.post('/api/download', async (req, res) => {
    const { videoUrl, title, awemeId, type, images } = req.body;
    const isImage = type === 'image';

    if (isImage && (!images || images.length === 0)) {
        return res.status(400).json({ error: '缺少图片数据' });
    } else if (!isImage && !videoUrl) {
        return res.status(400).json({ error: '缺少视频 URL' });
    }

    const config = readConfig();
    let downloadDir = config.downloadDir;
    if (!downloadDir) {
        downloadDir = path.join(require('os').homedir(), 'Downloads', 'douyin');
    }

    // 确保下载目录存在
    if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
    }

    // 生成文件名或目录名
    const safeName = douyin.sanitizeFilename(title || awemeId || 'douyin');
    const fileName = isImage ? `[图集]_${safeName}` : `${safeName}_${awemeId || Date.now()}.mp4`;
    const savePath = path.join(downloadDir, fileName);

    // 创建下载任务
    const taskId = uuidv4();
    downloadTasks.set(taskId, {
        id: taskId,
        status: 'downloading',
        progress: 0,
        downloaded: 0,
        total: 0,
        filePath: savePath,
        fileName,
        title,
        error: null,
        startTime: Date.now(),
    });

    // 立即返回任务 ID
    res.json({ success: true, taskId });

    // 后台下载
    try {
        let result;
        if (isImage) {
            result = await douyin.downloadImages(images, savePath, (progress, downloaded, total) => {
                const task = downloadTasks.get(taskId);
                if (task) {
                    task.progress = progress;
                    task.downloaded = downloaded;
                    task.total = total;
                }
            });
        } else {
            result = await douyin.downloadVideo(videoUrl, savePath, (progress, downloaded, total) => {
                const task = downloadTasks.get(taskId);
                if (task) {
                    task.progress = progress;
                    task.downloaded = downloaded;
                    task.total = total;
                }
            });
        }

        const task = downloadTasks.get(taskId);
        if (task) {
            task.status = 'done';
            task.progress = 100;
            task.fileSize = result.fileSize;
        }
        console.log(`[下载] 完成: ${savePath} (${(result.fileSize / 1024 / 1024).toFixed(2)} MB)`);
    } catch (err) {
        const task = downloadTasks.get(taskId);
        if (task) {
            task.status = 'error';
            task.error = err.message;
        }
        console.error(`[下载] 失败: ${err.message}`);
    }
});

/**
 * GET /api/download/:taskId — 查询下载进度
 */
app.get('/api/download/:taskId', (req, res) => {
    const task = downloadTasks.get(req.params.taskId);
    if (!task) {
        return res.status(404).json({ error: '任务不存在' });
    }
    res.json(task);
});

/**
 * GET /api/history — 获取下载历史（已完成的任务）
 */
app.get('/api/history', (req, res) => {
    const history = [];
    for (const task of downloadTasks.values()) {
        if (task.status === 'done') {
            history.push(task);
        }
    }
    // 按时间倒序
    history.sort((a, b) => b.startTime - a.startTime);
    res.json(history);
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`\n🎬 抖音视频下载器已启动`);
    console.log(`📍 http://localhost:${PORT}\n`);
});
