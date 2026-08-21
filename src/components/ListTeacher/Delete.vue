<template>
    <dialog ref="dialogRef" class="modal">
        <div class="modal-box p-4">
            <h3 class="font-bold text-lg mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-error" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01M5.07 19h13.86A2.07 2.07 0 0021 16.93V7.07A2.07 2.07 0 0018.93 5H5.07A2.07 2.07 0 003 7.07v9.86A2.07 2.07 0 005.07 19z" />
                </svg>
                {{ t('TeacherDelete.title') }}
            </h3>
            <p class="text-sm mb-4" v-if="teacher">
                {{ t('TeacherDelete.confirmText', { name: teacher.name }) }}
            </p>
            <p v-else class="text-sm mb-4">{{ t('TeacherDelete.preparingData') }}</p>

            <div class="flex justify-end gap-2 mt-2">
                <button class="btn btn-sm" @click="close" :disabled="loading">{{ t('TeacherDelete.cancel') }}</button>
                <button class="btn btn-sm btn-error" @click="confirmDelete" :disabled="loading">
                    <span v-if="loading" class="loading loading-spinner loading-xs"></span>
                    <span v-else>{{ t('TeacherDelete.delete') }}</span>
                </button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop" @click="close">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { TeacherService } from '../../api/teacher'

const { t } = useI18n()
const dialogRef = ref(null)
const teacher = ref(null)
const loading = ref(false)
const emit = defineEmits(['success'])
const teacherService = new TeacherService()

function open(targetTeacher) {
    teacher.value = targetTeacher
    dialogRef.value?.showModal()
}

function close() {
    dialogRef.value?.close()
}

async function confirmDelete() {
    if (!teacher.value) return
    loading.value = true
    try {
        const response = await teacherService.deleteTeacher(teacher.value.id)
        if (response.message === 'Success') {
            close()
            emit('success')
            await showSuccess()
        } else {
            await showError()
        }
    } catch (e) {
        console.error('Delete teacher error:', e)
        await showError(e)
    } finally {
        loading.value = false
    }
}

async function showSuccess() {
    const { default: Swal } = await import('sweetalert2')
    await Swal.fire({
        icon: 'success',
        title: t('TeacherDelete.successTitle'),
        text: t('TeacherDelete.successText'),
        showConfirmButton: false,
        timer: 1600,
        didOpen: () => { document.getElementById('app')?.removeAttribute('aria-hidden') }
    })
}

async function showError(error = null) {
    const { default: Swal } = await import('sweetalert2')
    await Swal.fire({
        icon: 'error',
        title: t('TeacherDelete.errorTitle'),
        text: error?.response?.data?.error || error?.message || t('TeacherDelete.errorText'),
        confirmButtonColor: '#2563eb',
        didOpen: () => { document.getElementById('app')?.removeAttribute('aria-hidden') }
    })
}

defineExpose({ open })
</script>

<style scoped></style>