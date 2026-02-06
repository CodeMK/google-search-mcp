# Google Cookies 导入指南

## 问题说明

Google 检测到自动化浏览器时会触发 CAPTCHA。要绕过这个问题，需要使用真实浏览器的 cookies。

## 解决方案

### 方法一：使用真实浏览器 Cookies（推荐）

#### 步骤 1：安装浏览器扩展

1. 安装 Chrome 扩展 "EditThisCookie"
   - 链接：https://chrome.google.com/webstore/detail/editthiscookie/

#### 步骤 2：获取 Cookies

1. 在 Chrome 中打开 https://www.google.com
2. 确保你已登录 Google 账号（可选但推荐）
3. 点击浏览器右上角的 EditThisCookie 图标
4. 点击 "Export" 导出 cookies
5. 将导出的 JSON 文件保存到项目的 `./data/cookies/imported-cookies.json`

#### 步骤 3：转换 Cookies 格式

导出的 cookies 需要转换格式。运行以下命令：

```bash
node scripts/import-cookies.js
```

### 方法二：非 Headless 模式手动解决验证码

1. 修改 `.env` 文件：
   ```
   HEADLESS=false
   ```

2. 重启服务器：
   ```bash
   npm start
   ```

3. 发送搜索请求，浏览器会自动打开
4. 手动完成 Google 的验证码
5. cookies 会自动保存到 `./data/cookies/` 目录

### 方法三：使用代理服务器（推荐用于中国大陆）

如果你在中国大陆，Google 会触发更严格的检测。建议：

1. 使用代理服务器（香港、美国等地区）
2. 配置代理：
   ```bash
   # 在 .env 文件中配置
   PROXY_ENABLED=true
   PROXY_LIST=http://proxy1:port,http://proxy2:port
   ```

## Cookies 位置

Cookies 保存位置：`./data/cookies/`

文件命名格式：`cookies-google.com-{timestamp}.json`

## 自动保存

程序会在每次成功搜索后自动保存 cookies，供下次使用。

## 故障排除

### 问题：仍然遇到 CAPTCHA

**解决方案**：
1. 确保使用最新的 cookies（7天内）
2. 尝试使用代理服务器
3. 减少搜索频率（每次请求间隔至少 5 秒）

### 问题：Cookies 无效

**解决方案**：
1. 从真实浏览器重新导出 cookies
2. 确保导出时在 google.com 域名下
3. 检查 cookies 是否过期

## 验证 Cookies 是否有效

发送请求后查看日志：
- 成功：`Successfully loaded Google cookies`
- 失败：`No cookies found for domain: google.com`
