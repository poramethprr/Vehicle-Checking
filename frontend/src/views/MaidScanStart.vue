<template>
  <div class="max-w-md mx-auto">
    <div class="relative bg-linear-to-r from-purple-600 to-fuchsia-500 dark:from-purple-950 dark:to-fuchsia-950 rounded-2xl px-6 py-5 mb-5 overflow-hidden shadow-md shadow-purple-200 dark:shadow-black/20">
      <div class="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none"></div>
      <div class="relative flex items-center gap-3">
        <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <QrCodeIcon class="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 class="text-lg font-bold text-white">สแกน QR Code</h1>
          <p class="text-purple-100 text-xs mt-0.5">สแกนป้าย QR ที่จุดทำความสะอาด</p>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden">

      <!-- Start screen -->
      <div v-if="!cameraActive" class="p-8 flex flex-col items-center gap-5">
        <div class="w-28 h-28 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
          <QrCodeIcon class="w-16 h-16 text-purple-500 dark:text-purple-400" />
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed">
          กดปุ่มด้านล่าง แล้วจ่อกล้องไปที่ QR Code<br>ที่แปะไว้ในจุดทำความสะอาด
        </p>
        <button @click="cameraActive = true" class="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-purple-200 dark:shadow-purple-900/40">
          <CameraIcon class="w-5 h-5" />
          เปิดกล้องสแกน QR Code
        </button>
      </div>

      <!-- Camera / scanner -->
      <div v-else>
        <div class="relative bg-black overflow-hidden" style="aspect-ratio:1">
          <qrcode-stream
            :constraints="{ facingMode: 'environment' }"
            @detect="onDetect"
            @camera-on="onCameraOn"
            @error="onError"
            class="w-full h-full"
          />

          <!-- Animated scan line -->
          <div v-if="cameraReady && !paused" class="scan-line absolute left-4 right-4 h-0.5 bg-purple-400/80 shadow-[0_0_8px_2px_rgba(168,85,247,0.6)] rounded-full pointer-events-none"></div>

          <!-- Corner frame -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="relative w-52 h-52">
              <div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-400 rounded-tl-lg"></div>
              <div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-400 rounded-tr-lg"></div>
              <div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-400 rounded-bl-lg"></div>
              <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-400 rounded-br-lg"></div>
            </div>
          </div>

          <!-- Loading overlay -->
          <div v-if="!cameraReady" class="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-3">
            <div class="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-white text-xs">กำลังเปิดกล้อง...</p>
          </div>

          <!-- Scanned flash -->
          <Transition name="flash">
            <div v-if="flashVisible" class="absolute inset-0 bg-white/30 pointer-events-none"></div>
          </Transition>
        </div>

        <div class="p-4 flex items-center justify-between gap-3">
          <p class="text-xs text-slate-400">จ่อกล้องไปที่ QR Code บนป้ายในจุดทำความสะอาด</p>
          <button @click="cameraActive = false" class="shrink-0 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-xs text-slate-600 dark:text-slate-300 font-medium transition">
            ปิดกล้อง
          </button>
        </div>
      </div>

      <!-- Error -->
      <div v-if="errorMsg" class="p-4 border-t border-red-100 dark:border-red-800/30 bg-red-50 dark:bg-red-900/20">
        <p class="text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
          <ExclamationCircleIcon class="w-4 h-4 shrink-0 mt-0.5" />
          {{ errorMsg }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { QrcodeStream } from 'vue-qrcode-reader'
import { QrCodeIcon, CameraIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const cameraActive = ref(false)
const cameraReady = ref(false)
const paused = ref(false)
const flashVisible = ref(false)
const errorMsg = ref('')

const SCAN_COOLDOWN = 1500
let lastToken = ''
let lastTime = 0

function onCameraOn() {
  cameraReady.value = true
  errorMsg.value = ''
}

function onError(err) {
  cameraActive.value = false
  cameraReady.value = false
  if (err.name === 'NotAllowedError') {
    errorMsg.value = 'ถูกปฏิเสธการใช้กล้อง — กรุณาอนุญาตกล้องในการตั้งค่าเบราว์เซอร์'
  } else if (err.name === 'NotFoundError') {
    errorMsg.value = 'ไม่พบกล้องในอุปกรณ์นี้'
  } else {
    errorMsg.value = err.message || String(err)
  }
}

async function onDetect(detectedCodes) {
  const raw = detectedCodes?.[0]?.rawValue
  if (!raw) return

  // Cooldown — ป้องกันสแกนซ้ำ
  const now = Date.now()
  if (raw === lastToken && now - lastTime < SCAN_COOLDOWN) return
  lastToken = raw
  lastTime = now

  // Flash feedback
  flashVisible.value = true
  setTimeout(() => { flashVisible.value = false }, 200)

  // Extract area ID from URL: /maid/scan/:id
  const match = raw.match(/\/maid\/scan\/([^/?#]+)/)
  if (match) {
    paused.value = true
    router.push('/maid/scan/' + match[1])
  } else {
    errorMsg.value = 'QR Code นี้ไม่ใช่จุดทำความสะอาดในระบบ'
  }
}
</script>

<style scoped>
.scan-line {
  animation: scan 2s linear infinite;
}
@keyframes scan {
  0%   { top: 5%; }
  50%  { top: 95%; }
  100% { top: 5%; }
}
.flash-enter-active, .flash-leave-active { transition: opacity 0.2s; }
.flash-enter-from, .flash-leave-to { opacity: 0; }
</style>
