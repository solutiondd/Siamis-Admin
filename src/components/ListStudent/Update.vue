<template>
    <dialog ref="modalRef" class="modal">
        <div class="modal-box max-w-2xl">
            <h3 class="font-bold text-lg mb-4">{{ $t('StudentUpdate.title') }}</h3>

            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div class="space-y-2">
                    <label class="block text-sm font-semibold">{{ $t('StudentUpdate.imageLabel') }} <span
                            class="text-gray-500">{{ $t('StudentUpdate.optional') }}</span></label>

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
                        <label for="pictureInputUpdate"
                            class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <span class="flex flex-col items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span class="text-sm font-medium text-gray-700">{{ $t('StudentUpdate.chooseImage')
                                    }}</span>
                                <span class="text-xs text-gray-500">{{ $t('StudentUpdate.imageFormatLimit') }}</span>
                            </span>
                            <input id="pictureInputUpdate" type="file" @change="handleFileChange"
                                accept="image/jpeg,image/jpg"
                                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </label>
                    </div>
                    <div v-if="fileError" class="text-sm text-error mt-1">{{ fileError }}</div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-control">
                        <label class="label"><span class="label-text">{{ $t('StudentUpdate.studentId') }}</span></label>
                        <input v-model="formData.userid" type="text" class="input input-bordered" required
                            :class="{ 'input-error': useridError }" autocomplete="off" />
                        <label v-if="useridError" class="label"><span class="label-text-alt text-error">{{ useridError
                                }}</span></label>
                    </div>

                    <div class="form-control">
                        <label class="label"><span class="label-text">{{ $t('StudentUpdate.prefix') }}</span></label>
                        <select v-model="formData.pre_name" class="select select-bordered" required>
                            <option value="">{{ $t('StudentUpdate.selectPrefix') }}</option>
                            <option value="เด็กชาย">{{ $t('StudentUpdate.boy') }}</option>
                            <option value="เด็กหญิง">{{ $t('StudentUpdate.girl') }}</option>
                            <option value="นาย">{{ $t('StudentUpdate.mr') }}</option>
                            <option value="นางสาว">{{ $t('StudentUpdate.miss') }}</option>
                        </select>
                    </div>

                    <div class="form-control">
                        <label class="label"><span class="label-text">{{ $t('StudentUpdate.firstName') }}</span></label>
                        <input v-model="formData.first_name" type="text" class="input input-bordered" required
                            @input="validateFirstName" :class="{ 'input-error': firstNameError }" autocomplete="off" />
                        <label v-if="firstNameError" class="label"><span class="label-text-alt text-error">{{
                            firstNameError }}</span></label>
                    </div>

                    <div class="form-control">
                        <label class="label"><span class="label-text">{{ $t('StudentUpdate.lastName') }}</span></label>
                        <input v-model="formData.last_name" type="text" class="input input-bordered" required
                            @input="validateLastName" :class="{ 'input-error': lastNameError }" autocomplete="off" />
                        <label v-if="lastNameError" class="label"><span class="label-text-alt text-error">{{
                            lastNameError }}</span></label>
                    </div>

                    <div v-if="auth.user?.role !== 'teacher'" class="form-control">
                        <label class="label"><span class="label-text">{{ $t('StudentUpdate.grade') }}</span></label>
                        <select v-model="formData.grade" @change="handleGradeChange" class="select select-bordered"
                            required>
                            <option value="">{{ $t('StudentUpdate.selectGrade') }}</option>
                            <option v-for="grade in availableGrades" :key="grade" :value="grade">{{
                                mapGradeDisplay(grade) }}</option>
                        </select>
                    </div>

                    <div v-if="auth.user?.role !== 'teacher'" class="form-control">
                        <label class="label"><span class="label-text">{{ $t('StudentUpdate.classroom') }}</span></label>
                        <select v-model="formData.classroom" class="select select-bordered" required>
                            <option value="">{{ $t('StudentUpdate.selectClassroom') }}</option>
                            <option v-for="room in availableClassrooms" :key="room" :value="room">
                                {{ room }}
                            </option>
                        </select>
                    </div>

                    <div class="form-control">
                        <label class="label"><span class="label-text">{{ $t('StudentUpdate.rfidCard') }} <span
                                    class="text-gray-500">{{ $t('StudentUpdate.optional') }}</span></span></label>
                        <input v-model="formData.rfid" type="text" class="input input-bordered" @input="validateRfid"
                            autocomplete="off" />
                        <label v-if="rfidError" class="label"><span class="label-text-alt text-error">{{ rfidError
                                }}</span></label>
                    </div>

                    <div class="form-control">
                        <label class="label"><span class="label-text">{{ $t('StudentUpdate.guardianPhone') }} <span
                                    class="text-gray-500">{{ $t('StudentUpdate.optional') }}</span></span></label>
                        <input v-model="formData.guardian_phone" type="text" class="input input-bordered"
                            @input="validateGuardianPhone" :class="{ 'input-error': guardianPhoneError }"
                            autocomplete="off" />
                        <label v-if="guardianPhoneError" class="label"><span class="label-text-alt text-error">{{
                            guardianPhoneError
                                }}</span></label>
                    </div>

                </div>

                <div class="modal-action">
                    <button type="button" class="btn btn-ghost" @click="closeModal">{{ $t('StudentUpdate.cancel')
                        }}</button>
                    <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
                        <span v-if="loading" class="loading loading-spinner loading-sm"></span>
                        <span v-else>{{ $t('StudentUpdate.save') }}</span>
                    </button>
                </div>
            </form>
        </div>
    </dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { StudentService } from '../../api/student'
