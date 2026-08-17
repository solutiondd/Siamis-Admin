<template>
    <dialog ref="modalRef" class="modal">
        <div class="modal-box max-w-2xl overflow-visible overflow-y-auto">
            <h3 class="font-bold text-lg mb-4">{{ t('TeacherCreate.title') }}</h3>

            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div class="space-y-2">
                    <label class="block text-sm font-semibold">
                        {{ t('TeacherCreate.imageLabel') }} <span class="text-gray-500">{{ t('TeacherCreate.optional') }}</span>
                    </label>

                    <div v-if="previewImage" class="relative flex justify-center mb-4">
                        <div class="relative">
                            <img :src="previewImage" alt="Preview"
                                class="w-32 h-32 object-cover rounded-lg shadow-md" />
                            <button type="button" @click="removeImage"
                                class="absolute -top-2 -right-2 btn btn-circle btn-sm btn-error">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div v-if="!previewImage" class="relative">
                        <label for="pictureInput"
                            class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <span class="flex flex-col items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span class="text-sm font-medium text-gray-700">{{ t('TeacherCreate.selectImage') }}</span>
                                <span class="text-xs text-gray-500">{{ t('TeacherCreate.imageRule') }}</span>
                            </span>
                            <input id="pictureInput" type="file" @change="handleFileChange"
                                accept="image/jpeg,image/jpg"
                                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </label>
                    </div>
                    <div v-if="fileError" class="text-sm text-error mt-1">{{ fileError }}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">{{ t('TeacherCreate.userId') }}</span>
                        </label>
                        <input v-model="formData.userid" type="text"
                            :class="['input input-bordered w-full', useridError ? 'border-error focus:border-error' : '']"
                            required />
                        <div v-if="useridError" class="text-sm text-error mt-1">{{ useridError }}</div>
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">{{ t('TeacherCreate.prefix') }}</span>
                        </label>
                        <select v-model="formData.pre_name" class="select select-bordered w-full" required>
                            <option value="">{{ t('TeacherCreate.selectPrefix') }}</option>
                            <option value="นาย">{{ t('TeacherCreate.mr') }}</option>
                            <option value="นาง">{{ t('TeacherCreate.mrs') }}</option>
                            <option value="นางสาว">{{ t('TeacherCreate.miss') }}</option>
                        </select>
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">{{ t('TeacherCreate.firstName') }}</span>
                        </label>
                        <input v-model="formData.first_name" type="text" class="input input-bordered w-full" required />
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">{{ t('TeacherCreate.lastName') }}</span>
                        </label>
                        <input v-model="formData.last_name" type="text" class="input input-bordered w-full" required />
                    </div>

                    <div class="form-control relative z-[100] w-full">
                        <label class="label">
                            <span class="label-text">{{ t('TeacherCreate.position') }}</span>
                        </label>
                        <div class="relative" ref="positionBoxRef">
                            <input ref="positionInputRef" v-model="positionQuery" type="text"
                                class="input input-bordered w-full" :placeholder="t('TeacherCreate.searchPositionPlaceholder')"
                                @focus="positionOpen = true" @input="positionOpen = true" required />
                            <ul v-if="positionOpen"
                                class="bg-base-100 rounded-box shadow-lg border absolute z-[1000] top-full left-0 mt-1 w-full max-h-60 overflow-y-auto">
                                <li v-if="!filteredPositions.length" class="px-3 py-2 text-sm opacity-70">
                                    {{ t('TeacherCreate.positionNotFound') }}
                                </li>
                                <li v-for="pos in filteredPositions" :key="pos._id" class="block">
                                    <button type="button" class="w-full text-left px-3 py-2 hover:bg-base-200 block"
                                        @click="selectPosition(pos)">
                                        {{ pos.name }}
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="form-control relative z-[99] w-full">
                        <label class="label">
                            <span class="label-text">{{ t('TeacherCreate.department') }}</span>
                        </label>
                        <div class="relative" ref="departmentBoxRef">
                            <input ref="departmentInputRef" v-model="departmentQuery" type="text"
                                class="input input-bordered w-full" :placeholder="t('TeacherCreate.searchDepartmentPlaceholder')"
                                @focus="departmentOpen = true" @input="departmentOpen = true" required />
                            <ul v-if="departmentOpen"
                                class="bg-base-100 rounded-box shadow-lg border absolute z-[999] top-full left-0 mt-1 w-full max-h-60 overflow-y-auto">
                                <li v-if="!filteredDepartments.length" class="px-3 py-2 text-sm opacity-70">
                                    {{ t('TeacherCreate.departmentNotFound') }}
                                </li>
                                <li v-for="dept in filteredDepartments" :key="dept._id" class="block">
                                    <button type="button" class="w-full text-left px-3 py-2 hover:bg-base-200 block"
                                        @click="selectDepartment(dept)">
                                        {{ dept.name }}
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">{{ t('TeacherCreate.rfid') }} <span class="text-gray-500">{{ t('TeacherCreate.optional') }}</span></span>
                        </label>
                        <input v-model="formData.rfid" type="text"
                            :class="['input input-bordered w-full', rfidError ? 'border-error focus:border-error' : '']"
                            @input="validateRfid" autocomplete="off" />
                        <div v-if="rfidError" class="text-sm text-error mt-1">{{ rfidError }}</div>
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">{{ t('TeacherCreate.status') }}</span>
                        </label>
                        <select v-model="formData.status" class="select select-bordered w-full" required>
                            <option value="">{{ t('TeacherCreate.selectStatus') }}</option>
                            <option value="ปกติ">{{ t('TeacherCreate.statusNormal') }}</option>
                            <option value="พักงาน">{{ t('TeacherCreate.statusSuspended') }}</option>
                        </select>
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">{{ t('TeacherCreate.note') }} <span
                                    class="text-gray-500">{{ t('TeacherCreate.optional') }}</span></span>
                        </label>
                        <input v-model="formData.note" type="text" class="input input-bordered w-full"
                            autocomplete="off" />
                    </div>
                </div>

                <div class="modal-action">
                    <button type="button" @click="closeModal" class="btn btn-ghost">{{ t('TeacherCreate.cancel') }}</button>
                    <button type="submit" class="btn btn-primary" :disabled="loading">
                        <span v-if="loading" class="loading loading-spinner loading-sm"></span>
                        <span v-else>{{ t('TeacherCreate.save') }}</span>
                    </button>
                </div>
            </form>
        </div>
    </dialog>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const modalRef = ref(null)
