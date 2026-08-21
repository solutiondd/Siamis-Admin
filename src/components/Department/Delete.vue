<template>
    <dialog ref="modalRef" class="modal">
        <div class="modal-box">
            <h3 class="font-bold text-lg mb-4">{{ t('departmentDelete.title') }}</h3>
            <p class="py-4">{{ t('departmentDelete.confirmText') }} <span class="font-bold text-error">{{ department?.name }}</span>
                {{ t('departmentDelete.warningText') }}</p>
            <div class="modal-action">
                <button @click="closeModal" class="btn btn-ghost">{{ t('departmentDelete.cancelBtn') }}</button>
                <button @click="handleDelete" class="btn btn-error" :disabled="loading">
                    <span v-if="loading" class="loading loading-spinner loading-sm"></span>
                    <span v-else>{{ t('departmentDelete.deleteBtn') }}</span>
                </button>
            </div>
        </div>
    </dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const modalRef = ref(null)
const loading = ref(false)
const department = ref(null)

const emit = defineEmits(['success'])

const openModal = (dept) => {
    department.value = dept
    modalRef.value.showModal()
}

const closeModal = () => {
    modalRef.value.close()
    department.value = null
}

const handleDelete = async () => {
    emit('success', department.value._id)
    closeModal()
}

defineExpose({
    openModal
})
</script>

<style scoped></style>