import { useAuthStore } from '../../stores/auth'
import { mapGradeDisplay, toVisibleSortedGrades } from '../../utils/gradeSystem'

const { t } = useI18n()
const auth = useAuthStore()
const imgProfileUrl = import.meta.env.VITE_IMG_PROFILE_URL;
const getPictureUrl = (pic) => {
    if (!pic) return '';
    if (pic.startsWith('http')) return pic;
    return `${imgProfileUrl}${pic}`;
};

const modalRef = ref(null)
const loading = ref(false)
const previewImage = ref('')
const currentImage = ref('')
const fileError = ref('')
const firstNameError = ref('')
const lastNameError = ref('')
const useridError = ref('')
const studentId = ref('')
const rfidError = ref('')
const guardianPhoneError = ref('')

const formData = ref({
    userid: '',
    pre_name: '',
    first_name: '',
    last_name: '',
    grade: '',
    classroom: '',
    picture: null,
    rfid: '',
    guardian_phone: ''
})

const props = defineProps({
    classrooms: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['success'])

const availableGrades = computed(() => {
    return toVisibleSortedGrades(props.classrooms.map(c => c.grade))
})

const availableClassrooms = computed(() => {
    const rooms = props.classrooms.filter(c => c.grade === formData.value.grade).map(c => c.classroom)
    return rooms.sort((a, b) => a - b)
})

const nameRegex = /^[A-Za-z\u0E00-\u0E7F]+$/
const validateFirstName = () => {
    if (!formData.value.first_name) firstNameError.value = t('StudentUpdate.errRequiredFirstName')
    else if (!nameRegex.test(formData.value.first_name)) firstNameError.value = t('StudentUpdate.errNameFormat')
    else firstNameError.value = ''
}
const validateLastName = () => {
    if (!formData.value.last_name) lastNameError.value = t('StudentUpdate.errRequiredLastName')
    else if (!nameRegex.test(formData.value.last_name)) lastNameError.value = t('StudentUpdate.errNameFormat')
    else lastNameError.value = ''
}

const validateRfid = () => {
    if (!formData.value.rfid) {
        rfidError.value = ''
        return true
    }
    if (!/^\d+$/.test(formData.value.rfid)) {
        rfidError.value = t('StudentUpdate.errRfidNumber')
        return false
    }
    rfidError.value = ''
    return true
}

const validateGuardianPhone = () => {
    if (!formData.value.guardian_phone) {
        guardianPhoneError.value = ''
        return true
    }
    if (!/^\d+$/.test(formData.value.guardian_phone)) {
        guardianPhoneError.value = t('StudentUpdate.errPhoneOption')
        return false
    }
    guardianPhoneError.value = ''
    return true
}

const isFormValid = computed(() => {
    return (
        !firstNameError.value &&
        !lastNameError.value &&
        !rfidError.value &&
        !guardianPhoneError.value &&
        formData.value.userid &&
        formData.value.pre_name &&
        formData.value.first_name &&
        formData.value.last_name &&
        formData.value.grade &&
        formData.value.classroom &&
        !fileError.value
    )
})

const handleGradeChange = () => {
    formData.value.classroom = ''
    if (availableClassrooms.value.length > 0) {
        formData.value.classroom = availableClassrooms.value[0]
    }
}

const openModal = (studentData) => {
    studentId.value = studentData._id || studentData.id
    formData.value = {
        userid: studentData.userid || studentData.code || '',
        pre_name: studentData.pre_name || '',
        first_name: studentData.first_name || '',
        last_name: studentData.last_name || '',
        grade: studentData.grade || '',
        classroom: studentData.classroom || studentData.room || '',
        picture: null,
        rfid: studentData.rfid || '',
        guardian_phone: studentData.guardian_phone || ''
    }

    if (!formData.value.first_name && !formData.value.last_name && studentData.name) {
        const cleanName = studentData.name.replace(/^(เด็กชาย|เด็กหญิง|นาย|นางสาว|นาง)\s*/, '').trim()
        const parts = cleanName.split(/\s+/)
        formData.value.first_name = parts[0] || ''
        formData.value.last_name = parts.slice(1).join(' ') || ''
    }

    if (!formData.value.pre_name && studentData.name) {
        const match = studentData.name.match(/^(เด็กชาย|เด็กหญิง|นาย|นางสาว|นาง)/)
        if (match) {
            formData.value.pre_name = match[1]
        }
    }

    currentImage.value = studentData.picture ? getPictureUrl(studentData.picture) : ''
    previewImage.value = ''
    fileError.value = ''
    useridError.value = ''
    firstNameError.value = ''
    lastNameError.value = ''
    rfidError.value = ''
    guardianPhoneError.value = ''
    modalRef.value?.showModal()
}

const closeModal = () => {
    modalRef.value?.close()
    previewImage.value = ''
    currentImage.value = ''
    fileError.value = ''
    useridError.value = ''
    firstNameError.value = ''
    lastNameError.value = ''
    rfidError.value = ''
    guardianPhoneError.value = ''
}

const handleFileChange = async (event) => {
    const file = event.target.files[0]
    fileError.value = ''

    if (file) {
        if (!file.type.match('image/jpeg') && !file.type.match('image/jpg')) {
            fileError.value = t('StudentUpdate.errOnlyJpg')
            event.target.value = ''
            return
        }
        try {
            const resizedBlob = await resizeImage(file, 70, 450)
            formData.value.picture = new File([resizedBlob], file.name, { type: 'image/jpeg' })
            const reader = new FileReader()
            reader.onload = (e) => {
                previewImage.value = e.target.result
            }
            reader.readAsDataURL(resizedBlob)
        } catch (err) {
            fileError.value = err?.message || String(err) || 'เกิดข้อผิดพลาดในการรีไซส์รูปภาพ'
            event.target.value = ''
        }
    }
}

async function resizeImage(file, maxSizeKB = 70, targetWidth = 450) {
    return new Promise((resolve, reject) => {
        const img = new window.Image()
        const reader = new FileReader()
        reader.onload = (e) => {
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                const maxBytes = maxSizeKB * 1024
                let width = targetWidth > 0 ? targetWidth : img.width
                let height = Math.max(1, Math.round((img.height * width) / img.width))
                let quality = 0.9

                function tryCompress() {
                    canvas.width = Math.max(1, Math.round(width))
                    canvas.height = Math.max(1, Math.round(height))
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

                    canvas.toBlob((b) => {
                        if (!b) return reject('บีบอัดรูปไม่สำเร็จ')

                        if (b.size <= maxBytes) {
                            resolve(b)
                            return
                        }

                        if (quality > 0.45) {
                            quality -= 0.07
                            tryCompress()
                            return
                        }

                        if (width > 120) {
                            width = Math.max(120, Math.round(width * 0.9))
                            height = Math.max(1, Math.round((img.height * width) / img.width))
                            quality = 0.9
                            tryCompress()
                            return
                        }

                        reject(`ไม่สามารถบีบอัดรูปให้ไม่เกิน ${maxSizeKB}KB ได้`)
                    }, 'image/jpeg', quality)
                }

                tryCompress()
            }
            img.onerror = () => reject('ไฟล์รูปไม่ถูกต้อง')
            img.src = e.target.result
        }
        reader.onerror = () => reject('อ่านไฟล์รูปไม่สำเร็จ')
        reader.readAsDataURL(file)
    })
}

