<template>
    <div
        class="min-h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-yellow-50 p-4">
        <div class="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6">
            <h2 class="text-2xl font-bold text-blue-900 mb-6 text-center">เลือกกล้องที่ต้องการดูแบบเรียลไทม์</h2>
            <div v-if="loading" class="flex justify-center items-center py-10">
                <span class="loading loading-spinner loading-lg text-blue-700"></span>
            </div>
            <div v-else-if="devices.length === 0" class="text-center text-gray-500 py-10">
                ไม่พบกล้องในระบบ
            </div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div v-for="device in devices" :key="device._id"
                    class="border rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer group bg-gradient-to-br from-blue-50 to-yellow-50 hover:from-yellow-100 hover:to-blue-100"
                    @click="selectDevice(device)" @mouseenter="playAnim(device._id)" @mouseleave="stopAnim(device._id)">
                    <div class="flex items-center gap-3 mb-2">
                        <div :ref="setCameraAnimRef(device._id)" class="w-16 h-16"></div>
                        <span class="inline-block bg-blue-600 text-white rounded-full px-3 py-1 text-xs font-semibold">
                            {{ device.gate_type === 'in' ? 'ประตูเข้า' : 'ประตูออก' }}
                        </span>
                    </div>
                    <div class="mb-1">
                        <span class="font-semibold text-blue-900">Serial:</span>
                        <span class="text-gray-700 ml-2">{{ device.serial_number }}</span>
                    </div>
                    <div class="mb-1">
                        <span class="font-semibold text-blue-900">IP:</span>
                        <span class="text-gray-700 ml-2">{{ device.ipaddress }}</span>
                    </div>
                    <div class="mb-1">
                        <span class="font-semibold text-blue-900">ตำแหน่ง:</span>
                        <span class="text-gray-700 ml-2">{{ device.location }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DeviceService from '../../api/device.js'
import lottie from 'lottie-web'
import cameraAnim from '../../assets/wired-outline-1037-vlog-camera-hover-pinch.json'

const devices = ref([])
const loading = ref(true)
const router = useRouter()
const cameraAnimRefs = {}

const lottieInstances = {}

function setCameraAnimRef(id) {
    return (el) => {
        if (el) {
            cameraAnimRefs[id] = el
        }
    }
}

function playAnim(id) {
    if (lottieInstances[id]) lottieInstances[id].play()
}
function stopAnim(id) {
    if (lottieInstances[id]) lottieInstances[id].stop()
}

const fetchDevices = async () => {
    loading.value = true
    try {
        const res = await DeviceService.getDevices()
        devices.value = res.data || []
        setTimeout(() => {
            devices.value.forEach(device => {
                const el = cameraAnimRefs[device._id]
                if (el) {
                    const anim = lottie.loadAnimation({
                        container: el,
                        renderer: 'svg',
                        loop: true,
                        autoplay: false,
                        animationData: cameraAnim
                    })
                    anim.addEventListener('DOMLoaded', () => {
                        anim.goToAndStop(0, true)
                    })
                    lottieInstances[device._id] = anim
                }
            })
        }, 200)
    } catch (e) {
        devices.value = []
    } finally {
        loading.value = false
    }
}

const selectDevice = (device) => {
    router.push({ name: 'CameraRealtime', query: { id: device._id } })
}

onMounted(fetchDevices)
</script>

<style scoped>
.loading-spinner {
    width: 2.5rem;
    height: 2.5rem;
}
</style>
