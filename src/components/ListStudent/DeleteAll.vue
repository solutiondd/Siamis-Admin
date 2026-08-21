<template>
    <dialog ref="modalRef" class="modal">
        <form method="dialog" class="modal-box">
            <h3 class="font-bold text-lg text-error">{{ $t('StudentDeleteAll.titleStep1') }}</h3>
            <p class="py-4">
                {{ $t('StudentDeleteAll.confirmStep1', { grade: mapGradeDisplay(grade) }) }}
            </p>
            <div class="modal-action">
                <button type="button" class="btn btn-ghost" @click="close">{{ $t('StudentDeleteAll.cancel') }}</button>
                <button type="button" class="btn btn-error" @click="confirmSecond" :disabled="loading">
                    <span v-if="loading" class="loading loading-spinner loading-xs"></span>
                    {{ $t('StudentDeleteAll.next') }}
                </button>
            </div>
        </form>
    </dialog>
    <dialog ref="secondDialogRef" class="modal">
        <form method="dialog" class="modal-box">
            <h3 class="font-bold text-lg text-error">{{ $t('StudentDeleteAll.titleStep2') }}</h3>
            <p class="py-4">
                {{ $t('StudentDeleteAll.confirmStep2', { grade: mapGradeDisplay(grade) }) }}
                <br>{{ $t('StudentDeleteAll.warningStep2') }}
            </p>
            <div class="modal-action">
                <button type="button" class="btn btn-ghost" @click="closeSecond">{{ $t('StudentDeleteAll.cancel')
                    }}</button>
                <button type="button" class="btn btn-error" @click="deleteAll" :disabled="loading">
                    <span v-if="loading" class="loading loading-spinner loading-xs"></span>
                    {{ $t('StudentDeleteAll.confirmDelete') }}
                </button>
            </div>
        </form>
    </dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { StudentService } from '../../api/student'
import { mapGradeDisplay } from '../../utils/gradeSystem'

const { t } = useI18n()
const modalRef = ref(null)
const secondDialogRef = ref(null)
const grade = ref('')
const loading = ref(false)
const emit = defineEmits(['success'])

const open = (selectedGrade) => {
    grade.value = selectedGrade
    modalRef.value.showModal()
}
const close = () => {
    modalRef.value.close()
}
const confirmSecond = () => {
    modalRef.value.close()
    secondDialogRef.value.showModal()
}
const closeSecond = () => {
    secondDialogRef.value.close()
}
const deleteAll = async () => {
    loading.value = true
    try {
        const service = new StudentService()
        const res = await service.deleteAllByGrade(toLegacyGrade(grade.value))
        if (res.message === 'Success') {
            emit('success')
            closeSecond()
        } else {
            alert(t('StudentDeleteAll.deleteError'))
        }
    } catch (e) {
        alert(t('StudentDeleteAll.deleteError'))
    } finally {
        loading.value = false
    }
}
defineExpose({ open })
</script>