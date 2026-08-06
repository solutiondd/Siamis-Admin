<template>
    <div class="w-full">
        <div v-if="loading" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg"></span>
        </div>

        <div v-else class="bg-white rounded-lg shadow overflow-x-auto">
            <table class="table table-zebra w-full text-sm">
                <thead>
                    <tr class="bg-primary text-primary-content">
                        <th>{{ t('ReportActivityTable.colCode') }}</th>
                        <th>{{ t('ReportActivityTable.colName') }}</th>
                        <th class="hidden xl:table-cell">{{ t('ReportActivityTable.colRole') }}</th>
                        <th class="hidden lg:table-cell">{{ t('ReportActivityTable.colActivity') }}</th>
                        <th class="hidden md:table-cell">{{ t('ReportActivityTable.colDate') }}</th>
                        <th class="text-center">{{ t('ReportActivityTable.colAction') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="activity in activities"
                        :key="activity._id || `${activity.user_id?.userid}-${activity.activity_name}-${activity.activity_date_start || activity.date}`">
                        <td>{{ activity.user_id?.userid || '-' }}</td>
                        <td>{{ activity.user_id?.name || '-' }}</td>
                        <td class="hidden xl:table-cell">{{ formatRole(activity.user_id?.role) }}</td>
                        <td class="hidden lg:table-cell">{{ activity.activity_name || '-' }}</td>
                        <td class="hidden md:table-cell">{{ formatDate(activity.activity_date_start ||
                            activity.activity_date || activity.date) }}</td>
                        <td class="text-center">
                            <button @click="openDetail(activity)" class="bg-transparent border-none shadow-none p-0"
                                :title="t('ReportActivityTable.viewMore')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                    stroke="#3b82f6">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </td>
                    </tr>
                    <tr v-if="!activities.length">
                        <td colspan="6" class="text-center text-gray-500 py-6">{{ t('ReportActivityTable.noData') }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <ReportActivityDetail ref="activityDetailRef" />
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ActivityService } from '../../api/activity';
import ReportActivityDetail from './ActivityDetail.vue';

const { t, locale } = useI18n();

const props = defineProps({
    filters: {
        type: Object,
        default: () => ({
            start_date: '',
            end_date: '',
            search: '',
            status: '',
            role: '',
            activity_name: '',
            grade: '',
            classroom: '',
        }),
    },
});

const activityService = new ActivityService();
const loading = ref(false);
const activities = ref([]);
const activityDetailRef = ref(null);

const residentRole = localStorage.getItem('residentRole') || '';
const teacherGrade = localStorage.getItem('grade') || '';
const teacherClassroom = localStorage.getItem('classroom') || '';

const formatRole = (role) => {
    if (role === 'student') return t('ReportActivityTable.roleStudent');
    if (role === 'teacher') return t('ReportActivityTable.roleTeacher');
    return role || '-';
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

const openDetail = (activity) => {
    activityDetailRef.value?.openModal(activity);
};

const extractRows = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.results)) return response.results;
    return [];
};

const loadActivities = async () => {
    loading.value = true;
    try {
        const startDate = props.filters.start_date || '';
        const endDate = props.filters.end_date || '';
        const filters = {};

        if (props.filters.status) {
            filters.status = props.filters.status;
        }

        if (props.filters.activity_name) {
            filters.activity_name = props.filters.activity_name;
        }

        if (props.filters.grade) {
            filters.grade = props.filters.grade;
        }

        if (props.filters.classroom) {
            filters.classroom = props.filters.classroom;
        }

        const search = String(props.filters.search || '').trim();
        if (search && /^\d+$/.test(search)) {
            filters.userid = search;
        }

        if (residentRole === 'teacher' && teacherGrade && teacherClassroom) {
            filters.grade = teacherGrade;
            filters.classroom = teacherClassroom;
        }

        const response = await activityService.getActivities(startDate, endDate, filters);
        let data = extractRows(response);

        if (props.filters.role) {
            data = data.filter((item) => item.user_id?.role === props.filters.role);
        }

        if (search) {
            const keyword = search.toLowerCase();
            data = data.filter(
                (item) =>
                    item.user_id?.name?.toLowerCase().includes(keyword) ||
                    item.user_id?.userid?.toLowerCase().includes(keyword) ||
                    item.activity_name?.toLowerCase().includes(keyword)
            );
        }

        if (residentRole === 'teacher' && teacherGrade && teacherClassroom) {
            data = data.filter(
                (item) =>
                    item.user_id?.grade === teacherGrade &&
                    item.user_id?.classroom === teacherClassroom
            );
        }

        activities.value = data;
    } catch (error) {
        console.error('Error loading activities:', error);
        activities.value = [];
    } finally {
        loading.value = false;
    }
};

watch(() => props.filters, loadActivities, { deep: true });

loadActivities();
</script>