const removeImage = () => {
    previewImage.value = ''
    currentImage.value = ''
    fileError.value = ''
    formData.value.picture = null
    const fileInput = document.getElementById('pictureInputUpdate')
    if (fileInput) {
        fileInput.value = ''
    }
}

const handleSubmit = async () => {
    validateFirstName()
    validateLastName()
    validateRfid()
    validateGuardianPhone()

    if (!isFormValid.value) {
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'error',
            title: t('StudentUpdate.errInvalidDataTitle'),
            text: t('StudentUpdate.errInvalidDataText'),
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app')?.removeAttribute('aria-hidden')
            }
        })
        return
    }

    loading.value = true
    try {
        const studentService = new StudentService()
        const updateData = { ...formData.value }

        if (!updateData.picture) {
            delete updateData.picture
        }

        const response = await studentService.updateStudent(studentId.value, updateData)

        if (response.message === 'Success') {
            closeModal()
            emit('success')
        } else {
            const errStr = String(response.message).replace(/\s+/g, '').toLowerCase()
            if (errStr.includes('duplicatestudentuserid')) {
                useridError.value = t('StudentUpdate.errDuplicateId')
            } else {
                const { default: Swal } = await import('sweetalert2')
                Swal.fire({
                    icon: 'error',
                    title: t('StudentUpdate.errTitle'),
                    text: response.message || t('StudentUpdate.errUpdateFail'),
                    confirmButtonColor: '#2563eb',
                    didOpen: () => {
                        document.getElementById('app')?.removeAttribute('aria-hidden')
                    }
                })
            }
        }
    } catch (err) {
        const errStr = String(err?.response?.data?.error || err?.message || '').replace(/\s+/g, '').toLowerCase()
        if (errStr.includes('duplicatestudentuserid')) {
            useridError.value = t('StudentUpdate.errDuplicateId')
        } else {
            const errorMessage = err?.response?.data?.error || err?.message || t('StudentUpdate.errUpdateFail')
            const { default: Swal } = await import('sweetalert2')
            Swal.fire({
                icon: 'error',
                title: t('StudentUpdate.errTitle'),
                text: errorMessage,
                confirmButtonColor: '#2563eb',
                didOpen: () => {
                    document.getElementById('app')?.removeAttribute('aria-hidden')
                }
            })
        }
    } finally {
        loading.value = false
    }
}

defineExpose({
    openModal
})
</script>