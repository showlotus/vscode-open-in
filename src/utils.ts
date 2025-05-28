import type { Configuration, ConfigurationKeys } from './types'
import { useLogger } from 'reactive-vscode'
import { window, workspace } from 'vscode'
import { displayName } from './generated/meta'

export const logger = useLogger(displayName)

/**
 * 读取插件的配置信息
 */
export function getConfiguration<T extends ConfigurationKeys>(
  name: T,
): Configuration[T] {
  const config = workspace.getConfiguration('vscodeOpenIn')
  return config.get(name)!
}

/**
 * 更新插件的配置信息
 */
export function updateConfiguration<T extends ConfigurationKeys>(
  name: T,
  value: Configuration[T],
) {
  const config = workspace.getConfiguration('vscodeOpenIn')
  config.update(name, value, true)
}

/**
 * 显示消息
 * @param message 消息内容
 * @param type 消息类型，默认 info
 */
export function showMessage(message: string, type: 'error' | 'info' | 'warning' = 'info') {
  const prefix = 'VSCode Open In: '
  if (type === 'error') {
    window.showErrorMessage(prefix + message)
  }
  else if (type === 'warning') {
    window.showWarningMessage(prefix + message)
  }
  else {
    window.showInformationMessage(prefix + message)
  }
}
