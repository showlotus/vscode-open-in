export interface Configuration {
  gitToMatrixMap: Record<string, string>
}

export type ConfigurationKeys = keyof Configuration
