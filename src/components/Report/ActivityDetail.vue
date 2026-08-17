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

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
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

                <!-- <div class="rounded-lg border border-base-300 p-4 bg-base-50">
                    <h4 class="font-semibold mb-3 text-base">การเข้าเรียน</h4> -->

                <div v-if="groupedAttendance && groupedAttendance.length" class="space-y-4">
                    <div v-for="(group, gIdx) in groupedAttendance" :key="gIdx"
                        class="bg-white border border-base-200 rounded-xl p-4 shadow-sm">
                        <h5 class="font-bold text-gray-800 text-sm mb-3">
                            {{ $t('ReportActivityDetail.timeLog') }} - {{ formatDateFull(group.date) }}
                        </h5>

                        <div class="flex flex-wrap gap-3">
                            <div v-for="(item, iIdx) in group.items" :key="iIdx"
                                class="border border-base-200 rounded-2xl p-3 bg-white flex flex-col items-center w-36 text-center shadow-xs">
                                <div
                                    class="w-full h-32 bg-gray-100 rounded-xl overflow-hidden mb-2 flex items-center justify-center">
                                    <img v-if="item.imageUrl" :src="getAttendanceImage(item.imageUrl)"
                                        :alt="$t('ReportActivityDetail.checkInPhotoAlt')"
                                        class="w-full h-full object-cover" @error="imageErrorHandler(`${gIdx}-${iIdx}`)"
                                        v-show="!imageError[`${gIdx}-${iIdx}`]" />
                                    <span v-if="!item.imageUrl || imageError[`${gIdx}-${iIdx}`]"
                                        class="text-4xl font-bold text-blue-700 select-none">
                                        {{ getInitials(activity.user_id?.name) }}
                                    </span>
                                </div>

                                <span class="text-blue-600 font-bold text-base">
                                    {{ formatScanTime(item.time || item.timeStamp) }}
                                </span>

                                <span class="text-[11px] text-gray-400 mt-0.5">
                                    {{ $t('ReportActivityDetail.similarity') }}: {{ item.similarity !== undefined ?
                                    `${item.similarity}%` : '0%' }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="text-center text-gray-400 py-3 text-xs">
                    {{ $t('ReportActivityDetail.noAttendanceData') }}
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
import { ref, computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatGradeClassroomDisplay } from '../../utils/gradeSystem';

const { t, locale } = useI18n();

const modalRef = ref(null);
const activity = ref(null);
const imgBaseUrl = import.meta.env.VITE_IMG_PROFILE_URL || '';
const imageError = reactive({});

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
    const parts = String(time).split(':');
    if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
    }
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

const getAttendanceImage = (imageUrl) => {
    if (!imageUrl) return '';
    if (String(imageUrl).startsWith('http')) return imageUrl;

    const base = String(imgBaseUrl || '').replace(/\/$/, '');
    const path = String(imageUrl).startsWith('/') ? String(imageUrl) : `/${imageUrl}`;
    return `${base}${path}`;
};

const imageErrorHandler = (key) => {
    imageError[key] = true;
};

const getInitials = (name) => {
    if (!name) return '-';
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`;
    if (parts.length === 1) return parts[0][0];
    return '-';
};

const groupedAttendance = computed(() => {
    if (!activity.value?.attendance || !Array.isArray(activity.value.attendance)) {
        return [];
    }

    const groups = {};

    activity.value.attendance.forEach((att) => {
        if (att.timeStamps && Array.isArray(att.timeStamps) && att.timeStamps.length > 0) {
            att.timeStamps.forEach((st) => {
                const dateKey = st.date || att.date || 'unknown';
                if (!groups[dateKey]) {
                    groups[dateKey] = [];
                }
                groups[dateKey].push({
                    ...st,
                    imageUrl: st.imageUrl || att.imageUrl || st.image || st.img || st.photo || att.image || att.img,
                    image: st.image || st.img || st.photo || att.image || att.img,
                    deviceId: st.deviceId || st.sn || st.device_id || att.deviceId || att.sn,
                    similarity: st.similarity ?? att.similarity ?? 0
                });
            });
        } else {
            const dateKey = att.date || 'unknown';
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(att);
        }
    });

    return Object.keys(groups).map((date) => ({
        date,
        items: groups[date],
    }));
});

const formatDateFull = (dateStr) => {
    if (!dateStr || dateStr === 'unknown') return '-';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
};

const formatScanTime = (timeStr) => {
    if (!timeStr) return '-';
    if (String(timeStr).includes(' ')) {
        return String(timeStr).split(' ')[1];
    }
    return timeStr;
};

const openModal = (data) => {
    activity.value = data;
    Object.keys(imageError).forEach((k) => delete imageError[k]);
    modalRef.value?.showModal();
};

const closeModal = () => {
    modalRef.value?.close();
};

defineExpose({ openModal });
</script>