const loading = ref(false)
const previewImage = ref('')
const fileName = ref('')
const fileError = ref('')
const useridError = ref('')
const rfidError = ref('')
let faceapiLib = null
let tinyFaceModelReady = false

const positionQuery = ref('')
const positionOpen = ref(false)
const positionBoxRef = ref(null)
const positionInputRef = ref(null)

const departmentQuery = ref('')
const departmentOpen = ref(false)
const departmentBoxRef = ref(null)
const departmentInputRef = ref(null)

const formData = ref({
    userid: '',
    pre_name: '',
    first_name: '',
    last_name: '',
    rfid: '',
    note: '',
    position: '',
    department: '',
    status: '',
    picture: null
})

const props = defineProps({
    departments: {
        type: Array,
        default: () => []
    },
    positions: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['success', 'error'])

const filteredPositions = computed(() => {
    const q = positionQuery.value.trim().toLowerCase()
    if (!q) return props.positions
    return props.positions.filter(pos => {
        const name = (pos.name || '').toLowerCase()
        return name.includes(q)
    })
})

const filteredDepartments = computed(() => {
    const q = departmentQuery.value.trim().toLowerCase()
    if (!q) return props.departments
    return props.departments.filter(dept => {
        const name = (dept.name || '').toLowerCase()
        return name.includes(q)
    })
})

const selectPosition = (pos) => {
    formData.value.position = pos.name
    positionQuery.value = pos.name
    positionOpen.value = false
}

const selectDepartment = (dept) => {
    formData.value.department = dept.name
    departmentQuery.value = dept.name
    departmentOpen.value = false
}

const validateRfid = () => {
    if (!formData.value.rfid) {
        rfidError.value = ''
        return true
    }

    if (!/^\d+$/.test(formData.value.rfid)) {
        rfidError.value = t('TeacherCreate.errOnlyNumber')
        return false
    }

    rfidError.value = ''
    return true
}

let _onDocClickPosition = null
let _onDocClickDepartment = null

onMounted(() => {
    _onDocClickPosition = (e) => {
        if (!positionOpen.value) return
        const box = positionBoxRef.value
        if (box && !box.contains(e.target)) {
            positionOpen.value = false
        }
    }
    _onDocClickDepartment = (e) => {
        if (!departmentOpen.value) return
        const box = departmentBoxRef.value
        if (box && !box.contains(e.target)) {
            departmentOpen.value = false
        }
    }
    document.addEventListener('click', _onDocClickPosition)
    document.addEventListener('click', _onDocClickDepartment)
})

onBeforeUnmount(() => {
    if (_onDocClickPosition) document.removeEventListener('click', _onDocClickPosition)
    if (_onDocClickDepartment) document.removeEventListener('click', _onDocClickDepartment)
})

const openModal = () => {
    formData.value = {
        userid: '',
        pre_name: '',
        first_name: '',
        last_name: '',
        rfid: '',
        note: '',
        position: '',
        department: '',
        status: '',
        picture: null
    }
    previewImage.value = ''
    fileName.value = ''
    fileError.value = ''
    useridError.value = ''
    rfidError.value = ''
    positionQuery.value = ''
    departmentQuery.value = ''
    positionOpen.value = false
    departmentOpen.value = false
    modalRef.value.showModal()
}

const closeModal = () => {
    modalRef.value.close()
    formData.value = {
        userid: '',
        pre_name: '',
        first_name: '',
        last_name: '',
        rfid: '',
        note: '',
        position: '',
        department: '',
        status: '',
        picture: null
    }
    previewImage.value = ''
    fileName.value = ''
    fileError.value = ''
    useridError.value = ''
    rfidError.value = ''
    positionQuery.value = ''
    departmentQuery.value = ''
    positionOpen.value = false
    departmentOpen.value = false
}

const ensureTinyFaceDetectorModel = async () => {
    if (!faceapiLib) {
        faceapiLib = await import('face-api.js')
    }

    if (!tinyFaceModelReady) {
        await faceapiLib.nets.tinyFaceDetector.loadFromUri('/models')
        tinyFaceModelReady = true
    }

    return faceapiLib
}

const detectFace = async (file) => {
    const faceapi = await ensureTinyFaceDetectorModel()
    const img = await faceapi.bufferToImage(file)
    const detections = await faceapi.detectAllFaces(
        img,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 })
    )
    return detections.length > 0
}

