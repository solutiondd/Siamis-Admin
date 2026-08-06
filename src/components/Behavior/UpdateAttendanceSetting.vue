<template>
    <dialog ref="modal" class="modal">
        <div class="modal-box max-w-lg">
            <h3 class="font-bold text-lg mb-4 text-primary">{{ $t('BehaviorUpdateAttendanceSetting.modalTitle') }}</h3>
            <div class="space-y-4" v-if="form">
                <div class="flex items-center gap-3">
                    <input type="checkbox" v-model="form.enabled" class="toggle toggle-primary" />
                    <span class="font-medium">{{ $t('BehaviorUpdateAttendanceSetting.enableAutoDeduct') }}</span>
                </div>
                <div class="divider">{{ $t('BehaviorUpdateAttendanceSetting.lateDivider') }}</div>
                <div class="flex items-center gap-3">
                    <input type="checkbox" v-model="form.late.enabled" class="toggle toggle-warning" />
                    <span>{{ $t('BehaviorUpdateAttendanceSetting.enableLateDeduct') }}</span>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div class="form-control">
                        <label class="label"><span class="label-text">{{ $t('BehaviorUpdateAttendanceSetting.lateCutoffTime') }}</span></label>
                        <input type="time" v-model="form.late.cutoff_time" class="input input-bordered input-sm"
                            step="1" />
                    </div>
                    <div class="form-control">
                        <label class="label"><span class="label-text">{{ $t('BehaviorUpdateAttendanceSetting.deductScore') }}</span></label>
                        <input type="number" v-model.number="form.late.score" class="input input-bordered input-sm" />
                    </div>
                </div>
                <div class="divider">{{ $t('BehaviorUpdateAttendanceSetting.absentDivider') }}</div>
                <div class="flex items-center gap-3">
                    <input type="checkbox" v-model="form.absent.enabled" class="toggle toggle-error" />
                    <span>{{ $t('BehaviorUpdateAttendanceSetting.enableAbsentDeduct') }}</span>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div class="form-control">
                        <label class="label"><span class="label-text">{{ $t('BehaviorUpdateAttendanceSetting.deductScore') }}</span></label>
                        <input type="number" v-model.number="form.absent.score" class="input input-bordered input-sm" />
                    </div>
                </div>
            </div>
            <div class="modal-action mt-6">
                <button class="btn btn-ghost" @click="close">{{ $t('BehaviorUpdateAttendanceSetting.cancelBtn') }}</button>
                <button class="btn btn-primary" :disabled="saving" @click="save">
                    <span v-if="saving" class="loading loading-spinner loading-xs"></span>
                    {{ $t('BehaviorUpdateAttendanceSetting.saveBtn') }}
                </button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop"><button @click="close">close</button></form>
    </dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { BehaviorService } from '../../api/behavior'
import Swal from 'sweetalert2';

const { t } = useI18n()

const createDefaultConductSetting = () => ({
    enabled: false,
    late: {
        enabled: false,
        cutoff_time: '08:01:00',
        score: -1,
        behavior_type: 'attendance',
        behavior: 'มาสาย',
        behavior_level: 1,
        description_template: 'มาสายในวันที่ {{date}} เวลาเข้าเรียนครั้งแรก {{first_time}}',
    },
    absent: {
        enabled: false,
        cutoff_time: null,
        score: -3,
        behavior_type: 'attendance',
        behavior: 'ขาดเรียน',
        behavior_level: 2,
        description_template: 'ขาดเรียนในวันที่ {{date}} เนื่องจากไม่พบข้อมูลเข้าเรียน',
    },
})

const cloneConductSetting = (setting) => ({
    ...createDefaultConductSetting(),
    ...(setting || {}),
    late: {
        ...createDefaultConductSetting().late,
        ...((setting && setting.late) || {}),
    },
    absent: {
        ...createDefaultConductSetting().absent,
        ...((setting && setting.absent) || {}),
    },
})

const emit = defineEmits(['updated'])

const modal = ref(null)
const form = ref(null)
const saving = ref(false)
const absentTimeEnabled = ref(false)
const service = new BehaviorService()
let originalSetting = null

const open = (conductSetting) => {
    const nextSetting = cloneConductSetting(conductSetting)
    originalSetting = cloneConductSetting(conductSetting)
    form.value = nextSetting
    absentTimeEnabled.value = !!nextSetting.absent?.cutoff_time
    modal.value?.showModal()
}

const close = () => {
    modal.value?.close()
    form.value = null
}

const save = async () => {
    saving.value = true
    try {
        const baseSetting = originalSetting || createDefaultConductSetting()
        const payload = {
            enabled: form.value.enabled,
            late: { ...baseSetting.late, ...form.value.late },
            absent: { ...baseSetting.absent, ...form.value.absent },
        }
        await service.updateAttendanceConductSetting(payload)
        close()
        emit('updated')
        await Swal.fire(t('BehaviorUpdateAttendanceSetting.saveSuccessTitle'), '', 'success')
    } catch (e) {
        await Swal.fire(t('BehaviorUpdateAttendanceSetting.errorTitle'), e.message || t('BehaviorUpdateAttendanceSetting.saveFailed'), 'error')
    } finally {
        saving.value = false
    }
}

defineExpose({ open })
</script>