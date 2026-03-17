// Token cache para Clerk usando expo-secure-store
// Armazena o token de sessão de forma segura no device
import * as SecureStore from 'expo-secure-store'

export interface TokenCache {
  getToken: (key: string) => Promise<string | undefined | null>
  saveToken: (key: string, value: string) => Promise<void>
  clearToken?: (key: string) => Promise<void>
}

export const tokenCache: TokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key)
      return item
    } catch (error) {
      console.error('Erro ao ler token do SecureStore:', error)
      await SecureStore.deleteItemAsync(key)
      return null
    }
  },

  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value)
    } catch (error) {
      console.error('Erro ao salvar token no SecureStore:', error)
    }
  },

  async clearToken(key: string) {
    try {
      await SecureStore.deleteItemAsync(key)
    } catch (error) {
      console.error('Erro ao limpar token do SecureStore:', error)
    }
  },
}
