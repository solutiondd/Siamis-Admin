<template>
    <dialog ref="modalRef" class="modal">
        <div class="modal-box">
            <h3 class="font-bold text-lg mb-4 text-error">{{ $t('ClassroomDelete.title') }}</h3>
            <div class="mb-4">
                <p>{{ $t('ClassroomDelete.confirmText', { grade: mapGradeDisplay(classroom?.grade), room: classroom?.classroom }) }}</p>
            </div>
            <div class="flex justify-end gap-2">
                <button class="btn btn-sm btn-ghost" @click="closeModal">{{ $t('ClassroomDelete.cancelBtn') }}</button>
                <button class="btn btn-sm btn-error" :disabled="loading" @click="confirmDelete">
                    <span v-if="loading" class="loading loading-spinner loading-xs"></span>
                    {{ $t('ClassroomDelete.deleteBtn') }}
                </button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button @click="closeModal">{{ $t('ClassroomDelete.closeBtn') }}</button>
        </form>
    </dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n' // นำเข้า useI18n
import { ClassRoomService } from '../../api/class-room'
import { mapGradeDisplay } from '../../utils/gradeSystem'

const { t } = useI18n()
const modalRef = ref(null)
const loading = ref(false)
const classroom = ref(null)
const emit = defineEmits(['deleted'])
const classRoomService = new ClassRoomService()

function openModal(classroomObj) {
    classroom.value = classroomObj
    modalRef.value?.showModal()
}
function closeModal() {
    modalRef.value?.close()
    classroom.value = null
    loading.value = false
}
async function confirmDelete() {
    if (!classroom.value?._id) return
    loading.value = true
    try {
        await classRoomService.deleteClassRoom(classroom.value._id)
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'success',
            title: t('ClassroomDelete.successTitle'),
            showConfirmButton: false,
            timer: 1500,
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
        emit('deleted')
        closeModal()
    } catch (error) {
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
            icon: 'error',
            title: t('ClassroomDelete.errorTitle'),
            text: error?.response?.data?.error || error?.message || t('ClassroomDelete.defaultErrorText'),
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
        loading.value = false
    }
}

defineExpose({ openModal, closeModal })
</script>