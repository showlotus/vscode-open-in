import { defineExtension, useCommand, useStatusBarItem } from 'reactive-vscode'
import { authentication, env, StatusBarAlignment, Uri } from 'vscode'
import VSCodeOpenInGitHubURL from '../external/vscode-open-in-github/src/url'
import { CustomAuthProvider } from './auth'
import { getMatrixAddress } from './request'
import { getConfiguration, showMessage, updateConfiguration } from './utils'

/**
 * 打开外部链接
 * @param url 链接地址
 */
function openInExternal(url: string) {
  const uri = Uri.parse(url)
  env.openExternal(uri)
}

const { activate, deactivate } = defineExtension((context) => {
  // 注册认证提供者
  const authProvider = new CustomAuthProvider(context.globalState)
  const disposable = authentication.registerAuthenticationProvider('vscode-open-in', 'VSCode Open In', authProvider)

  // 注册 GitLab 图标
  const gitlabStatusBarItem = useStatusBarItem({
    alignment: StatusBarAlignment.Left,
    priority: 0,
    text: `$(icon-gitlab)`,
    tooltip: 'Open in GitLab',
    command: 'vscodeOpenIn.openGitLab',
  })

  // 注册 Matrix 图标
  const matrixStatusBarItem = useStatusBarItem({
    alignment: StatusBarAlignment.Left,
    priority: 0,
    text: `$(icon-matrix)`,
    tooltip: 'Open in Matrix',
    command: 'vscodeOpenIn.openMatrix',
  })

  // 登录命令
  useCommand('vscodeOpenIn.signIn', async () => {
    await authProvider.signIn()
  })

  // 登出命令
  useCommand('vscodeOpenIn.signOut', async () => {
    await authProvider.signOut()
  })

  // 打开 GitLab
  useCommand('vscodeOpenIn.openGitLab', async () => {
    const gitRemoteUrl = await VSCodeOpenInGitHubURL.get(false, false)
    if (typeof gitRemoteUrl !== 'string') {
      return showMessage('当前文件未关联 Git 仓库')
    }
    openInExternal(gitRemoteUrl)
  })

  // 打开 Matrix
  useCommand('vscodeOpenIn.openMatrix', async function f() {
    // 如果命令正在执行，直接返回
    f.prototype ??= {}
    if (f.prototype.isRunning) {
      return
    }

    // 记录原图标信息
    const originalText = matrixStatusBarItem.text
    const originalTooltip = matrixStatusBarItem.tooltip

    try {
      const gitRemoteUrl = await VSCodeOpenInGitHubURL.get(false, false)
      if (typeof gitRemoteUrl !== 'string') {
        return showMessage('当前文件未关联 Git 仓库')
      }

      const gitToMatrixMap = getConfiguration('gitToMatrixMap')
      const matrixUrl = gitToMatrixMap[gitRemoteUrl]
      if (matrixUrl) {
        openInExternal(matrixUrl)
        return
      }

      // 获取有效 session，未登录会自动弹窗登录
      const session = await authProvider.getValidSession()
      if (!session) {
        return
      }

      const cookie = session.accessToken
      f.prototype.isRunning = true
      // 发送请求
      matrixStatusBarItem.text = `$(loading~spin) 正在搜索 Matrix 地址...`
      matrixStatusBarItem.tooltip = '正在搜索 Matrix 地址'
      matrixStatusBarItem.show()
      const newMatrixUrl = await getMatrixAddress(gitRemoteUrl, cookie)

      // 存储映射关系
      gitToMatrixMap[gitRemoteUrl] = newMatrixUrl
      // 保存到配置中
      updateConfiguration('gitToMatrixMap', gitToMatrixMap)
      openInExternal(newMatrixUrl)
    }
    catch (error: any) {
      showMessage(error.message, 'error')
    }
    finally {
      // 恢复原图标信息
      matrixStatusBarItem.text = originalText
      matrixStatusBarItem.tooltip = originalTooltip
      f.prototype.isRunning = false
    }
  })

  gitlabStatusBarItem.show()
  matrixStatusBarItem.show()

  // 返回清理函数
  return () => {
    disposable.dispose()
  }
})

export { activate, deactivate }