async function resizeImage(file, maxSizeKB = 70, targetWidth = 450) {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        const reader = new FileReader();
        reader.onload = (e) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const maxBytes = maxSizeKB * 1024;
                let width = targetWidth > 0 ? targetWidth : img.width;
                let height = Math.max(1, Math.round((img.height * width) / img.width));
                let quality = 0.9;

                function tryCompress() {
                    canvas.width = Math.max(1, Math.round(width));
                    canvas.height = Math.max(1, Math.round(height));
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob((b) => {
                        if (!b) return reject(t('TeacherCreate.errCompressFailed'));

                        if (b.size <= maxBytes) {
                            resolve(b);
                            return;
                        }

                        if (quality > 0.45) {
                            quality -= 0.07;
                            tryCompress();
                            return;
                        }

                        if (width > 120) {
                            width = Math.max(120, Math.round(width * 0.9));
                            height = Math.max(1, Math.round((img.height * width) / img.width));
                            quality = 0.9;
                            tryCompress();
                            return;
                        }

                        reject(t('TeacherCreate.errCompressMaxSize', { maxSizeKB }));
                    }, 'image/jpeg', quality);
                }

                tryCompress();
            };
            img.onerror = () => reject(t('TeacherCreate.errInvalidImageFile'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(t('TeacherCreate.errReadImageFailed'));
        reader.readAsDataURL(file);
    });
}

const handleFileChange = async (event) => {
    const file = event.target.files[0];
    fileError.value = '';

    if (file) {
        if (!file.type.match('image/jpeg') && !file.type.match('image/jpg')) {
            fileError.value = t('TeacherCreate.errOnlyJpg');
            event.target.value = '';
            return;
        }
        try {
            const resizedBlob = await resizeImage(file, 70, 450);
            const resizedFile = new File([resizedBlob], file.name, { type: 'image/jpeg' });
            const hasFace = await detectFace(resizedFile)

            if (!hasFace) {
                fileError.value = t('TeacherCreate.errNoFaceDetected');
                formData.value.picture = null
                previewImage.value = ''
                fileName.value = ''
                event.target.value = ''
                return
            }

            formData.value.picture = resizedFile;
            fileName.value = file.name;
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.value = e.target.result;
            };
            reader.readAsDataURL(resizedBlob);
        } catch (err) {
            fileError.value = err?.message || String(err) || t('TeacherCreate.errResizeImage');
            event.target.value = '';
        }
    }
}

const removeImage = () => {
    previewImage.value = ''
    fileName.value = ''
    fileError.value = ''
    formData.value.picture = null
    const fileInput = document.getElementById('pictureInput')
    if (fileInput) {
        fileInput.value = ''
    }
}

const handleSubmit = async () => {
    useridError.value = ''
    if (!validateRfid()) {
        return
    }
    loading.value = true
    emit('success', {
        ...formData.value,
        onError: async (err) => {
            const errStr = String(err).replace(/\s+/g, '').toLowerCase();
            if (errStr.includes('duplicateteacheruserid')) {
                useridError.value = t('TeacherCreate.errDuplicateUserId')
            } else {
                const errorMessage = err?.response?.data?.error || err?.message || t('TeacherCreate.errAddFailed');
                closeModal();
                const { default: Swal } = await import('sweetalert2');
                Swal.fire({
                    icon: 'error',
                    title: t('TeacherCreate.errTitle'),
                    text: errorMessage,
                    confirmButtonColor: '#2563eb',
                    didOpen: () => {
                        document.getElementById('app')?.removeAttribute('aria-hidden')
                    }
                });
            }
            loading.value = false
        },
        onSuccess: () => {
            closeModal()
        }
    })
}

defineExpose({
    openModal
})
</script>

<style scoped></style>