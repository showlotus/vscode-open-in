/**
 * 模拟登录请求
 * @param username 用户名
 * @param password 密码
 * @returns 登录结果
 */
export function fetchLogin(username: string, password: string): Promise<Response> {
  return fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
}

/**
 * 模拟 Cookie 登录请求
 * @param cookie Cookie
 * @returns 登录结果
 */
export async function fetchCookieLogin<T = {
  code: number
  message: string
  success: boolean
  data: { username: string }
}>(cookie: string): Promise<T> {
  const res = await fetch('http://localhost:3000/api/userInfo', {
    method: 'GET',
    headers: { Cookie: cookie },
  })
  return await (res.json() as Promise<T>)
}

/**
 * 获取 Matrix 地址
 * @param gitAddress 仓库地址
 * @param cookie Matrix Cookie
 * @returns Matrix 地址
 */
export async function getMatrixAddress(gitAddress: string, cookie: string): Promise<string> {
  const res = await fetch(`http://localhost:3000/api/data?gitAddress=${gitAddress}`, {
    method: 'GET',
    headers: { Cookie: cookie },
  })
  return (await res.json() as { data: string }).data
}
