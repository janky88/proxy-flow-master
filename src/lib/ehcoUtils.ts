
import { EhcoConfig, EhcoRelayConfig, PortForwardingRule, Server } from '@/lib/types';

/**
 * 创建安装 Ehco 的脚本
 */
export const generateEhcoInstallScript = (server: Server): string => {
  return `#!/bin/bash
# Ehco 安装脚本 - 为服务器 ${server.name} (${server.host}) 生成
echo "开始安装 Ehco..."

# 检查系统架构
ARCH=$(uname -m)
EHCO_VERSION="v1.1.1"

if [ "$ARCH" == "x86_64" ]; then
  DOWNLOAD_URL="https://github.com/Ehco1996/ehco/releases/download/$EHCO_VERSION/ehco_1.1.1_linux_amd64"
elif [ "$ARCH" == "aarch64" ]; then
  DOWNLOAD_URL="https://github.com/Ehco1996/ehco/releases/download/$EHCO_VERSION/ehco_1.1.1_linux_arm64"
else
  echo "不支持的系统架构: $ARCH"
  exit 1
fi

# 下载 Ehco 二进制文件
wget -N --no-check-certificate $DOWNLOAD_URL -O /usr/local/bin/ehco
if [ $? -ne 0 ]; then
  echo "下载 Ehco 失败，请检查网络连接"
  exit 1
fi

# 设置执行权限
chmod +x /usr/local/bin/ehco

# 检查是否安装成功
if [ -f /usr/local/bin/ehco ]; then
  echo "Ehco 安装成功！"
  echo "版本信息:"
  /usr/local/bin/ehco -v
else
  echo "Ehco 安装失败"
  exit 1
fi

# 创建服务管理脚本
cat > /etc/systemd/system/ehco.service << EOF
[Unit]
Description=Ehco Proxy Service
After=network.target

[Service]
Type=simple
User=root
Restart=always
RestartSec=5s
ExecStart=/usr/local/bin/ehco -c /etc/ehco.json
ExecReload=/bin/kill -HUP $MAINPID
ExecStop=/bin/kill -s QUIT $MAINPID

[Install]
WantedBy=multi-user.target
EOF

echo "Ehco 服务已创建"
echo "安装完成"
`;
};

/**
 * 创建配置 Ehco 的脚本
 */
export const generateEhcoConfigScript = (
  server: Server, 
  rules?: PortForwardingRule[]
): string => {
  // 创建默认配置
  const defaultConfig: EhcoConfig = {
    web_host: "0.0.0.0",
    web_port: 9000,
    enable_ping: true,
    relay_configs: []
  };

  // 从本地存储获取规则
  if (!rules || rules.length === 0) {
    const rulesJson = localStorage.getItem('portForwardingRules');
    if (rulesJson) {
      rules = JSON.parse(rulesJson);
    }
  }

  // 如果提供了规则，则添加到配置中
  if (rules && rules.length > 0) {
    rules.forEach(rule => {
      if (rule.entryServer.id === server.id) {
        const relayConfig: EhcoRelayConfig = {
          listen: `0.0.0.0:${rule.entryPort}`,
          listen_type: "raw",
          transport_type: rule.transportType || "ws",
          tcp_remotes: rule.targetHosts.map(target => `${target.host}:${target.port}`)
        };

        // 添加UDP远程目标（如果适用）
        if (rule.protocols.includes('udp')) {
          relayConfig.udp_remotes = rule.targetHosts.map(target => `${target.host}:${target.port}`);
        }

        // 添加加密选项（如果适用）
        if (rule.exitEncryption && rule.key) {
          relayConfig.encrypt = true;
          relayConfig.key = rule.key;
        }

        // 添加压缩选项（如果适用，且不是原始TCP模式）
        if (rule.exitCompression && rule.transportType !== 'raw') {
          relayConfig.compress = true;
        }

        // 添加缓冲区大小（如果适用）
        if (rule.bufferSize) {
          relayConfig.buffer_size = rule.bufferSize;
        }

        defaultConfig.relay_configs.push(relayConfig);
      }
    });
  }

  // 如果没有找到适用的规则，添加一个示例配置
  if (defaultConfig.relay_configs.length === 0) {
    defaultConfig.relay_configs.push({
      listen: "0.0.0.0:1234",
      listen_type: "raw",
      transport_type: "ws",
      tcp_remotes: ["example.com:5678"],
      udp_remotes: ["example.com:5678"]
    });
  }

  // 生成配置脚本
  return `#!/bin/bash
# Ehco 配置脚本 - 为服务器 ${server.name} (${server.host}) 生成
echo "配置 Ehco 转发..."

# 创建配置目录
mkdir -p /etc/ehco

# 写入配置文件
cat > /etc/ehco.json << 'EOF'
${JSON.stringify(defaultConfig, null, 2)}
EOF

echo "Ehco 配置文件已创建: /etc/ehco.json"

# 重启 Ehco 服务
systemctl daemon-reload
systemctl enable ehco
systemctl restart ehco

# 检查服务状态
sleep 2
systemctl status ehco

echo "Ehco 配置完成并已启动！"
`;
};

