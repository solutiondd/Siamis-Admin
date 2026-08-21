<template>
    <div class="w-full space-y-6 max-[944px]:pt-16">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center text-white gap-2">
            <h2 class="text-lg md:text-3xl font-bold">{{ $t('LeaveReq.title') }}</h2>
            <div class="flex flex-row gap-2 items-stretch md:items-center justify-end md:justify-center">
                <input v-model="filters.start_date" type="date" :max="today"
                    class="text-sm px-2 py-1 bg-white border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary rounded shadow-sm text-base-content" />
                <span>-</span>
                <input v-model="filters.end_date" type="date" :max="today"
                    class="text-sm px-2 py-1 bg-white border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary rounded shadow-sm text-base-content" />
            </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">{{ $t('LeaveReq.searchLabel') }}</span>
                    </label>
                    <input v-model="filters.search" type="text" :placeholder="$t('LeaveReq.searchPlaceholder')"
                        class="input input-sm input-bordered w-full" />
                </div>

                <div class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">{{ $t('LeaveReq.statusLabel') }}</span>
                    </label>
                    <select v-model="filters.status" class="select select-sm select-bordered w-full">
                        <option value="">{{ $t('LeaveReq.allStatus') }}</option>
                        <option value="pending">{{ $t('LeaveReq.statusPending') }}</option>
                        <option value="approved">{{ $t('LeaveReq.statusApproved') }}</option>
                        <option value="rejected">{{ $t('LeaveReq.statusRejected') }}</option>
                        <option value="cancelled">{{ $t('LeaveReq.statusCancelled') }}</option>
                    </select>
                </div>

                <div v-if="residentRole !== 'teacher'" class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">{{ $t('LeaveReq.grade') }}</span>
                    </label>
                    <select v-model="filters.grade" @change="handleGradeChange" class="select select-sm select-bordered w-full"
                        :disabled="filters.role === 'teacher'">
                        <option value="">{{ $t('LeaveReq.allGrades') }}</option>
                        <option v-for="grade in allGrades" :key="grade" :value="grade">
                            {{ mapGradeDisplay(grade) }}
                        </option>
                    </select>
                </div>

                <div v-if="residentRole !== 'teacher'" class="form-control">
                    <label class="label py-1">
                        <span class="label-text text-sm font-medium">{{ $t('LeaveReq.classroom') }}</span>
                    </label>
                    <select v-model="filters.classroom" class="select select-sm select-bordered w-full"
                        :disabled="filters.role === 'teacher'">
                        <option value="">{{ $t('LeaveReq.allClassrooms') }}</option>
                        <option v-for="room in availableClassrooms" :key="room" :value="room">
                            {{ room }}
                        </option>
                    </select>
                </div>

                <div v-if="residentRole === 'teacher'" class="form-control flex justify-end items-center md:items-end">
                    <div
                        class="p-1 text-white bg-primary rounded-md text-center min-w-[120px] flex flex-col items-center">
                        <span class="label-text text-sm font-medium mb-1 text-secondary">{{ $t('LeaveReq.gradeClassroomBadge') }}</span>
                        <span>{{ mapGradeDisplay(teacherGrade) }}/{{ teacherClassroom }}</span>
                    </div>
                </div>

            </div>
        </div>

        <div class="w-full max-w-full overflow-hidden">
            <LeaveRequest :filters="filters" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import LeaveRequest from '../../../components/Report/LeaveRequest.vue';
import { ClassRoomService } from '../../../api/class-room.js';
import { mapGradeDisplay, toVisibleSortedGrades } from '../../../utils/gradeSystem';

const today = new Date().toISOString().split('T')[0];
const residentRole = localStorage.getItem('residentRole') || '';
const teacherGrade = localStorage.getItem('grade') || '';
const teacherClassroom = localStorage.getItem('classroom') || '';

const classRoomService = new ClassRoomService();
const allClassRooms = ref([]);
const allGrades = ref([]);

const filters = ref({
    search: '',
    start_date: today,
    end_date: today,
    status: 'approved',
    role: '',
    grade: '',
    classroom: '',
});

const availableClassrooms = computed(() => {
    if (!filters.value.grade || !allClassRooms.value || allClassRooms.value.length === 0) {
        const roomsSet = new Set();
        allClassRooms.value.forEach(item => {
            if (item?.classroom) roomsSet.add(String(item.classroom));
        });
        return Array.from(roomsSet).sort((a, b) => a - b);
    }
    const filtered = allClassRooms.value.filter(c => String(c.grade) === String(filters.value.grade));
    const classNums = [...new Set(filtered.map(c => String(c.classroom)))];
    return classNums.sort((a, b) => a - b);
});

const handleGradeChange = () => {
    filters.value.classroom = '';
};

watch(
    () => filters.value.role,
    (role) => {
        if (role === 'teacher') {
            filters.value.grade = '';
            filters.value.classroom = '';
        }
    }
);

onMounted(async () => {
    if (residentRole === 'teacher') {
        filters.value.grade = teacherGrade;
        filters.value.classroom = teacherClassroom;
        return;
    }

    try {
        const res = await classRoomService.getClassRooms();
        allClassRooms.value = Array.isArray(res?.data) ? res.data : [];
        const gradesSet = new Set();

        allClassRooms.value.forEach((item) => {
            if (item?.grade) gradesSet.add(item.grade);
        });

        allGrades.value = toVisibleSortedGrades(Array.from(gradesSet));
    } catch (error) {
        console.error('Error fetching class rooms:', error);
    }
});
</script>