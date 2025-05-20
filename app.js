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
const { WebClient } = require('@slack/web-api');

const app = express();
const PORT = process.env.PORT;

// 钉钉 Webhook 地址（需替换为你的机器人地址）
const DINGTALK_WEBHOOK = process.env.DINGTALK_WEBHOOK;

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

// 解析 Slack 的 JSON 格式请求体
app.use(bodyParser.json());

const CHANNEL_MAP = {
    "C05J46JSUF5": "dev-general",
    "C08JURBH684": "tn-content",
    "D064QMBDUTD": "Linear",
    "C0827BYN34H": "grafana-alert-sentinel"
};

let userCache = {};

// 初始化用户缓存
async function initializeUserCache() {
    const client = new WebClient(SLACK_BOT_TOKEN);
    try {
        const response = await client.users.list();
        userCache = response.members.reduce((acc, user) => {
            acc[user.id] = user.real_name || user.name;
            return acc;
        }, {});
        console.log(`Initialized user cache with ${Object.keys(userCache).length} users`);
    } catch (error) {
        console.error('Failed to fetch user list:', error.message);
    }
}


// 获取用户名（优先缓存）
async function getUserName(userId) {
    if (userCache[userId]) {
        return userCache[userId];
    }
    const client = new WebClient(SLACK_BOT_TOKEN);
    try {
        const response = await client.users.info({ user: userId });
        const username = response.user.name;
        userCache[userId] = username;
        return username;
    } catch (error) {
        console.error(`Failed to get user info for ${userId}:`, error.message);
        return userId;
    }
}

// 解析 JSON 请求体
app.use(bodyParser.json());


// Slack Webhook 入口
app.post('/slack', async (req, res) => {
    const { challenge } = req.body || {};
    // 关键逻辑：验证 URL 时必须直接返回 challenge 值
    if (challenge) {
        return res.status(200).send(challenge);
    }
    const slackData = req.body;
    if(slackData.event.type==='message' && slackData.event.text) {
        const slackText = slackData.event.text;

        // 定义最大长度
        const MAX_LENGTH = 100;
        let processedText = slackText;

        // 如果内容过长，进行缩略
        if (slackText.length > MAX_LENGTH) {
            processedText = slackText.substring(0, MAX_LENGTH) + '...';
        }

        const channel = slackData.event.channel;
        const channelName = CHANNEL_MAP[channel] || channel;
        const userId = slackData.event.user;
        const userName = await getUserName(userId);

        // 构造钉钉消息体（文本格式）
        const dingtalkData = {
            msgtype: "text",
            text: {
                content: `【slack消息】\n${userName}: ${processedText}\n(消息来自群聊${channelName})`
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
    }
});

// 健康检查接口
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(PORT, '0.0.0.0', async () => {
    await initializeUserCache(); // 启动时初始化缓存
    setInterval(initializeUserCache, 24 * 60 * 60 * 1000); // 每天刷新一次
    console.log(`Server running on port ${PORT}`);
});
