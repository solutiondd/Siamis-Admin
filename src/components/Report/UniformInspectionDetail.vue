<template>
    <dialog ref="modalRef" class="modal">
        <div class="modal-box w-11/12 max-w-5xl">
            <div class="flex items-start justify-between gap-4 mb-5">
                <div>
                    <h3 class="font-bold text-lg">{{ t('ReportUniformInspectionDetail.title') }}</h3>
                    <p class="text-xs text-base-content/60">{{ t('ReportUniformInspectionDetail.subtitle') }}</p>
                </div>
            </div>

            <div v-if="loading" class="flex justify-center py-10">
                <span class="loading loading-spinner loading-lg"></span>
            </div>

            <div v-else-if="detail" class="text-sm space-y-4">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div class="rounded-lg border border-base-300 p-4">
                        <h4 class="font-semibold mb-3 text-base">{{ t('ReportUniformInspectionDetail.inspectionInfo') }}</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportUniformInspectionDetail.gradeClassroom') }}</span>
                                <span class="font-semibold">{{ formatGradeClassroomDisplay(detail.grade,
                                    detail.classroom) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportUniformInspectionDetail.creator') }}</span>
                                <span class="font-semibold">{{ detail.inspector?.name || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportUniformInspectionDetail.creatorRole') }}</span>
                                <span class="font-semibold">{{ detail.inspector?.role || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportUniformInspectionDetail.inspectionDate') }}</span>
                                <span class="font-semibold">{{ formatThaiDate(detail.date) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportUniformInspectionDetail.createdDate') }}</span>
                                <span class="font-semibold">{{ formatThaiDateTime(detail.createdAt) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-lg border border-base-300 p-4">
                        <h4 class="font-semibold mb-3 text-base">{{ t('ReportUniformInspectionDetail.summary') }}</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportUniformInspectionDetail.updatedBy') }}</span>
                                <span class="font-semibold">{{ detail.updated_by?.name || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportUniformInspectionDetail.updatedByRole') }}</span>
                                <span class="font-semibold">{{ detail.updated_by?.role || '-' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportUniformInspectionDetail.total') }}</span>
                                <span class="font-semibold">{{ summary.total }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportUniformInspectionDetail.pass') }}</span>
                                <span class="font-semibold text-success">{{ summary.pass }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportUniformInspectionDetail.notPass') }}</span>
                                <span class="font-semibold text-error">{{ summary.not_pass }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-base-content/70">{{ t('ReportUniformInspectionTable.issuesMap.ไม่มาตรวจ') }}</span>
                                <span class="font-semibold text-warning">{{ summary.no_show }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="rounded-lg border border-base-300 p-4 overflow-visible">
                    <h4 class="font-semibold mb-3 text-base">{{ t('ReportUniformInspectionDetail.studentList') }}</h4>
                    <table class="table table-zebra w-full text-sm">
                        <thead>
                            <tr>
                                <th>{{ t('ReportUniformInspectionDetail.studentCode') }}</th>
                                <th>{{ t('ReportUniformInspectionDetail.studentName') }}</th>
                                <th class="text-center">
                                    <div class="inline-flex items-center gap-1 justify-center">
                                        <span>{{ t('ReportUniformInspectionDetail.status') }}</span>
                                        <div class="dropdown dropdown-bottom dropdown-end">
                                            <div tabindex="0" role="button" class="btn btn-xs btn-ghost btn-circle"
                                                :title="t('ReportUniformInspectionDetail.statusFilter')">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                                    viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                                </svg>
                                            </div>
                                            <ul tabindex="0"
                                                class="dropdown-content z-[50] menu p-2 shadow-lg bg-base-100 rounded-box w-32 text-left font-normal border border-base-200">
                                                <li><a :class="{ 'active': statusFilter === 'ALL' }"
                                                        @click="statusFilter = 'ALL'">{{ t('UniformInspection.all') }}</a></li>
                                                <li><a :class="{ 'active': statusFilter === 'PASS' }"
                                                        @click="statusFilter = 'PASS'">{{ t('ReportUniformInspectionDetail.pass') }}</a></li>
                                                <li><a :class="{ 'active': statusFilter === 'NOT_PASS' }"
                                                        @click="statusFilter = 'NOT_PASS'">{{ t('ReportUniformInspectionDetail.notPass') }}</a></li>
                                                <li><a :class="{ 'active': statusFilter === 'NO_SHOW' }"
                                                        @click="statusFilter = 'NO_SHOW'">{{ t('ReportUniformInspectionDetail.noShow') }}</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </th>
                                <th>{{ t('ReportUniformInspectionDetail.issues') }}</th>
                                <th>{{ t('ReportUniformInspectionDetail.remark') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in filteredStudents"
                                :key="`${item?.student_id?._id || 'row'}-${index}`">
                                <td>{{ item?.student_id?.userid || '-' }}</td>
                                <td>{{ item?.student_id?.name || '-' }}</td>
                                <td class="text-center">
                                    <span v-if="item?.ispass"
                                        class="badge badge-success whitespace-nowrap max-[509px]:badge-xs">
                                        {{ t('ReportUniformInspectionDetail.pass') }}
                                    </span>
                                    <span v-else-if="item?.remark === 'ไม่มาตรวจ'"
                                        class="badge badge-warning whitespace-nowrap max-[509px]:badge-xs">
                                        {{ t('ReportUniformInspectionDetail.noShow') }}
                                    </span>
                                    <span v-else
                                        class="badge badge-error whitespace-nowrap max-[509px]:badge-xs">
                                        {{ t('ReportUniformInspectionDetail.notPass') }}
                                    </span>
                                </td>
                                <td>{{ translateIssues(item?.issues) }}</td>
                                <td>{{ translateRemark(item?.remark) }}</td>
                            </tr>
                            <tr v-if="!filteredStudents.length">
                                <td colspan="5" class="text-center text-gray-500 py-4">
                                    {{ t('ReportUniformInspectionDetail.noStudentData') }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div v-else class="text-center py-10 text-base-content/60">
                {{ t('ReportUniformInspectionDetail.noDetailData') }}
            </div>

            <div class="modal-action">
                <button class="btn" @click="closeModal">{{ t('ReportUniformInspectionDetail.close') }}</button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { UniformInspectionService } from '../../api/uniform_inspection';
import { formatGradeClassroomDisplay } from '../../utils/gradeSystem';

const { t, locale } = useI18n();

const modalRef = ref(null);
const loading = ref(false);
const detail = ref(null);
const statusFilter = ref('ALL');
const uniformInspectionService = new UniformInspectionService();

const formatThaiDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat(locale.value === 'th' ? 'th-TH' : 'en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

const formatThaiDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat(locale.value === 'th' ? 'th-TH' : 'en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const translateIssues = (issues) => {
    if (!Array.isArray(issues) || !issues.length) return '-';
    return issues
        .map((issue) => t(`ReportUniformInspectionTable.issuesMap.${issue}`, issue))
        .join(', ');
};

const translateRemark = (remark) => {
    if (!remark || remark === 'ไม่มาตรวจ') return '-';
    return t(`ReportUniformInspectionTable.remarkMap.${remark}`, remark);
};

const summary = computed(() => {
    if (detail.value?.summary) {
        const rawNotPass = detail.value.summary.not_pass ?? 0;
        const noShow = detail.value.summary.no_show ?? 0;
        return {
            total: detail.value.summary.total ?? 0,
            pass: detail.value.summary.pass ?? 0,
            not_pass: Math.max(0, rawNotPass - noShow),
            no_show: noShow,
        };
    }

    const students = detail.value?.students || [];
    const total = students.length;
    const pass = students.filter((item) => item?.ispass === true).length;
    const noShow = students.filter((item) => item?.remark === 'ไม่มาตรวจ').length;
    const notPass = students.filter((item) => item?.ispass === false && item?.remark !== 'ไม่มาตรวจ').length;

    return {
        total,
        pass,
        not_pass: notPass,
        no_show: noShow,
    };
});

const filteredStudents = computed(() => {
    const students = detail.value?.students || [];
    if (statusFilter.value === 'ALL') {
        return students;
    }
    if (statusFilter.value === 'PASS') {
        return students.filter((item) => item?.ispass === true);
    }
    if (statusFilter.value === 'NO_SHOW') {
        return students.filter((item) => item?.remark === 'ไม่มาตรวจ');
    }
    if (statusFilter.value === 'NOT_PASS') {
        return students.filter((item) => item?.ispass === false && item?.remark !== 'ไม่มาตรวจ');
    }
    return students;
});

const openModal = async (id) => {
    if (!id) return;
    loading.value = true;
    detail.value = null;
    statusFilter.value = 'ALL';
    modalRef.value?.showModal();
    try {
        const response = await uniformInspectionService.getUniformInspectionById(id);
        detail.value = response?.data || null;
    } catch (error) {
        console.error('Load uniform inspection detail error:', error);
        detail.value = null;
    } finally {
        loading.value = false;
    }
};

const closeModal = () => {
    modalRef.value?.close();
};

defineExpose({ openModal });
</script>