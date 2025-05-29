import type { AuthenticationProvider, AuthenticationProviderAuthenticationSessionsChangeEvent, AuthenticationSession, Memento } from 'vscode'
import { EventEmitter, ProgressLocation, window } from 'vscode'
import { fetchCookieLogin, fetchLogin } from './request'
import { showMessage } from './utils'

// 认证提供者类
export class CustomAuthProvider implements AuthenticationProvider {
  // 用于存储认证会话
  private _sessions: AuthenticationSession[] = []
  // 用于通知认证会话变化
  private _onDidChangeSessions = new EventEmitter<AuthenticationProviderAuthenticationSessionsChangeEvent>()
  // 用于持久化存储
  private _memento: Memento

  constructor(memento: Memento) {
    this._memento = memento
    // 从持久化存储中恢复会话
    this._sessions = this._memento.get<AuthenticationSession[]>('sessions', [])
  }

  // 获取认证会话变化事件
  get onDidChangeSessions() {
    return this._onDidChangeSessions.event
  }

  // 获取所有认证会话
  async getSessions(): Promise<AuthenticationSession[]> {
    return this._sessions
  }

  // 保存会话到持久化存储
  private async _saveSessions() {
    await this._memento.update('sessions', this._sessions)
  }

  // 创建新的认证会话（无参数，内部弹出表单）
  async createSession(): Promise<AuthenticationSession> {
    // 先进行所有输入和校验，只有在准备发起网络请求时才显示进度条
    const methodPick = await window.showQuickPick([
      {
        label: '账号密码登录',
        description: '[推荐]',
        detail: '通过输入 Matrix 账号和密码进行登录',
      },
      {
        label: 'Matrix Cookie',
        description: '',
        detail: '使用从浏览器复制的 Matrix Cookie 进行登录',
      },
    ], {
      placeHolder: '',
      matchOnDescription: true,
      matchOnDetail: true,
    })
    if (!methodPick)
      return Promise.resolve({} as AuthenticationSession)

    const method = methodPick.label

    let username = ''
    let password = ''
    let cookie = ''

    if (method === '账号密码登录') {
      // 账号输入
      username = await window.showInputBox({ prompt: '请输入 Matrix 用户名' }) || ''
      if (!username)
        return Promise.resolve({} as AuthenticationSession)
      // 密码输入
      password = await window.showInputBox({ prompt: '请输入 Matrix 密码', password: true }) || ''
      if (!password)
        return Promise.resolve({} as AuthenticationSession)
    }
    else {
      // Cookie 输入
      cookie = await window.showInputBox({ prompt: '请输入 Matrix Cookie', password: true }) || ''
      if (!cookie)
        return Promise.resolve({} as AuthenticationSession)
    }

    // 只有到这里才显示进度条，进行网络请求
    return window.withProgress({
      location: ProgressLocation.Notification,
      title: 'VSCode Open In - 登录中',
      cancellable: true, // 允许用户取消
    }, async () => {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => {
        let session: AuthenticationSession
        try {
          if (method === '账号密码登录') {
            // 账号密码登录请求
            const response = await fetchLogin(username, password)
            const data = await response.json() as { code: number, message: string, success: boolean, data: { username: string } }
            if (!data.success)
              throw new Error(data.message || '登录失败')
            session = {
              id: username,
              accessToken: response.headers.get('set-cookie') || '',
              account: { id: username, label: username },
              scopes: [],
            }
          }
          else {
            // Cookie 登录请求
            const data = await fetchCookieLogin(cookie)
            if (!data.success)
              throw new Error(data.message || 'Cookie 无效')
            const username = data.data.username
            session = {
              id: username,
              accessToken: cookie,
              account: { id: username, label: username },
              scopes: [],
            }
          }

          this._sessions.push(session)
          await this._saveSessions()
          this._onDidChangeSessions.fire({ added: [session], removed: [], changed: [] })
          resolve(session)
          showMessage('登录成功！', 'info')
        }
        catch (error: any) {
          reject(error)
        }
      })
    })
  }

  // 移除认证会话
  async removeSession(sessionId: string): Promise<void> {
    const session = this._sessions.find(s => s.id === sessionId)
    if (session) {
      this._sessions = this._sessions.filter(s => s.id !== sessionId)
      await this._saveSessions()
      this._onDidChangeSessions.fire({ added: [], removed: [session], changed: [] })
    }
  }

  // 登录方法，已登录则提示，否则调用 createSession 进行登录
  async signIn() {
    try {
      // 获取当前所有认证会话
      const sessions = await this.getSessions()
      if (sessions.length > 0) {
        // 已经登录，弹出提示
        showMessage('已登录', 'info')
        return
      }
      await this.createSession()
    }
    catch (error: any) {
      showMessage(`登录失败：${error.message}`, 'error')
    }
  }

  // 登出方法，未登录则提示，已登录则弹窗确认后移除 session
  async signOut() {
    // 获取当前所有认证会话
    const sessions = await this.getSessions()
    if (sessions.length === 0) {
      // 未登录，弹出提示
      showMessage('未登录', 'info')
      return
    }
    // 显示确认对话框
    const result = await window.showWarningMessage(
      'VSCode Open In',
      {
        modal: true,
        detail: '确定要退出登录吗？',
      },
      '确定',
    )
    if (result === '确定') {
      try {
        await this.removeSession(sessions[0].id)
        showMessage('退出登录成功！', 'info')
      }
      catch (error: any) {
        showMessage(`退出登录失败：${error.message}`, 'error')
      }
    }
  }

  /**
   * 获取有效的认证会话，未登录则自动登录
   */
  async getValidSession(): Promise<AuthenticationSession | null> {
    // 获取当前所有认证会话
    let sessions = await this.getSessions()
    // 如果未登录或 accessToken 为空，则自动登录
    if (sessions.length === 0 || !sessions[0].accessToken) {
      await this.signIn()
      sessions = await this.getSessions()
      if (sessions.length === 0 || !sessions[0].accessToken) {
        // 登录失败或被取消
        return null
      }
    }
    // 返回有效 session
    return sessions[0]
  }
}
