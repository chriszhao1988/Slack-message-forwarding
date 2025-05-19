/**
 * Create with Slack-message-forwarding
 * Author: Chris(ChrisChiu)
 * Date: 2025/5/19
 * Desc:
 */
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

// 钉钉 Webhook 地址（需替换为你的机器人地址）
const DINGTALK_WEBHOOK = process.env.DINGTALK_WEBHOOK;

// 解析 Slack 的 JSON 格式请求体
app.use(bodyParser.json());

// Slack Webhook 入口
app.post('/slack', async (req, res) => {
    const { challenge } = req.body || {};
    // 关键逻辑：验证 URL 时必须直接返回 challenge 值
    if (challenge) {
        return res.status(200).send(challenge);
    }
    const slackData = req.body;
    const slackText = slackData.text || '无内容';

    // 构造钉钉消息体（文本格式）
    const dingtalkData = {
        msgtype: "text",
        text: {
            content: `【消息】\n${slackText}`
        }
    };

    try {
        // 发送消息到钉钉
        await axios.post(DINGTALK_WEBHOOK, dingtalkData);
        res.status(200).send('Forwarded to DingTalk');
    } catch (error) {
        console.error('Failed to send to DingTalk:', error.message);
        res.status(500).send('Failed to forward');
    }
});

// 健康检查接口
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
