# 使用轻量级 Node.js 基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /usr/src/app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制主程序
COPY . .

# 暴露端口
EXPOSE 3099

# 启动命令
CMD ["npm", "start"]
