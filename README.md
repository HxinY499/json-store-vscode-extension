# JSON Store - VSCode 插件

## 📝 简介

开发过程中是不是有需要美化 JSON 查看的场景？

还在切到浏览器在网站中美化 JSON 吗？试试这个插件吧！

JSON Store 是一个专为 VSCode 设计的 JSON 文件管理插件，让您无需在工作目录中手动创建 JSON 文件，只需点击按钮即可创建和管理 JSON 文件，直接在 VSCode 中美化和编辑 JSON，更方便，更适合程序员体质。

🎉 和工作目录无关，在一个路径下统一管理 JSON 文件，就像一个仓库。所以任何 VSCode 窗口都可以查看！

## 🎯 使用场景

- **API 测试**: 存储和管理 API 请求/响应的 JSON 数据
- **配置管理**: 管理各种配置文件的 JSON 格式
- **数据模板**: 保存常用的 JSON 数据模板
- **学习练习**: JSON 格式学习和练习
- **数据备份**: 重要 JSON 数据的集中存储

## 🚀 安装方法

1. 打开 VSCode
2. 进入扩展商店 (快捷键: `Ctrl+Shift+X`)
3. 搜索 "JSON Store"
4. 点击安装

## ⚙️ 配置选项

### 自定义存储路径

可以通过设置自定义 JSON Store 的存储位置：

1. 打开 VSCode 设置 (`Ctrl+,`)
2. 搜索 "json-store"
3. 设置 "JSON Store: Base Path"

**配置项说明：**

- `json-store.basePath`: JSON Store 的基础路径
  - 默认值: 空（使用默认路径 `~/.json-store-vscode-extension`）
  - 类型: 字符串
  - 说明: 如果为空，将使用默认路径

### 配置示例

```json
{
  "json-store.basePath": "/Users/username/my-json-store"
}
```

---

**享受在 VSCode 中管理 JSON 文件的便利吧！** 🎉
