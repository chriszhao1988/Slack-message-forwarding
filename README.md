## Slack 消息转发服务（Slack-message-forwarding）
一个用于将 Slack 消息实时转发到钉钉（DingTalk）的轻量级 Node.js 服务。

### 功能概述
- 接收来自 Slack Events API 的消息事件
- 自动识别指定频道的消息并进行内容缩略处理
- 将消息格式化后转发至钉钉 Webhook 地址
- 支持自定义频道 ID 到名称的映射
- 提供健康检查接口 /health

### 快速开始
#### 安装依赖
```shell

npm install
npm run start

```


### 📬 联系作者
如有问题或建议，请联系：Chris(ChrisChiu)