/**
 * 生成 Ehco 状态检查脚本
 */
export const generateEhcoStatusScript = (server: Server): string => {
  return `#!/bin/bash
# Ehco 状态检查脚本 - 为服务器 ${server.name} (${server.host}) 生成
echo "检查 Ehco 状态..."

# 检查 Ehco 是否已安装
if [ ! -f /usr/local/bin/ehco ]; then
  echo "Ehco 未安装"
  exit 1
fi

# 获取版本信息
EHCO_VERSION=$(/usr/local/bin/ehco -v 2>&1)
echo "Ehco 版本: $EHCO_VERSION"

# 检查服务状态
if systemctl is-active --quiet ehco; then
  echo "Ehco 服务正在运行"
  
  # 获取 Ehco 进程信息
  EHCO_PROC=$(ps -ef | grep ehco | grep -v grep)
  echo "进程信息: $EHCO_PROC"
  
  # 获取监听端口
  echo "监听端口:"
  netstat -tulpn | grep ehco
  
  # 获取服务运行时间
  echo "服务运行时间:"
  systemctl show ehco -p ActiveState,SubState,ActiveEnterTimestamp | cat
  
  # 查看最近的日志
  echo "最近的日志:"
  journalctl -u ehco --no-pager -n 10
else
  echo "Ehco 服务未运行"
  
  # 检查配置文件
  if [ -f /etc/ehco.json ]; then
    echo "配置文件存在: /etc/ehco.json"
    echo "配置内容:"
    cat /etc/ehco.json
  else
    echo "配置文件不存在"
  fi
fi

echo "状态检查完成"
`;
};

/**
 * 生成 Ehco 启动脚本
 */
export const generateEhcoStartScript = (server: Server): string => {
  return `#!/bin/bash
# Ehco 启动脚本 - 为服务器 ${server.name} (${server.host}) 生成
echo "启动 Ehco 服务..."

# 检查 Ehco 是否已安装
if [ ! -f /usr/local/bin/ehco ]; then
  echo "Ehco 未安装，请先安装 Ehco"
  exit 1
fi

# 检查配置文件是否存在
if [ ! -f /etc/ehco.json ]; then
  echo "配置文件不存在，请先配置 Ehco"
  exit 1
fi

# 启动 Ehco 服务
systemctl daemon-reload
systemctl enable ehco
systemctl restart ehco

# 检查服务状态
sleep 2
if systemctl is-active --quiet ehco; then
  echo "Ehco 服务启动成功"
  systemctl status ehco
else
  echo "Ehco 服务启动失败"
  journalctl -u ehco --no-pager -n 20
  exit 1
fi

echo "启动完成"
`;
};

/**
 * 生成 Ehco 停止脚本
 */
export const generateEhcoStopScript = (server: Server): string => {
  return `#!/bin/bash
# Ehco 停止脚本 - 为服务器 ${server.name} (${server.host}) 生成
echo "停止 Ehco 服务..."

# 停止 Ehco 服务
systemctl stop ehco

# 检查服务状态
if systemctl is-active --quiet ehco; then
  echo "Ehco 服务停止失败"
  exit 1
else
  echo "Ehco 服务已停止"
fi

echo "停止完成"
`;
};

/**
 * 生成 Ehco 卸载脚本
 */
export const generateEhcoUninstallScript = (server: Server): string => {
  return `#!/bin/bash
# Ehco 卸载脚本 - 为服务器 ${server.name} (${server.host}) 生成
echo "开始卸载 Ehco..."

# 停止 Ehco 服务
systemctl stop ehco
systemctl disable ehco

# 删除服务文件
rm -f /etc/systemd/system/ehco.service
systemctl daemon-reload

# 删除二进制文件
rm -f /usr/local/bin/ehco

# 删除配置文件
rm -f /etc/ehco.json

echo "Ehco 已卸载"
`;
};
