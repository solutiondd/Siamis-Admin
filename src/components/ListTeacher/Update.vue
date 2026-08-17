<template>
    <dialog ref="modalRef" class="modal">
        <div class="modal-box max-w-2xl overflow-y-auto">
            <h3 class="font-bold text-lg mb-4">{{ t('teacherUpdate.title') }}</h3>
            <form @submit.prevent="handleSubmit">
                <div class="space-y-2">
                    <label class="block text-sm font-semibold">{{ t('teacherUpdate.image') }} <span
                            class="text-gray-500">({{ t('teacherUpdate.optional') }})</span></label>

                    <div v-if="currentImage || previewImage" class="relative flex justify-center mb-2">
                        <div class="relative">
                            <img :src="previewImage || currentImage" alt="Preview"
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

                    <div v-if="!currentImage && !previewImage" class="relative">
                        <label for="pictureInputUpdateTeacher"
                            class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <span class="flex flex-col items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span class="text-sm font-medium text-gray-700">{{ t('teacherUpdate.chooseImage')
                                    }}</span>
                                <span class="text-xs text-gray-500">{{ t('teacherUpdate.jpgOnly') }}</span>
                            </span>
                            <input id="pictureInputUpdateTeacher" ref="fileInputRef" type="file"
                                @change="handleFileChange" accept="image/jpeg,image/jpg"
                                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </label>
                    </div>
                    <div v-if="fileError" class="text-sm text-error mt-1">{{ fileError }}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">{{ t('teacherUpdate.employeeId') }}</span>
                        </label>
                        <input v-model="formData.userid" type="text" class="input input-bordered w-full" required
                            :class="{ 'input-error': useridError }" autocomplete="off" />
                        <label v-if="useridError" class="label">
                            <span class="label-text-alt text-error">{{ useridError }}</span>
                        </label>
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">{{ t('teacherUpdate.prefix') }}</span>
                        </label>
                        <select v-model="formData.pre_name" class="select select-bordered w-full" required>
                            <option value="">{{ t('teacherUpdate.selectPrefix') }}</option>
                            <option value="นาย">Mr.</option>
                            <option value="นาง">Mrs.</option>
                            <option value="นางสาว">Miss</option>
                        </select>
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">{{ t('teacherUpdate.firstName') }}</span>
                        </label>
                        <input v-model="formData.first_name" type="text" class="input input-bordered w-full" required
                            @input="validateFirstName" :class="{ 'input-error': firstNameError }" autocomplete="off" />
                        <label v-if="firstNameError" class="label">
                            <span class="label-text-alt text-error">{{ firstNameError }}</span>
                        </label>
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">{{ t('teacherUpdate.lastName') }}</span>
                        </label>
                        <input v-model="formData.last_name" type="text" class="input input-bordered w-full" required
                            @input="validateLastName" :class="{ 'input-error': lastNameError }" autocomplete="off" />
                        <label v-if="lastNameError" class="label">
                            <span class="label-text-alt text-error">{{ lastNameError }}</span>
                        </label>
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">{{ t('teacherUpdate.position') }}</span>
                        </label>
                        <select v-model="formData.position" class="select select-bordered w-full" required>
                            <option value="">{{ t('teacherUpdate.selectPosition') }}</option>
                            <option v-for="pos in positions" :key="pos._id" :value="pos.name">{{ pos.name }}</option>
                        </select>
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">{{ t('teacherUpdate.department') }}</span>
                        </label>
                        <select v-model="formData.department" class="select select-bordered w-full" required>
                            <option value="">{{ t('teacherUpdate.selectDepartment') }}</option>
                            <option v-for="dept in departments" :key="dept._id" :value="dept.name">{{ dept.name }}
                            </option>
                        </select>
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">{{ t('teacherUpdate.rfid') }} <span class="text-gray-500">({{
                                    t('teacherUpdate.optional') }})</span></span>
                        </label>
                        <input v-model="formData.rfid" type="text" class="input input-bordered w-full"
                            @input="validateRfid" autocomplete="off" />
                        <label v-if="rfidError" class="label"><span class="label-text-alt text-error">{{ rfidError
                        }}</span></label>
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">{{ t('teacherUpdate.status') }}</span>
                        </label>
                        <select v-model="formData.status" class="select select-bordered w-full" required>
                            <option value="">{{ t('teacherUpdate.selectStatus') }}</option>
                            <option value="ปกติ">{{ t('teacherUpdate.normal') }}</option>
                            <option value="พักงาน">{{ t('teacherUpdate.suspended') }}</option>
                        </select>
                    </div>

                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">{{ t('teacherUpdate.moreDetail') }} <span
                                    class="text-gray-500">({{ t('teacherUpdate.optional') }})</span></span>
                        </label>
                        <input v-model="formData.note" type="text" class="input input-bordered w-full"
                            autocomplete="off" />
                    </div>
                </div>

                <div class="modal-action">
                    <button type="button" @click="closeModal" class="btn btn-ghost">{{ t('teacherUpdate.cancel')
                        }}</button>
                    <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
                        <span v-if="loading" class="loading loading-spinner loading-sm"></span>
                        <span v-else>{{ t('teacherUpdate.save') }}</span>
                    </button>
                </div>
            </form>
        </div>
    </dialog>
