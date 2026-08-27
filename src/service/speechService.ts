import type { SpeechService } from './contracts'
import { speakOnDevice, stopSpeakingOnDevice } from './deviceAdapters'

export const speechService: SpeechService = {
  async speak(text) {
    if (!text.trim()) throw new Error('읽을 문장을 적어 주세요.')
    await speakOnDevice(text.trim())
  },

  async stop() {
    await stopSpeakingOnDevice()
  },
}
