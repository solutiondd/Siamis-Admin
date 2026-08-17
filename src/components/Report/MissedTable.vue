<template>
    <div class="flex justify-end mb-2 gap-2">
        <button v-if="role === 'teacher' && !hideExport" class="btn btn-sm btn-primary" :disabled="loadingExportDoc"
            @click="exportDocxLeaveReport">
            {{ $t('ReportMissedTable.docExport') }}
        </button>
        <button v-if="!hideExport" class="btn btn-sm btn-success" :disabled="loadingExport"
            @click="exportMissedToExcel">
            <span v-if="loadingExport" class="loading loading-spinner loading-xs mr-2"></span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ $t('ReportMissedTable.excelExport') }}
        </button>
    </div>
    <div class="hidden lg:block bg-base-100 rounded-lg shadow-lg overflow-x-auto">
        <table class="table table-zebra w-full">
            <thead>
                <tr class="bg-primary text-primary-content">
                    <th class="text-center w-12">#</th>
                    <th class="text-center">{{ $t('ReportMissedTable.code') }}</th>
                    <th class="text-center">{{ $t('ReportMissedTable.image') }}</th>
                    <th>{{ $t('ReportMissedTable.fullName') }}</th>
                    <th class="text-center">{{ $t('ReportMissedTable.position') }}</th>
                    <th class="text-center">{{ $t('ReportMissedTable.classOrDept') }}</th>
                    <th class="text-center">{{ $t('ReportMissedTable.missedDate') }}</th>
                    <th class="text-center">{{ $t('ReportMissedTable.action') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="flattenedData.length === 0">
                    <td colspan="8" class="text-center py-8 text-base-content/60">
                        {{ $t('ReportMissedTable.noData') }}
                    </td>
                </tr>
                <template v-for="(group, groupIndex) in groupedData" :key="group[0]._id">
                    <tr class="hover">
                        <td class="text-center align-center">
                            {{ ((pagination?.page || 1) - 1) * (pagination?.limit || 10) + groupIndex + 1 }}
                        </td>
                        <td class="text-center align-center">{{ group[0].userid }}</td>
                        <td class="text-center align-center flex items-center justify-center">
                            <img v-if="group[0].picture" :src="`${imgProBaseUrl}${group[0].picture}`" alt="profile"
                                class="w-10 h-10 rounded-full object-cover cursor-pointer"
                                @click="viewImage(group[0].picture)" />
                            <div v-else class="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center">
                                <span class="text-base font-bold">{{ getInitials(group[0].name) }}</span>
                            </div>
                        </td>
                        <td class="align-center">{{ group[0].name }}</td>
                        <td class="text-center align-center">{{ group[0].position }}</td>
                        <td class="text-center align-center">
                            <span v-if="group[0].position === 'นักเรียน' || group[0].position === 'student'">{{ formatGradeClassroomDisplay(group[0].grade,
                                group[0].classroom) }}</span>
                            <span v-else>{{ group[0].department || '-' }}</span>
                        </td>
                        <td class="text-center">{{ formatDate(group[0].missed_date) }}</td>
                        <td class="text-center">
                            <button class="btn btn-xs btn-outline btn-info" @click="openDetail(group[0])">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" class="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </td>
                    </tr>
                    <tr v-for="item in group.slice(1)" :key="item._id + '-' + item.missed_date" class="hover">
                        <td></td>
                        <td class="text-center"></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td class="text-center">{{ formatDate(item.missed_date) }}</td>
                        <td></td>
                    </tr>
                </template>
            </tbody>
        </table>
    </div>

    <div class="lg:hidden space-y-4">
        <div v-if="flattenedData.length === 0"
            class="text-center py-8 text-base-content/60 bg-base-100 rounded-lg shadow-lg">
            {{ $t('ReportMissedTable.noData') }}
        </div>
        <div v-for="(group, groupIndex) in groupedData" :key="group[0]._id + '-mobile-group'"
            class="bg-base-100 rounded-lg shadow-lg p-4 space-y-3">
            <div class="flex items-start gap-3">
                <img v-if="group[0].picture" :src="`${imgProBaseUrl}${group[0].picture}`" alt="profile"
                    class="w-10 h-10 rounded-full object-cover cursor-pointer" @click="viewImage(group[0].picture)" />
                <div v-else class="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center">
                    <span class="text-base font-bold">{{ getInitials(group[0].name) }}</span>
                </div>
                <div class="flex-1">
                    <div class="flex gap-1">
                <div class="badge badge-neutral badge-sm mb-2">#{{ ((pagination?.page || 1) - 1) * (pagination?.limit || 10) + groupIndex + 1 }}</div>
                <div class="badge badge-primary badge-sm mb-2">{{ group[0].userid }}</div>
            </div>
                    <h3 class="font-bold text-md">{{ group[0].name }}</h3>
                    <p class="text-sm text-base-content/70">{{ group[0].position }}</p>
                </div>
            </div>

            <div class="divider my-2"></div>

            <div class="text-sm">
                <span class="text-base-content/60" v-if="group[0].position === 'นักเรียน' || group[0].position === 'student'">{{ $t('ReportMissedTable.class') }}</span>
                <span class="text-base-content/60" v-else>{{ $t('ReportMissedTable.dept') }}</span>
                <p class="font-medium inline ml-2" v-if="group[0].position === 'นักเรียน' || group[0].position === 'student'">{{
                    formatGradeClassroomDisplay(group[0].grade, group[0].classroom) }}</p>
                <p class="font-medium inline ml-2" v-else>{{ group[0].department || '-' }}</p>
            </div>

            <div class="divider my-2"></div>

            <div class="text-sm">
                <span class="text-base-content/60">{{ $t('ReportMissedTable.missedDateLabel') }}</span>
                <div class="space-y-1 mt-2">
                    <div v-for="item in group" :key="item._id + '-mobile-date-' + item.missed_date" class="font-medium">
                        {{ formatDate(item.missed_date) }}
                    </div>
                </div>
            </div>

            <div class="flex justify-end mt-2">
                <button class="btn btn-xs btn-outline btn-info" @click="openDetail(group[0])">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <div v-if="pagination.total_pages > 1" class="flex justify-center mt-6">
        <div class="join shadow-lg">
            <button @click="$emit('page-change', 1)" class="join-item btn btn-sm" :disabled="pagination.page === 1">
                ‹
            </button>

            <button v-for="page in visiblePages" :key="page" @click="$emit('page-change', page)"
                :class="['join-item btn btn-sm', page === pagination.page ? 'btn-active' : '']">
                {{ page }}
            </button>

            <button @click="$emit('page-change', pagination.total_pages)" class="join-item btn btn-sm"
                :disabled="pagination.page === pagination.total_pages">
                ›
            </button>
        </div>
    </div>

    <div v-if="pagination.total_items > 0" class="text-center text-sm text-base-content/60 mt-4"
        :class="summaryTextColor">
        {{ $t('ReportMissedTable.summaryTotal', { total: pagination.total_items, page: pagination.page, totalPages: pagination.total_pages }) }}
    </div>

    <dialog ref="imageModal" class="modal">
        <div class="modal-box max-w-7xl w-full p-0">
            <form method="dialog">
                <button
                    class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10 bg-white/80 hover:bg-white">✕</button>
            </form>
            <img v-if="selectedImage" :src="`${imgProBaseUrl}${selectedImage}`" alt="profile image"
                class="w-full h-auto max-h-[90vh] object-contain" />
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
    <MissedTableDetail v-if="selectedStudent" ref="detailRef" :student="selectedStudent" :role="role"
        @close="showDetail = false" />
</template>

<script setup>
import { ref, computed, getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, WidthType, BorderStyle, ImageRun } from 'docx'
import { saveAs } from 'file-saver'
import reportApi from '../../api/report.js'
import ExcelJS from 'exceljs'
import MissedTableDetail from './MissedTableDetail.vue'
import { formatGradeClassroomDisplay, mapGradeDisplay } from '../../utils/gradeSystem'

const { t, locale } = useI18n()
const loadingExportDoc = ref(false)
const loadingExport = ref(false)
const props = defineProps({
    data: {
        type: Array,
        required: true,
    },
    pagination: {
        type: Object,
        required: true
    },
    dateRange: {
        type: Object,
        required: true
    },
    role: {
        type: String,
        required: false,
        default: 'student'
    },
    grade: {
        type: [String, Number],
        required: false,
        default: undefined
    },
    classroom: {
        type: [String, Number],
        required: false,
        default: undefined
    },
    hideExport: {
        type: Boolean,
        required: false,
        default: false
    },
    summaryTextColor: {
        type: String,
        default: 'text-white'
    },
    disableLocalDetail: {
        type: Boolean,
        default: false
    }
})

const groupedData = computed(() => {
    const groups = {};
    flattenedData.value.forEach(item => {
        if (!groups[item._id]) groups[item._id] = [];
        groups[item._id].push(item);
    });
    return Object.values(groups);
});

const flattenedData = computed(() => {
    if (!props.data) return [];
    const arr = [];
    props.data.forEach(item => {
        if (Array.isArray(item.missed_date) && item.missed_date.length > 0) {
            item.missed_date.forEach(date => {
                arr.push({ ...item, missed_date: date });
            });
        } else {
            arr.push({ ...item, missed_date: null });
        }
    });
    return arr;
});

const selectedStudent = ref(null)
const showDetail = ref(false)
const detailRef = ref(null)

function openDetail(student) {
    const instance = getCurrentInstance()
    const hasParentHandler = !!(instance?.vnode.props && (
        instance.vnode.props['onShow-detail'] || instance.vnode.props['onShowDetail']
    ))
    emit('show-detail', { student, role: props.role })
    if (!hasParentHandler && !props.disableLocalDetail) {
        selectedStudent.value = student
        showDetail.value = true
        detailRef.value?.openModal(student, props.role)
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const dateLocale = locale.value === 'th' ? 'th-TH-u-ca-buddhist' : 'en-US';
    return date.toLocaleDateString(dateLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

const emit = defineEmits(['page-change', 'show-detail'])

const imgProBaseUrl = import.meta.env.VITE_IMG_PROFILE_URL

const imageModal = ref(null)
const selectedImage = ref(null)

const MAX_VISIBLE_PAGES = 3

const visiblePages = computed(() => {
    const current = props.pagination.page
    const total = props.pagination.total_pages
    const maxPagesToShow = MAX_VISIBLE_PAGES

    if (total <= 1) {
        return []
    }

    if (total <= maxPagesToShow) {
        const pages = []
        for (let i = 1; i <= total; i++) {
            pages.push(i)
        }
        return pages
    }

    let startPage = current - Math.floor(maxPagesToShow / 2)
    let endPage = current + Math.floor(maxPagesToShow / 2)

    if (startPage < 1) {
        startPage = 1
        endPage = Math.min(total, maxPagesToShow)
    }

    if (endPage > total) {
        endPage = total
        startPage = Math.max(1, total - maxPagesToShow + 1)
    }

    const pages = []
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
    }

    return pages
})

const viewImage = (image) => {
    selectedImage.value = image
    imageModal.value?.showModal()
}

const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 3) {
        return (parts[1][0] || '') + (parts[2][0] || '')
    }
    if (parts.length === 2) {
        return (parts[0][0] || '') + (parts[1][0] || '')
    }
    return parts[0][0] || '?'
}

async function exportMissedToExcel() {
    if (loadingExport.value) return;
    loadingExport.value = true;
    try {
        const params = {
            start: props.dateRange?.start,
            end: props.dateRange?.end,
            role: props.role,
            page: 1,
            limit: 50,
        };
        if (props.grade !== undefined && props.grade !== null && props.grade !== '') params.grade = props.grade;
        if (props.classroom !== undefined && props.classroom !== null && props.classroom !== '') params.classroom = props.classroom;
        let allData = [];
        let totalPages = 1;
        do {
            const res = await reportApi.getMissedReport(params);
            if (res && res.data) {
                allData = allData.concat(res.data);
                totalPages = res.total_pages || 1;
                params.page++;
            } else {
                break;
            }
        } while (params.page <= totalPages);

        const labelCode = t('ReportMissedTable.code');
        const labelName = t('ReportMissedTable.fullName');
        const labelPos = t('ReportMissedTable.position');
        const labelClassDept = t('ReportMissedTable.classOrDept');
        const labelMissedDate = t('ReportMissedTable.missedDate');

        const rows = [];
        allData.forEach(item => {
            if (Array.isArray(item.missed_date) && item.missed_date.length > 0) {
                item.missed_date.forEach(date => {
                    rows.push({
                        [labelCode]: item.userid,
                        [labelName]: item.name,
                        [labelPos]: item.position,
                        [labelClassDept]: (item.position === 'นักเรียน' || item.position === 'student')
                            ? formatGradeClassroomDisplay(item.grade, item.classroom)
                            : (item.department || '-'),
                        [labelMissedDate]: formatDate(date),
                    });
                });
            } else {
                rows.push({
                    [labelCode]: item.userid,
                    [labelName]: item.name,
                    [labelPos]: item.position,
                    [labelClassDept]: (item.position === 'นักเรียน' || item.position === 'student')
                        ? formatGradeClassroomDisplay(item.grade, item.classroom)
                        : (item.department || '-'),
                    [labelMissedDate]: '-',
                });
            }
        });

        let filteredRows = rows;
        if (props.role === 'student') {
            if (props.grade !== undefined && props.grade !== null && props.grade !== '') {
                filteredRows = filteredRows.filter(item => String(item[labelClassDept]).startsWith(String(mapGradeDisplay(props.grade) + '/')));
            }
            if (props.classroom !== undefined && props.classroom !== null && props.classroom !== '') {
                filteredRows = filteredRows.filter(item => String(item[labelClassDept]).endsWith('/' + String(props.classroom)));
            }
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('MissedDetail');

        let reportRange = '';
        if (props.dateRange && props.dateRange.start && props.dateRange.end) {
            reportRange = `(${formatDate(props.dateRange.start)} - ${formatDate(props.dateRange.end)})`;
        }
        worksheet.addRow([t('ReportMissedTable.excelTitle', { range: reportRange })]);
        worksheet.mergeCells('A1:E1');
        worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getCell('A1').font = { bold: true };

        const header = [labelCode, labelName, labelPos, labelClassDept, labelMissedDate];
        worksheet.addRow(header);

        filteredRows.forEach(row => {
            worksheet.addRow(header.map(h => row[h]));
        });

        worksheet.columns = [
            { width: 10 },
            { width: 40 },
            { width: 20 },
            { width: 40 },
            { width: 15 },
        ];
        worksheet.getRow(2).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getColumn(1).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(2).font = { bold: true };

        const buffer = await workbook.xlsx.writeBuffer();
        const fileName = t('ReportMissedTable.excelFileName', {
            start: props.dateRange?.start || '',
            end: props.dateRange?.end || ''
        });
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), fileName);
    } catch (e) {
        alert(t('ReportMissedTable.exportExcelError'));
        console.error(e);
    } finally {
        loadingExport.value = false;
    }
}

async function exportDocxLeaveReport() {
    if (loadingExportDoc.value) return
    loadingExportDoc.value = true
    try {
        let pictureBuffer = null;
        try {
            const res = await fetch('/brand.jpg');
            if (res.ok) pictureBuffer = await res.arrayBuffer();
        } catch (e) { pictureBuffer = null; }

        const [stats, missed] = await Promise.all([
            reportApi.getDailyStats(props.dateRange.start, props.dateRange.start),
            reportApi.getMissedReport({ start: props.dateRange.start, end: props.dateRange.start, role: 'teacher', classroom: 0 }),
        ]);
        const totalTeachers = stats?.data?.total_teachers || 0;
        const notCheckOut = missed?.data?.length || 0;

        const font = { name: 'TH SarabunPSK' };
        const leaveTable = new Table({
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({
                                children: [new TextRun({ text: t('ReportMissedTable.wordTeacherTotal', { total: totalTeachers }), font, size: 32 })],
                            })],
                            columnSpan: 3,
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                        })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({
                                children: [new TextRun({ text: t('ReportMissedTable.wordNotCheckOut', { total: notCheckOut }), font, size: 32 })],
                            })],
                            columnSpan: 3,
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                        })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: t('ReportMissedTable.wordNotCheckOutLabel'), font, size: 32 })], alignment: AlignmentType.CENTER })],
                            verticalAlign: 'center',
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                        }),
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: t('ReportMissedTable.wordCivilServant', { total: notCheckOut }), font, size: 32 })], alignment: AlignmentType.CENTER })],
                            verticalAlign: 'center',
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                        }),
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: '', font, size: 32 })] })],
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                        })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: t('ReportMissedTable.wordPermissionOut'), font, size: 32 })], alignment: AlignmentType.CENTER })],
                            rowSpan: 2,
                            verticalAlign: 'center',
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                        }),
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: t('ReportMissedTable.wordNotReturned', { total: notCheckOut }), font, size: 32 })], alignment: AlignmentType.CENTER })],
                            verticalAlign: 'center',
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                        }),
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: '', font, size: 32 })], alignment: AlignmentType.CENTER })],
                            verticalAlign: 'center',
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                        })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: t('ReportMissedTable.wordReturned', { total: totalTeachers - notCheckOut }), font, size: 32 })], alignment: AlignmentType.CENTER })],
                            rowSpan: 2,
                            verticalAlign: 'center',
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                        }),
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text: '', font, size: 32 })], alignment: AlignmentType.CENTER })],
                            verticalAlign: 'center',
                            borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                        }),
                    ]
                })
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: 'fixed',
            margins: { top: 113, bottom: 113, left: 113, right: 113 },
            columnWidths: [1650, 1800, 6000],
        });

        const formattedDate = props.dateRange ? formatDateTHFull(props.dateRange.start) : '';

        const doc = new Document({
            styles: {
                default: {
                    document: {
                        run: font
                    }
                }
            },
            sections: [{
                properties: {},
                children: [
                    new Table({
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [
                                            new Paragraph({
                                                children: pictureBuffer ? [
                                                    new ImageRun({ data: pictureBuffer, transformation: { width: 100, height: 100 } })
                                                ] : [new TextRun({ text: '', font })]
                                            })
                                        ],
                                        width: { size: 15, type: WidthType.PERCENTAGE },
                                        height: { value: 500, rule: 'atLeast' },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: t('ReportMissedTable.wordDocTitle'), font, bold: true, size: 48 })], alignment: AlignmentType.CENTER })],
                                        columnSpan: 3,
                                        width: { size: 85, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    })
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'ส่วนราชการ', font, bold: true, size: 32 })] })],
                                        width: { size: 15, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: t('ReportMissedTable.wordDepartment'), font, size: 32 })] })],
                                        columnSpan: 3,
                                        width: { size: 85, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    })
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'ที่', font, bold: true, size: 32 })] })],
                                        width: { size: 15, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: '.....................................', font, size: 32 })] })],
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'วันที่', font, bold: true, size: 32 })] })],
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: '.....................................', font, size: 32 })] })],
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }),
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'เรื่อง', font, bold: true, size: 32 })] })],
                                        width: { size: 15, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: t('ReportMissedTable.wordSubject'), font, size: 32 })] })],
                                        columnSpan: 3,
                                        width: { size: 85, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    })
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: 'เรียน', font, bold: true, size: 32 })] })],
                                        width: { size: 15, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: t('ReportMissedTable.wordTo'), font, size: 32 })] })],
                                        columnSpan: 3,
                                        width: { size: 85, type: WidthType.PERCENTAGE },
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    })
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [new TextRun({ text: `  ${t('ReportMissedTable.wordBody', { date: formattedDate })}`, font, size: 32 })],
                                        })],
                                        columnSpan: 4,
                                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                    }),
                                ]
                            })
                        ],
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        margins: { top: 113, bottom: 113, left: 113, right: 113 },
                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } }
                    }),
                    new Paragraph({ text: '', spacing: { after: 200 } }),
                    leaveTable,
                    new Paragraph({ text: '', spacing: { after: 200 } }),
                    new Paragraph({ children: [new TextRun({ text: `   ${t('ReportMissedTable.wordRespectfully')}`, font, size: 32 })] }),
                    new Paragraph({ text: '', spacing: { after: 200 } }),
                    new Paragraph({ children: [new TextRun({ text: '(.............................................)', font, size: 32 })], alignment: AlignmentType.RIGHT }),
                    new Paragraph({ children: [new TextRun({ text: t('ReportMissedTable.wordRecorder'), font, size: 32 })], alignment: AlignmentType.RIGHT }),
                    new Paragraph({ text: '', spacing: { after: 200 } }),
                    new Paragraph({ children: [new TextRun({ text: '(.............................................)', font, size: 32 })], alignment: AlignmentType.RIGHT }),
                    new Paragraph({ children: [new TextRun({ text: t('ReportMissedTable.wordDirector'), font, size: 32 })], alignment: AlignmentType.RIGHT }),
                ]
            }]
        });
        const blob = await Packer.toBlob(doc)
        const docFileName = t('ReportMissedTable.wordFileName', { date: new Date().toISOString().slice(0, 10) });
        saveAs(blob, docFileName)
    } catch (e) {
        alert(t('ReportMissedTable.exportWordError'))
        console.error(e)
    } finally {
        loadingExportDoc.value = false
    }
}

function formatDateTHFull(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const months = locale.value === 'th' ? [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ] : [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = locale.value === 'th' ? d.getFullYear() + 543 : d.getFullYear();
    return locale.value === 'th' ? `${day} ${month} พ.ศ.${year}` : `${month} ${day}, ${year}`;
}
</script>

<style scoped></style>