</template>

<script setup>
import { TeacherService } from '../../api/teacher'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const imgProfileUrl = import.meta.env.VITE_IMG_PROFILE_URL;
const getPictureUrl = (pic) => {
    if (!pic) return '';
    if (pic.startsWith('http')) return pic;
    return `${imgProfileUrl}${pic}`;
};

const modalRef = ref(null)
const loading = ref(false)
const teacherId = ref('')
const currentImage = ref('')
const previewImage = ref('')
const fileError = ref('')
const fileInputRef = ref(null)
const firstNameError = ref('')
const lastNameError = ref('')
const useridError = ref('')
const rfidError = ref('')
let faceapiLib = null
let tinyFaceModelReady = false
const formData = ref({
    userid: '',
    pre_name: '',
    first_name: '',
    last_name: '',
    position: '',
    department: '',
    rfid: '',
    note: '',
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

const emit = defineEmits(['success'])
const { t } = useI18n()

const openModal = async (teacher) => {
    teacherId.value = teacher.id
    currentImage.value = getPictureUrl(teacher.picture) || ''
    previewImage.value = ''
    fileError.value = ''
    firstNameError.value = ''
    lastNameError.value = ''
    formData.value = {
        userid: teacher.userid,
        pre_name: teacher.name.split(' ')[0] || '',
        first_name: teacher.name.split(' ')[1] || '',
        last_name: teacher.name.split(' ').slice(2).join(' ') || '',
        position: teacher.position,
        department: teacher.department,
        note: teacher.note !== undefined && teacher.note !== null ? String(teacher.note) : '',
        status: 'ปกติ',
        picture: null,
        rfid: teacher.rfid !== undefined && teacher.rfid !== null ? String(teacher.rfid) : ''
    }
    useridError.value = ''
    rfidError.value = ''

    if (teacher.picture) {
        try {
            const response = await fetch(teacher.picture)
            const blob = await response.blob()
            if (blob.size > 70 * 1024) {
                const resizedBlob = await resizeImage(blob, 70, 0)
                if (resizedBlob.size <= 70 * 1024) {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        currentImage.value = e.target.result
                        previewImage.value = ''
                    }
                    reader.readAsDataURL(resizedBlob)
                    formData.value.picture = new File([resizedBlob], 'teacher.jpg', { type: 'image/jpeg' })
                } else {
                    fileError.value = t('teacherUpdate.fileTooLarge', { size: (blob.size / 1024).toFixed(2) })
                }
            }
        } catch (err) {
            fileError.value = t('teacherUpdate.fileCheckError')
        }
    }

    modalRef.value.showModal()
}

const closeModal = () => {
    modalRef.value.close()
    rfidError.value = ''
    currentImage.value = ''
    previewImage.value = ''
    fileError.value = ''
    firstNameError.value = ''
    lastNameError.value = ''
    formData.value = {
        userid: '',
        pre_name: '',
        first_name: '',
        last_name: '',
        position: '',
        department: '',
        note: '',
        status: '',
        picture: null,
        rfid: ''
    }
    useridError.value = ''
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
                        if (!b) return reject(t('teacherUpdate.compressFail'));

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

                        reject(t('teacherUpdate.compressLimitFail', { size: maxSizeKB }));
                    }, 'image/jpeg', quality);
                }

                tryCompress();
            };
            img.onerror = () => reject(t('teacherUpdate.invalidImageFile'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(t('teacherUpdate.readImageFail'));
        reader.readAsDataURL(file);
    });
}

