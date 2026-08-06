<template>
    <dialog ref="dialogRef" class="modal">
        <div class="modal-box p-4">
            <h3 class="font-bold text-lg mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-error" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01M5.07 19h13.86A2.07 2.07 0 0021 16.93V7.07A2.07 2.07 0 0018.93 5H5.07A2.07 2.07 0 003 7.07v9.86A2.07 2.07 0 005.07 19z" />
                </svg>
                {{ $t('ReportUniformInspectionDelete.confirmTitle') }}
            </h3>
            <p class="text-sm mb-4" v-if="inspection">
                {{ $t('ReportUniformInspectionDelete.confirmText', {
                    date: formatDate(inspection.date),
                    grade: inspection.grade,
                    classroom: inspection.classroom
                }) }}
            </p>
            <p v-else class="text-sm mb-4">{{ $t('ReportUniformInspectionDelete.preparingData') }}</p>

            <div class="flex justify-end gap-2 mt-2">
                <button class="btn btn-sm" @click="close" :disabled="loading">{{ $t('ReportUniformInspectionDelete.cancel') }}</button>
                <button class="btn btn-sm btn-error" @click="confirmDelete" :disabled="loading">
                    <span v-if="loading" class="loading loading-spinner loading-xs"></span>
                    <span v-else>{{ $t('ReportUniformInspectionDelete.delete') }}</span>
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
import Swal from 'sweetalert2'
import { ConductService } from '../../api/conduct'
import { UniformInspectionService } from '../../api/uniform_inspection'

const { t, locale } = useI18n()
const dialogRef = ref(null)
const inspection = ref(null)
const loading = ref(false)

const emit = defineEmits(['success'])

const conductService = new ConductService()
const uniformInspectionService = new UniformInspectionService()

function open(targetInspection) {
    inspection.value = targetInspection
    dialogRef.value?.showModal()
}

function close() {
    if (loading.value) return
    dialogRef.value?.close()
}

function formatDate(dateStr) {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    const dateLocale = locale.value === 'th' ? 'th-TH-u-ca-buddhist' : 'en-US'
    return date.toLocaleDateString(dateLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

async function confirmDelete() {
    if (!inspection.value?._id) return
    loading.value = true
    try {
        const fullData = await uniformInspectionService.getUniformInspectionById(inspection.value._id)
        const students = Array.isArray(fullData?.data?.students) ? fullData.data.students : []
        const conductIds = students
            .filter((s) => s?.ispass === false && s?.conduct_id)
            .map((s) => String(s.conduct_id).trim())
            .filter(Boolean)

        if (conductIds.length) {
            await Promise.allSettled(conductIds.map((id) => conductService.deleteConduct(id)))
        }

        await uniformInspectionService.deleteUniformInspection(inspection.value._id)

        dialogRef.value?.close()
        emit('success')
        await Swal.fire({
            icon: 'success',
            title: t('ReportUniformInspectionDelete.deleteSuccessTitle'),
            text: t('ReportUniformInspectionDelete.deleteSuccessText'),
            showConfirmButton: false,
            timer: 1600,
        })
    } catch (e) {
        console.error('Delete uniform inspection error:', e)
        Swal.fire(
            t('ReportUniformInspectionDelete.errorTitle'),
            t('ReportUniformInspectionDelete.errorText'),
            'error'
        )
    } finally {
        loading.value = false
    }
}

defineExpose({ open })
</script>