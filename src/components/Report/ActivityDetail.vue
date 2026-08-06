<template>
    <dialog ref="modalRef" class="modal">
        <div class="modal-box w-11/12 max-w-3xl">
            <div class="flex items-start justify-between gap-4 mb-5">
                <div>
                    <h3 class="font-bold text-lg">{{ t('ReportActivityDetail.title') }}</h3>
                    <p class="text-xs text-base-content/60">{{ t('ReportActivityDetail.subtitle') }}</p>
                </div>
                <div v-if="activity" :class="['badge', getStatusBadgeClass(activity.status)]">
                    {{ formatStatus(activity.status) }}
                </div>
            </div>

            <div v-if="activity" class="text-sm">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div class="rounded-lg border border-base-300 p-4">
                        <h4 class="font-semibold mb-3 text-base">{{ t('ReportActivityDetail.participantInfo') }}</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportActivityDetail.code') }}</span>
                                <span class="font-semibold">{{ activity.user_id?.userid || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportActivityDetail.name') }}</span>
                                <span class="font-semibold">{{ activity.user_id?.name || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportActivityDetail.role') }}</span>
                                <span class="font-semibold">{{ formatRole(activity.user_id?.role) }}</span>
                            </div>
                            <div v-if="formatStudentLevel(activity.user_id?.grade, activity.user_id?.classroom)"
                                class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportActivityDetail.gradeClass') }}</span>
                                <span class="font-semibold">{{ formatStudentLevel(activity.user_id?.grade,
                                    activity.user_id?.classroom) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-lg border border-base-300 p-4">
                        <h4 class="font-semibold mb-3 text-base">{{ t('ReportActivityDetail.activityDetail') }}</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportActivityDetail.activityName') }}</span>
                                <span class="font-semibold text-right break-words">{{ activity.activity_name || '-'
                                }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportActivityDetail.location') }}</span>
                                <span class="font-semibold text-right break-words">{{ activity.location || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportActivityDetail.dateRange') }}</span>
                                <span class="font-semibold">{{ formatDateRange(
                                    activity.activity_date_start || activity.activity_date || activity.date,
                                    activity.activity_date_end || activity.activity_date_start || activity.activity_date
                                    || activity.date
                                ) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportActivityDetail.timeRange') }}</span>
                                <span class="font-semibold">{{ formatTimeRange(activity.start_time, activity.end_time)
                                }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div class="rounded-lg border border-base-300 p-4">
                        <h4 class="font-semibold mb-3 text-base">{{ t('ReportActivityDetail.recorderInfo') }}</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportActivityDetail.name') }}</span>
                                <span class="font-semibold">{{ activity.created_by?.name || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportActivityDetail.role') }}</span>
                                <span class="font-semibold">{{ formatRole(activity.created_by?.role) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportActivityDetail.recordedAt') }}</span>
                                <span class="font-semibold">{{ formatDate(activity.created_at) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-lg border border-base-300 p-4">
                        <h4 class="font-semibold mb-3 text-base">{{ t('ReportActivityDetail.lastUpdate') }}</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportActivityDetail.updatedBy') }}</span>
                                <span class="font-semibold">{{ activity.updated_by?.name || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportActivityDetail.role') }}</span>
                                <span class="font-semibold">{{ formatRole(activity.updated_by?.role) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportActivityDetail.updatedAt') }}</span>
                                <span class="font-semibold">{{ formatDate(activity.updated_at) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-action">
                <button class="btn" @click="closeModal">{{ t('ReportActivityDetail.close') }}</button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatGradeClassroomDisplay } from '../../utils/gradeSystem';

const { t, locale } = useI18n();

const modalRef = ref(null);
const activity = ref(null);

const formatRole = (role) => {
    if (role === 'student') return t('ReportActivityDetail.roleStudent');
    if (role === 'teacher') return t('ReportActivityDetail.roleTeacher');
    return role || '-';
};

const formatStatus = (status) => {
    if (!status) return '-';
    const value = String(status).toLowerCase();
    if (value === 'participated' || value === 'joined' || status === 'เข้าร่วม') return t('ReportActivityDetail.statusParticipated');
    if (value === 'late' || status === 'สาย') return t('ReportActivityDetail.statusLate');
    if (value === 'absent' || status === 'ขาด') return t('ReportActivityDetail.statusAbsent');
    if (value === 'leave' || status === 'ลา') return t('ReportActivityDetail.statusLeave');
    return status;
};

const getStatusBadgeClass = (status) => {
    const value = String(status || '').toLowerCase();
    if (value === 'participated' || value === 'joined' || status === 'เข้าร่วม') return 'badge-success text-success-content';
    if (value === 'late' || status === 'สาย') return 'badge-warning text-warning-content';
    if (value === 'absent' || status === 'ขาด') return 'badge-error text-error-content';
    if (value === 'leave' || status === 'ลา') return 'badge-info text-info-content';
    return 'badge-outline';
};

const formatStudentLevel = (grade, classroom) => {
    if (!grade && !classroom) return null;
    return formatGradeClassroomDisplay(grade, classroom);
};

const formatTime = (time) => {
    if (!time) return '-';
    return time;
};

const formatTimeRange = (startTime, endTime) => {
    if (!startTime && !endTime) return '-';
    if (startTime && endTime) return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    return formatTime(startTime) || formatTime(endTime);
};

const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const dateLocale = locale.value === 'th' ? 'th-TH' : 'en-US';
    return new Intl.DateTimeFormat(dateLocale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(d);
};

const formatDateRange = (startDate, endDate) => {
    if (!startDate && !endDate) return '-';
    if (startDate === endDate) return formatDate(startDate);
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

const openModal = (data) => {
    activity.value = data;
    modalRef.value?.showModal();
};

const closeModal = () => {
    modalRef.value?.close();
};

defineExpose({ openModal });
</script>