const handleFileChange = async (event) => {
    const file = event.target.files[0];
    fileError.value = '';

    if (file) {
        if (!file.type.match('image/jpeg') && !file.type.match('image/jpg')) {
            fileError.value = t('teacherUpdate.selectJpgOnly');
            event.target.value = '';
            return;
        }
        try {
            const resizedBlob = await resizeImage(file, 70, 450);
            const resizedFile = new File([resizedBlob], file.name, { type: 'image/jpeg' });
            const hasFace = await detectFace(resizedFile)

            if (!hasFace) {
                fileError.value = t('teacherUpdate.noFaceDetected');
                formData.value.picture = null
                previewImage.value = ''
                event.target.value = ''
                return
            }

            formData.value.picture = resizedFile;
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.value = e.target.result;
            };
            reader.readAsDataURL(resizedBlob);
        } catch (err) {
            fileError.value = err?.message || String(err) || t('teacherUpdate.resizeError');
            event.target.value = '';
        }
    }
}

const nameRegex = /^[A-Za-z\u0E00-\u0E7F]+$/

const validateFirstName = () => {
    if (!formData.value.first_name) {
        firstNameError.value = t('teacherUpdate.requiredFirstName')
    } else if (!nameRegex.test(formData.value.first_name)) {
        firstNameError.value = t('teacherUpdate.nameOnlyLetters')
    } else {
        firstNameError.value = ''
    }
}

const validateLastName = () => {
    if (!formData.value.last_name) {
        lastNameError.value = t('teacherUpdate.requiredLastName')
    } else if (!nameRegex.test(formData.value.last_name)) {
        lastNameError.value = t('teacherUpdate.nameOnlyLetters')
    } else {
        lastNameError.value = ''
    }
}

const validateRfid = () => {
    if (!formData.value.rfid) {
        rfidError.value = ''
        return true
    }
    if (!/^\d+$/.test(formData.value.rfid)) {
        rfidError.value = t('teacherUpdate.numericRfid')
        return false
    }
    rfidError.value = ''
    return true
}

const isFormValid = computed(() => {
    return (
        !firstNameError.value &&
        !lastNameError.value &&
        formData.value.first_name &&
        formData.value.last_name &&
        !rfidError.value &&
        !fileError.value
    )
})

const removeImage = () => {
    previewImage.value = ''
    currentImage.value = ''
    formData.value.picture = null
    if (fileInputRef.value) {
        fileInputRef.value.value = ''
    }
}

const handleSubmit = async () => {
    validateFirstName()
    validateLastName()
    if (!validateRfid()) return
    useridError.value = ''
    if (!isFormValid.value) {
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'error',
            title: t('teacherUpdate.invalidDataTitle'),
            text: t('teacherUpdate.invalidDataText'),
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app')?.removeAttribute('aria-hidden')
            }
        })
        return
    }
    loading.value = true
    try {
        const teacherService = new TeacherService()
        const response = await teacherService.updateTeacher(teacherId.value, formData.value)
        if (response.message === 'Success') {
            const { default: Swal } = await import('sweetalert2')
            Swal.fire({
                icon: 'success',
                title: t('teacherUpdate.successTitle'),
                showConfirmButton: false,
                timer: 1500,
                didOpen: () => {
                    document.getElementById('app')?.removeAttribute('aria-hidden')
                }
            })
            emit('success')
            closeModal()
        }
    } catch (error) {
        const duplicate = error?.response?.status === 409 || (error?.response?.data?.error && error.response.data.error.includes('duplicate teacher userid'));
        if (duplicate) {
            useridError.value = t('teacherUpdate.duplicateId');
            return;
        }
        console.error('Update teacher error:', error)
        closeModal();
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'error',
            title: t('teacherUpdate.errorTitle'),
            text: error?.response?.data?.error || error?.message || t('teacherUpdate.errorMessage'),
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app')?.removeAttribute('aria-hidden')
            }
        })
    } finally {
        loading.value = false
    }
}

defineExpose({
    openModal
})
</script>

<style scoped></style>