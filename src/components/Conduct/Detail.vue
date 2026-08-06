<template>
    <teleport to="body">
        <div v-if="modelValue" class="fixed inset-0 bg-slate-900/45 flex items-center justify-center z-[9999] p-4" @click.self="closeModal">
            <div class="w-full max-w-[560px] bg-white rounded-[14px] shadow-[0_16px_44px_rgba(15,23,42,0.28)] overflow-hidden border border-slate-200" role="dialog" aria-modal="true" :aria-label="$t('ConductDetail.modalTitle')">
                <div class="flex items-center justify-between py-[14px] px-[18px] border-b border-slate-200 bg-slate-50">
                    <h3 class="close-btn text-lg font-semibold text-slate-900">{{ $t('ConductDetail.modalTitle') }}</h3>
                    <button class="text-slate-500 hover:text-slate-700 transition-colors" @click="closeModal" :aria-label="$t('ConductDetail.close')">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div class="pt-[14px] px-[18px] pb-[18px] grid grid-cols-1 gap-3">
                    <section class="border border-slate-200 rounded-xl p-3 bg-white">
                        <h4 class="mt-0 mx-0 mb-[10px] text-[0.95rem] font-bold text-slate-700">{{ $t('ConductDetail.behaviorInfoSection') }}</h4>
                        <div class="detail-item">
                            <span class="text-slate-500 font-semibold">{{ $t('ConductDetail.typeLabel') }}</span>
                            <span class="text-slate-900 break-words">{{ detailData.behavior_type || '-' }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="text-slate-500 font-semibold">{{ $t('ConductDetail.listLabel') }}</span>
                            <span class="text-slate-900 break-words">{{ detailData.behavior || '-' }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="text-slate-500 font-semibold">{{ $t('ConductDetail.levelLabel') }}</span>
                            <span class="text-slate-900 break-words">{{ detailData.behavior_level || '-' }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="text-slate-500 font-semibold">{{ $t('ConductDetail.descriptionLabel') }}</span>
                            <span class="text-slate-900 break-words">{{ detailData.description || '-' }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="text-slate-500 font-semibold">{{ $t('ConductDetail.scoreLabel') }}</span>
                            <span class="text-slate-900 break-words"
                                :class="Number(detailData.score) < 0 ? 'score-negative' : 'score-positive'">
                                {{ detailData.score ?? '-' }}
                            </span>
                        </div>
                    </section>

                    <section class="border border-slate-200 rounded-xl p-3 bg-white">
                        <h4 class="mt-0 mx-0 mb-[10px] text-[0.95rem] font-bold text-slate-700">{{ $t('ConductDetail.recorderInfoSection') }}</h4>
                        <div class="detail-item">
                            <span class="text-slate-500 font-semibold">{{ $t('ConductDetail.recorderLabel') }}</span>
                            <span class="text-slate-900 break-words">{{ detailData.teacher_id?.name || '-' }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="text-slate-500 font-semibold">{{ $t('ConductDetail.recorderRoleLabel') }}</span>
                            <span class="text-slate-900 break-words">{{ detailData.teacher_id?.role || '-' }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="text-slate-500 font-semibold">{{ $t('ConductDetail.recordedDateLabel') }}</span>
                            <span class="text-slate-900 break-words">{{ formatDate(detailData.created_at) }}</span>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    detail: {
        type: Object,
        default: () => ({}),
    },
})

const emit = defineEmits(['update:modelValue'])

const detailData = computed(() => props.detail || {})

function closeModal() {
    emit('update:modelValue', false)
}

function formatDate(dateStr) {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return '-'
    const currentLang = locale.value === 'th' ? 'th-TH' : 'en-US'
    return d.toLocaleDateString(currentLang, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}
</script>

<style scoped>
.close-btn:hover {
    background: #e2e8f0;
    color: #334155;
}

.detail-item {
    display: grid;
    grid-template-columns: 125px 1fr;
    gap: 10px;
    align-items: start;
}

.score-positive {
    color: #16a34a;
    font-weight: 700;
}

.score-negative {
    color: #dc2626;
    font-weight: 700;
}

@media (max-width: 640px) {
    .detail-item {
        grid-template-columns: 1fr;
        gap: 4px;
    }
}
</style>