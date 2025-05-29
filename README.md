# VSCode Open In

一个用于快速在浏览器中打开当前文件对应 GitLab 和 Matrix 页面的 VSCode 扩展插件。

![VSCode Open In GitLab](https://raw.githubusercontent.com/showlotus/vscode-open-in/main/docs-res/gitlab.png)

![VSCode Open In Matrix](https://raw.githubusercontent.com/showlotus/vscode-open-in/main/docs-res/matrix.png)

## 功能特性 ✨

- 🔗 支持在浏览器中打开当前文件对应的 GitLab 仓库页面
- 🔗 支持在浏览器中打开当前文件对应的 Matrix 系统页面
- 🔐 支持 Matrix 系统的登录和登出
  - 账号密码登录
  - Matrix Cookie 登录
- ⚙️ 支持 Git 仓库地址到 Matrix 地址的映射配置
- 🖥️ 状态栏快捷操作
  - GitLab 图标：快速打开 GitLab 页面
  - Matrix 图标：快速打开 Matrix 页面

## 使用方法 🚀

1. 安装插件后，VSCode 状态栏会显示 GitLab 和 Matrix 图标
2. 点击对应图标即可在浏览器中打开当前文件对应的页面
3. 首次使用 Matrix 功能时需要登录
4. 可以在设置中配置 Git 仓库地址到 Matrix 地址的映射关系

## 配置项 ⚙️

<!-- configs -->

| Key                           | Description                                           | Type     | Default |
| ----------------------------- | ----------------------------------------------------- | -------- | ------- |
| `vscodeOpenIn.gitToMatrixMap` | Git 地址到 Matrix 地址的映射关系，key 为 Git 地址，value 为 Matrix 地址 | `object` | `{}`    |

<!-- configs -->

## 命令支持 ⌨️

<!-- commands -->

| Command                   | Title                          | Description |
| ------------------------- | ------------------------------ | ----------- |
| `vscodeOpenIn.openGitLab` | VSCode Open In: Open in GitLab | Open the current project in GitLab |
| `vscodeOpenIn.openMatrix` | VSCode Open In: Open in Matrix | Open the current project in Matrix |
| `vscodeOpenIn.signIn`     | VSCode Open In: Sign In        | Sign in to Matrix |
| `vscodeOpenIn.signOut`    | VSCode Open In: Sign Out       | Sign out of Matrix |

<!-- commands -->

## 开发相关 🛠️

- 使用 TypeScript 开发
- 基于 reactive-vscode 框架
- 依赖 vscode-open-in-github 插件

### 安装依赖

```shell
pnpm i
```

### 启动本地服务端

```shell
cd server && pnpm dev
```

### 打开调试

快捷键 `F5` 打开调试
