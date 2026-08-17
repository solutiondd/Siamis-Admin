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
import { AllowanceService } from '../../api/allowance'
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
const allowanceService = new AllowanceService()
let originalSetting = null

const normalizeTime = (timeValue) => {
    if (!timeValue || typeof timeValue !== 'string') return null
    const parts = timeValue.split(':')
    if (parts.length < 2) return null
    const [hh, mm, ss = '00'] = parts
    return `${hh}:${mm}:${ss}`
}

const toConductUpdatePayload = (setting) => {
    const defaults = createDefaultConductSetting()
    const source = setting || {}

    return {
        enabled: typeof source.enabled === 'boolean' ? source.enabled : defaults.enabled,
        late: {
            enabled: typeof source?.late?.enabled === 'boolean' ? source.late.enabled : defaults.late.enabled,
            cutoff_time: normalizeTime(source?.late?.cutoff_time) || defaults.late.cutoff_time,
            score: Number.isFinite(Number(source?.late?.score)) ? Number(source.late.score) : defaults.late.score,
            behavior_type: source?.late?.behavior_type || defaults.late.behavior_type,
            behavior: source?.late?.behavior || defaults.late.behavior,
            behavior_level: Number.isFinite(Number(source?.late?.behavior_level))
                ? Number(source.late.behavior_level)
                : defaults.late.behavior_level,
            description_template: source?.late?.description_template || defaults.late.description_template,
        },
        absent: {
            enabled: typeof source?.absent?.enabled === 'boolean'
                ? source.absent.enabled
                : defaults.absent.enabled,
            cutoff_time: normalizeTime(source?.absent?.cutoff_time),
            score: Number.isFinite(Number(source?.absent?.score))
                ? Number(source.absent.score)
                : defaults.absent.score,
            behavior_type: source?.absent?.behavior_type || defaults.absent.behavior_type,
            behavior: source?.absent?.behavior || defaults.absent.behavior,
            behavior_level: Number.isFinite(Number(source?.absent?.behavior_level))
                ? Number(source.absent.behavior_level)
                : defaults.absent.behavior_level,
            description_template: source?.absent?.description_template || defaults.absent.description_template,
        },
    }
}

const syncStudentAllowanceFromLateCutoff = async (lateCutoffTime) => {
    const normalizedTime = normalizeTime(lateCutoffTime)
    if (!normalizedTime) return

    const current = await allowanceService.getAllowance()
    const currentRules = Array.isArray(current?.data?.rules) ? current.data.rules : []
    let hasStudentRule = false

    const nextRules = currentRules.map((rule) => {
        if (rule.role === 'student') {
            hasStudentRule = true
            return {
                ...rule,
                allowance_time: normalizedTime,
            }
        }
        return {
            ...rule,
            allowance_time: normalizeTime(rule.allowance_time) || rule.allowance_time,
        }
    })

    if (!hasStudentRule) {
        nextRules.push({
            role: 'student',
            allowance_time: normalizedTime,
        })
    }

    await allowanceService.updateAllowance({
        rules: nextRules.map((rule) => ({
            role: rule.role,
            allowance_time: normalizeTime(rule.allowance_time) || rule.allowance_time,
        })),
    })
}

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
        const mergedSetting = {
            enabled: form.value.enabled,
            late: { ...baseSetting.late, ...form.value.late },
            absent: { ...baseSetting.absent, ...form.value.absent },
        }
        const payload = toConductUpdatePayload(mergedSetting)
        await service.updateAttendanceConductSetting(payload)
        await syncStudentAllowanceFromLateCutoff(payload.late?.cutoff_time)
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