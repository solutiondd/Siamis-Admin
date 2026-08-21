<template>
    <div class="w-full space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
                <label class="text-sm text-gray-700">{{ $t('checkNameTable.items') }}</label>
                <select v-model.number="pageSize" class="select select-sm select-bordered w-18"
                    @change="handlePageSizeChange">
                    <option :value="10">10</option>
                    <option :value="20">20</option>
                    <option :value="30">30</option>
                    <option :value="50">50</option>
                </select>
                <span class="text-sm text-gray-700">{{ $t('checkNameTable.perPage') }}</span>
            </div>
            <div class="flex items-center gap-2">
                <button type="button" class="btn btn-sm btn-ghost text-error" :disabled="draftCount === 0 || autoSaving"
                    @click="clearAllDraftChanges" :title="$t('checkNameTable.clearAll')">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>

                <button type="button" class="btn btn-primary btn-sm" :disabled="draftCount === 0 || autoSaving"
                    @click="saveAllDraftChanges" :title="$t('checkNameTable.saveAll')">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                </button>
            </div>
        </div>

        <div v-if="loading" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg"></span>
        </div>

        <div v-else>
            <table class="table table-zebra w-full text-xs sm:text-[10px] xl:text-sm">
                <thead>
                    <tr class="bg-gray-100">
                        <th>{{ $t('checkNameTable.code') }}</th>
                        <th>{{ $t('checkNameTable.name') }}</th>
                        <th class="w-40 max-[444px]:w-28 text-center">{{ $t('checkNameTable.status') }}</th>
                        <th class="w-48 max-[444px]:hidden">{{ $t('checkNameTable.remark') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="student in paginatedStudents" :key="student._id" class="hover">
                        <td class="text-xs sm:text-[10px] xl:text-sm">{{ student.userid }}</td>
                        <td>
                            <div class="flex items-center gap-3">
                                <div class="font-semibold text-xs sm:text-[10px] xl:text-sm">
                                    <span v-if="student.name">{{ student.name }}</span>
                                    <span v-else>{{ [student.pre_name, student.first_name,
                                    student.last_name].filter(Boolean).join(' ') }}</span>
                                </div>
                            </div>
                        </td>
                        <td class="text-center align-middle max-[444px]:px-1">
                            <div v-if="isDraftChange(student._id)" class="dropdown dropdown-center">
                                <button type="button" tabindex="0"
                                    class="btn btn-sm max-[444px]:btn-xs btn-ghost w-full justify-center border-0 shadow-none bg-transparent hover:bg-base-200 max-[444px]:min-h-7 max-[444px]:h-7 max-[444px]:px-1">
                                    <span :class="['badge max-[444px]:badge-xs', getDraftBadgeClass(student._id)]">
                                        {{ getDraftLabel(student._id) }}
                                    </span>
                                </button>
                                <ul tabindex="0"
                                    class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-[444px]:w-36 max-[444px]:right-0 max-[444px]:left-auto">
                                    <li>
                                        <button type="button" :disabled="autoSaving"
                                            class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="markPresent(student._id)">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-success"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            {{ $t('checkNameTable.present') }}
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" :disabled="autoSaving"
                                            class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="markLate(student._id)">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-black"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            {{ $t('checkNameTable.late') }}
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" :disabled="autoSaving"
                                            class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="openLeaveModal(student._id, 'draft-edit')">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-warning"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                                </path>
                                            </svg>
                                            {{ $t('checkNameTable.leave') }}
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" :disabled="autoSaving"
                                            class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="openActivityModal(student._id, 'draft-edit')">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-info"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M9 5l7 7-7 7"></path>
                                            </svg>
                                            {{ $t('checkNameTable.activity') }}
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" :disabled="autoSaving"
                                            class="max-[444px]:text-xs max-[444px]:px-2 text-error"
                                            @click.stop.prevent="removeDraftChange(student._id)">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5" fill="none"
                                                stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                            {{ $t('checkNameTable.cancelSelected') }}
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div v-else-if="localPendingLeaveApprovals[student._id]"
                                class="flex flex-col items-center gap-1">
                                <div class="dropdown dropdown-center">
                                    <button type="button" tabindex="0"
                                        class="btn btn-sm max-[444px]:btn-xs btn-ghost w-full justify-center border-0 shadow-none bg-transparent hover:bg-base-200 max-[444px]:min-h-7 max-[444px]:h-7 max-[444px]:px-1">
                                        <span class="badge badge-warning gap-2 max-[444px]:badge-xs">
                                            {{ $t('checkNameTable.pendingApproval') }}
                                        </span>
                                    </button>
                                    <ul tabindex="0"
                                        class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-[444px]:w-36 max-[444px]:right-0 max-[444px]:left-auto">
                                        <li>
                                            <button type="button" :disabled="autoSaving"
                                                class="max-[444px]:text-xs max-[444px]:px-2"
                                                @click.stop.prevent="approveLeave(student._id)">
                                                <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-success"
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2" d="M5 13l4 4L19 7"></path>
                                                </svg>
                                                {{ $t('checkNameTable.approve') }}
                                            </button>
                                        </li>
                                        <li>
                                            <button type="button" :disabled="autoSaving"
                                                class="max-[444px]:text-xs max-[444px]:px-2"
                                                @click.stop.prevent="rejectLeave(student._id)">
                                                <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-error"
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                                </svg>
                                                {{ $t('checkNameTable.reject') }}
                                            </button>
                                        </li>
                                        <li>
                                            <button type="button" :disabled="autoSaving"
                                                class="max-[444px]:text-xs max-[444px]:px-2"
                                                @click.stop.prevent="cancelLeave(student._id)">
                                                <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-warning"
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                                </svg>
                                                {{ $t('checkNameTable.cancel') }}
                                            </button>
                                        </li>
                                        <li v-if="canEditLeave">
                                            <button type="button" :disabled="autoSaving"
                                                class="max-[444px]:text-xs max-[444px]:px-2"
                                                @click.stop.prevent="editLeave(student._id)">
                                                <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-info"
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.41-9.41a2 2 0 112.82 2.82L11 16l-4 1 1-4 9.59-9.59z">
                                                    </path>
                                                </svg>
                                                {{ $t('checkNameTable.edit') }}
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                                <div v-if="getPendingActivity(student._id)" class="dropdown dropdown-center">
                                    <button type="button" tabindex="0"
                                        class="btn btn-xs btn-ghost border-0 shadow-none bg-transparent hover:bg-base-200 px-1.5 min-h-6 h-6">
                                        <span class="badge badge-info max-[444px]:badge-xs">
                                            {{ $t('checkNameTable.activity') }}
                                        </span>
                                    </button>
                                    <ul tabindex="0"
                                        class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-[444px]:w-36 max-[444px]:right-0 max-[444px]:left-auto">
                                        <li>
                                            <button type="button" :disabled="autoSaving"
                                                class="max-[444px]:text-xs max-[444px]:px-2"
                                                @click.stop.prevent="editPendingActivity(student._id)">
                                                <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-info"
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.41-9.41a2 2 0 112.82 2.82L11 16l-4 1 1-4 9.59-9.59z">
                                                    </path>
                                                </svg>
                                                {{ $t('checkNameTable.editActivity') }}
                                            </button>
                                        </li>
                                        <li>
                                            <button type="button" :disabled="autoSaving"
                                                class="max-[444px]:text-xs max-[444px]:px-2"
                                                @click.stop.prevent="deletePendingActivity(student._id)">
                                                <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-error"
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16">
                                                    </path>
                                                </svg>
                                                {{ $t('checkNameTable.deleteActivity') }}
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <span v-else-if="localAttendanceData[student._id]?.status === 'present'"
                                class="badge badge-success gap-2 max-[444px]:badge-xs">
                                {{ $t('checkNameTable.presentShort') }}
                            </span>
                            <span v-else-if="localAttendanceData[student._id]?.status === 'late'"
                                class="badge bg-black text-white border-black gap-2 max-[444px]:badge-xs">
                                {{ $t('checkNameTable.late') }}
                            </span>
                            <div v-else-if="localAttendanceData[student._id]?.status === 'leave'"
                                class="dropdown dropdown-center">
                                <button type="button" tabindex="0"
                                    class="btn btn-sm max-[444px]:btn-xs btn-ghost w-full justify-center border-0 shadow-none bg-transparent hover:bg-base-200 max-[444px]:min-h-7 max-[444px]:h-7 max-[444px]:px-1">
                                    <span class="badge badge-warning max-[444px]:badge-xs">
                                        {{ $t('checkNameTable.leave') }}
                                    </span>
                                </button>
                                <ul tabindex="0"
                                    class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-[444px]:w-36 max-[444px]:right-0 max-[444px]:left-auto">
                                    <li v-if="canEditLeave">
                                        <button type="button" :disabled="autoSaving"
                                            class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="editLeave(student._id)">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-info"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.41-9.41a2 2 0 112.82 2.82L11 16l-4 1 1-4 9.59-9.59z">
                                                </path>
                                            </svg>
                                            {{ $t('checkNameTable.edit') }}
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" :disabled="autoSaving"
                                            class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="deleteLeave(student._id)">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-error"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16">
                                                </path>
                                            </svg>
                                            {{ $t('checkNameTable.delete') }}
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div v-else-if="localAttendanceData[student._id]?.status === 'activity'"
                                class="dropdown dropdown-center">
                                <button type="button" tabindex="0"
                                    class="btn btn-sm max-[444px]:btn-xs btn-ghost w-full justify-center border-0 shadow-none bg-transparent hover:bg-base-200 max-[444px]:min-h-7 max-[444px]:h-7 max-[444px]:px-1">
                                    <span class="badge badge-info max-[444px]:badge-xs">
                                        {{ $t('checkNameTable.activity') }}
                                    </span>
                                </button>
                                <ul tabindex="0"
                                    class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-[444px]:w-36 max-[444px]:right-0 max-[444px]:left-auto">
                                    <li>
                                        <button type="button" :disabled="autoSaving"
                                            class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="editActivity(student._id)">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-info"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.41-9.41a2 2 0 112.82 2.82L11 16l-4 1 1-4 9.59-9.59z">
                                                </path>
                                            </svg>
                                            {{ $t('checkNameTable.edit') }}
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" :disabled="autoSaving"
                                            class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="deleteActivity(student._id)">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-error"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16">
                                                </path>
                                            </svg>
                                            {{ $t('checkNameTable.delete') }}
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div v-else class="dropdown dropdown-center">
                                <button type="button" tabindex="0"
                                    class="btn btn-sm max-[444px]:btn-xs btn-ghost w-full justify-center border-0 shadow-none bg-transparent hover:bg-base-200 max-[444px]:min-h-7 max-[444px]:h-7 max-[444px]:px-1">
                                    <span v-if="displayAttendanceStatus(student._id) === 'absent'"
                                        class="inline-flex items-center justify-center rounded-full bg-error px-3 py-1 text-xs font-medium leading-none text-error-content whitespace-nowrap max-[444px]:px-2 max-[444px]:py-0.5 max-[444px]:text-[10px]">
                                        {{ $t('checkNameTable.notScanned') }}
                                    </span>
                                    <span v-else class="badge badge-ghost max-[444px]:badge-xs">
                                        {{ $t('checkNameTable.empty') }}
                                    </span>
                                </button>
                                <ul tabindex="0"
                                    class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-[444px]:w-36 max-[444px]:right-0 max-[444px]:left-auto">
                                    <li>
                                        <button type="button" class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="markPresent(student._id)">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-success"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            {{ $t('checkNameTable.present') }}
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="markLate(student._id)">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-black"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            {{ $t('checkNameTable.late') }}
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="openLeaveModal(student._id)">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-warning"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                                </path>
                                            </svg>
                                            {{ $t('checkNameTable.leave') }}
                                        </button>
                                    </li>
                                    <li>
                                        <button type="button" class="max-[444px]:text-xs max-[444px]:px-2"
                                            @click.stop.prevent="openActivityModal(student._id)">
                                            <svg class="w-4 h-4 max-[444px]:w-3.5 max-[444px]:h-3.5 text-info"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M9 5l7 7-7 7"></path>
                                            </svg>
                                            {{ $t('checkNameTable.activity') }}
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </td>
                        <td class="text-xs sm:text-[10px] xl:text-sm max-[444px]:hidden">
                            <div v-if="localAttendanceData[student._id]?.status === 'leave'" class="text-warning">
                                <span class="font-medium">{{ formatLeaveTypeName(localAttendanceData[student._id]?.leaveType) }}</span>
                                <div v-if="localAttendanceData[student._id]?.remark"
                                    class="text-xs sm:text-[10px] xl:text-sm text-base-content mt-1">
                                    {{ localAttendanceData[student._id]?.remark }}
                                </div>
                            </div>
                            <div v-else-if="localAttendanceData[student._id]?.status === 'activity'" class="text-info">
                                <span class="font-medium">{{ localAttendanceData[student._id]?.activityName ||
                                    $t('checkNameTable.hasActivity') }}</span>
                                <div v-if="localAttendanceData[student._id]?.location"
                                    class="text-xs sm:text-[10px] xl:text-sm text-base-content mt-1">
                                    {{ $t('checkNameTable.locationLabel') }} {{ localAttendanceData[student._id]?.location }}
                                </div>
                                <div v-if="localAttendanceData[student._id]?.remark"
                                    class="text-xs sm:text-[10px] xl:text-sm text-base-content mt-1">
                                    {{ localAttendanceData[student._id]?.remark }}
                                </div>
                            </div>
                            <div v-else-if="localAttendanceData[student._id]?.remark">
                                {{ localAttendanceData[student._id]?.remark }}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="totalPages > 1" class="flex flex-col items-center gap-2">
            <div class="flex justify-center gap-2">
                <div class="join shadow-lg">
                    <button @click="currentPage = 1" class="join-item btn btn-sm" :disabled="currentPage === 1">
                        ‹
                    </button>
                    <button v-for="page in visiblePages" :key="page" @click="currentPage = page"
                        :class="['join-item btn btn-sm', page === currentPage ? 'btn-active' : '']">
                        {{ page }}
                    </button>
                    <button @click="currentPage = totalPages" class="join-item btn btn-sm"
                        :disabled="currentPage === totalPages">
                        ›
                    </button>
                </div>
            </div>

            <div v-if="totalItems > 0" class="text-center text-sm text-gray-600">
                {{ $t('checkNameTable.totalItems', { total: totalItems, current: currentPage, totalPages: totalPages }) }}
            </div>
        </div>

        <!-- Modals การลา -->
        <dialog v-if="leaveModal.show" class="modal modal-open">
            <div class="modal-box w-[calc(100vw-1.5rem)] max-w-lg p-4 sm:p-6 overflow-x-hidden">
                <h3 class="font-bold text-lg mb-4">{{ $t('checkNameTable.recordLeave') }}</h3>

                <div class="form-control w-full mb-4">
                    <label class="label">
                        <span class="label-text">{{ $t('checkNameTable.leaveType') }}</span>
                    </label>
                    <select v-model="leaveModal.form.leaveType" class="select select-bordered">
                        <option value="" disabled>{{ $t('checkNameTable.selectLeaveType') }}</option>
                        <option v-for="type in allowedLeaveTypes" :key="type._id" :value="type._id">
                            {{ getLeaveTypeLabel(type) }}
                        </option>
                    </select>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">{{ $t('checkNameTable.leaveStartDate') }}</span>
                        </label>
                        <input type="date" v-model="leaveModal.form.leaveStartDate" class="input input-bordered" />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">{{ $t('checkNameTable.leaveEndDate') }}</span>
                        </label>
                        <input type="date" v-model="leaveModal.form.leaveEndDate" class="input input-bordered" />
                    </div>
                </div>

                <p class="text-sm text-gray-500 mb-4">
                    {{ $t('checkNameTable.leavePeriodText', {
                        start: formatThaiDate(leaveModal.form.leaveStartDate || selectedDate),
                        end: formatThaiDate(leaveModal.form.leaveEndDate || leaveModal.form.leaveStartDate || selectedDate)
                    }) }}
                </p>

                <div class="form-control w-full mb-4">
                    <label class="label">
                        <span class="label-text font-medium">{{ $t('checkNameTable.leaveTimeOption') }}</span>
                    </label>
                    <div class="flex flex-wrap gap-4 bg-base-200 p-3 rounded-lg">
                        <label class="label cursor-pointer justify-start gap-2">
                            <input type="radio" value="all_day" v-model="leaveModal.form.timeOption"
                                class="radio radio-primary radio-sm" />
                            <span class="label-text font-medium">{{ $t('checkNameTable.allDay') }}</span>
                        </label>
                        <label class="label cursor-pointer justify-start gap-2">
                            <input type="radio" value="morning" v-model="leaveModal.form.timeOption"
                                class="radio radio-primary radio-sm" />
                            <span class="label-text font-medium">{{ $t('checkNameTable.morning') }}</span>
                        </label>
                        <label class="label cursor-pointer justify-start gap-2">
                            <input type="radio" value="afternoon" v-model="leaveModal.form.timeOption"
                                class="radio radio-primary radio-sm" />
                            <span class="label-text font-medium">{{ $t('checkNameTable.afternoon') }}</span>
                        </label>
                    </div>
                    <div class="text-xs text-gray-500 mt-2 px-1">
                        <span v-if="leaveModal.form.timeOption === 'all_day'">{{ $t('checkNameTable.allDayDesc') }}</span>
                        <span v-else-if="leaveModal.form.timeOption === 'morning'">{{ $t('checkNameTable.morningDesc') }}</span>
                        <span v-else-if="leaveModal.form.timeOption === 'afternoon'">{{ $t('checkNameTable.afternoonDesc') }}</span>
                    </div>
                </div>

                <div class="form-control w-full mb-4">
                    <label class="label">
                        <span class="label-text">{{ $t('checkNameTable.details') }}</span>
                    </label>
                    <textarea v-model="leaveModal.form.reason" class="textarea textarea-bordered"
                        :placeholder="$t('checkNameTable.placeholderLeaveReason')" rows="3"></textarea>
                </div>

                <div class="modal-action">
                    <button class="btn" @click="closeLeaveModal">{{ $t('checkNameTable.cancel') }}</button>
                    <button class="btn btn-primary" :disabled="autoSaving" @click="createLeaveRequest">
                        {{ leaveModal.mode === 'edit' ? $t('checkNameTable.saveEdit') : $t('checkNameTable.confirm') }}
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop" @click="closeLeaveModal">
                <button>close</button>
            </form>
        </dialog>

        <!-- Modal กิจกรรม -->
        <dialog v-if="activityModal.show" class="modal modal-open">
            <div class="modal-box w-[calc(100vw-1.5rem)] max-w-lg p-4 sm:p-6 overflow-x-hidden">
                <h3 class="font-bold text-lg mb-4">
                    {{ activityModal.mode === 'edit' ? $t('checkNameTable.editActivity') : $t('checkNameTable.recordActivity') }}
                </h3>

                <div class="form-control w-full mb-4">
                    <label class="label">
                        <span class="label-text">{{ $t('checkNameTable.activityName') }}</span>
                    </label>
                    <input type="text" v-model="activityModal.form.activity_name" class="input input-bordered"
                        :placeholder="$t('checkNameTable.placeholderActivityName')" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">{{ $t('checkNameTable.activityStartDate') }}</span>
                        </label>
                        <input type="date" v-model="activityModal.form.activity_date_start"
                            class="input input-bordered" />
                    </div>
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text">{{ $t('checkNameTable.activityEndDate') }}</span>
                        </label>
                        <input type="date" v-model="activityModal.form.activity_date_end"
                            class="input input-bordered" />
                    </div>
                </div>

                <div class="form-control w-full mb-4">
                    <label class="label">
                        <span class="label-text font-medium">{{ $t('checkNameTable.activityTimeOption') }}</span>
                    </label>
                    <div class="flex flex-wrap gap-4 bg-base-200 p-3 rounded-lg">
                        <label class="label cursor-pointer justify-start gap-2">
                            <input type="radio" value="all_day" v-model="activityModal.form.timeOption"
                                class="radio radio-primary radio-sm" />
                            <span class="label-text font-medium">{{ $t('checkNameTable.allDay') }}</span>
                        </label>
                        <label class="label cursor-pointer justify-start gap-2">
                            <input type="radio" value="morning" v-model="activityModal.form.timeOption"
                                class="radio radio-primary radio-sm" />
                            <span class="label-text font-medium">{{ $t('checkNameTable.morning') }}</span>
                        </label>
                        <label class="label cursor-pointer justify-start gap-2">
                            <input type="radio" value="afternoon" v-model="activityModal.form.timeOption"
                                class="radio radio-primary radio-sm" />
                            <span class="label-text font-medium">{{ $t('checkNameTable.afternoon') }}</span>
                        </label>
                    </div>
                    <div class="text-xs text-gray-500 mt-2 px-1">
                        <span v-if="activityModal.form.timeOption === 'all_day'">{{ $t('checkNameTable.allDayDesc') }}</span>
                        <span v-else-if="activityModal.form.timeOption === 'morning'">{{ $t('checkNameTable.morningDesc') }}</span>
                        <span v-else-if="activityModal.form.timeOption === 'afternoon'">{{ $t('checkNameTable.afternoonDesc') }}</span>
                    </div>
                </div>

                <div class="form-control w-full mb-4">
                    <label class="label">
                        <span class="label-text">{{ $t('checkNameTable.location') }} <span class="text-gray-400 text-xs">{{ $t('checkNameTable.optional') }}</span></span>
                    </label>
                    <input type="text" v-model="activityModal.form.location" class="input input-bordered"
                        :placeholder="$t('checkNameTable.placeholderLocation')" />
                </div>

                <div class="form-control w-full mb-4">
                    <label class="label">
                        <span class="label-text">{{ $t('checkNameTable.remark') }} <span class="text-gray-400 text-xs">{{ $t('checkNameTable.optional') }}</span></span>
                    </label>
                    <textarea v-model="activityModal.form.remark" class="textarea textarea-bordered"
                        :placeholder="$t('checkNameTable.placeholderRemark')" rows="3"></textarea>
                </div>

                <div class="modal-action">
                    <button class="btn" @click="closeActivityModal">{{ $t('checkNameTable.cancel') }}</button>
                    <button class="btn btn-primary" :disabled="autoSaving" @click="createActivityRequest">
                        {{ activityModal.mode === 'edit' ? $t('checkNameTable.saveEdit') : $t('checkNameTable.confirm') }}
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop" @click="closeActivityModal">
                <button>close</button>
            </form>
        </dialog>

    </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { AllowanceService } from '../../api/allowance';
import { LeaveService } from '../../api/leave';
import { ActivityService } from '../../api/activity';
import featureFlags from '../../config/featureFlags';
import Swal from 'sweetalert2';

const { t } = useI18n();
const allowanceService = new AllowanceService();
const leaveService = new LeaveService();
const activityService = new ActivityService();

const props = defineProps({
    students: Array,
    selectedDate: String,
    selectedGrade: String,
    selectedClassroom: {
        type: [String, Number],
        default: '',
    },
    selectedDepartment: String,
    loading: Boolean,
    attendanceData: Object,
    pendingLeaveApprovals: Object,
    selectedRole: {
        type: String,
        default: 'student'
    },
});

const pageSize = ref(10);
const currentPage = ref(1);

const totalItems = computed(() => (props.students || []).length);

const totalPages = computed(() => Math.ceil((props.students?.length || 0) / pageSize.value));

const paginatedStudents = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return (props.students || []).slice(start, end);
});

const MAX_VISIBLE_PAGES = 3;
const visiblePages = computed(() => {
    const total = totalPages.value;
    if (total <= 1) return [];
    if (total <= MAX_VISIBLE_PAGES) {
        const pages = [];
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
        return pages;
    }
    let startPage = currentPage.value - Math.floor(MAX_VISIBLE_PAGES / 2);
    let endPage = currentPage.value + Math.floor(MAX_VISIBLE_PAGES / 2);
    if (startPage < 1) {
        startPage = 1;
        endPage = Math.min(total, MAX_VISIBLE_PAGES);
    }
    if (endPage > total) {
        endPage = total;
        startPage = Math.max(1, total - MAX_VISIBLE_PAGES + 1);
    }
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    return pages;
});

const handlePageSizeChange = () => {
    currentPage.value = 1;
};

const emit = defineEmits(['update:attendanceData', 'update:pendingLeaveApprovals', 'request:reload']);

const imgBaseUrl = ref(import.meta.env.VITE_APP_IMG_URL);
const autoSaving = ref(false);
const localAttendanceData = ref({});
const localPendingLeaveApprovals = ref({});
const leaveTypes = ref([]);
const allowanceSetting = ref(null);
const draftChanges = ref({});

const DRAFT_STORAGE_PREFIX = 'checkname-draft-queue-v1';
const draftStorageKey = computed(() => {
    const role = props.selectedRole || 'student';
    const date = props.selectedDate || '';
    const grade = props.selectedGrade || '';
    const classroom = props.selectedClassroom || '';
    const department = props.selectedDepartment || '';
    return `${DRAFT_STORAGE_PREFIX}:${role}:${date}:${grade}:${classroom}:${department}`;
});

const draftCount = computed(() => Object.keys(draftChanges.value || {}).length);
const canEditLeave = computed(() => Boolean(featureFlags?.checkName?.enableLeaveEdit));

const saveDraftsToStorage = () => {
    try {
        const hasDraft = draftCount.value > 0;
        if (!hasDraft) {
            localStorage.removeItem(draftStorageKey.value);
            return;
        }
        localStorage.setItem(draftStorageKey.value, JSON.stringify(draftChanges.value));
    } catch (error) {
        console.error('Save draft changes error:', error);
    }
};

const loadDraftsFromStorage = () => {
    try {
        const raw = localStorage.getItem(draftStorageKey.value);
        if (!raw) {
            draftChanges.value = {};
            return;
        }
        const parsed = JSON.parse(raw);
        draftChanges.value = parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        console.error('Load draft changes error:', error);
        draftChanges.value = {};
    }
};

const pickLeavePreviousActivity = (source) => {
    if (!source) return null;
    return {
        activityId: source.activityId || null,
        activityName: source.activityName || '',
        activityDateStart: source.activityDateStart || '',
        activityDateEnd: source.activityDateEnd || '',
        startTime: source.startTime || '',
        endTime: source.endTime || '',
        location: source.location || '',
        remark: source.remark || '',
    };
};

const sanitizeBaseAttendance = (source) => {
    const next = {};
    Object.entries(source || {}).forEach(([studentId, value]) => {
        if (!studentId || !value) return;
        const leaveStatus = String(value?.leaveStatus || '').toLowerCase();
        if (value?.isDraft || leaveStatus === 'draft') return;
        next[studentId] = value;
    });
    return next;
};

const applyDraftChangesToLocalState = () => {
    const nextAttendance = sanitizeBaseAttendance(props.attendanceData);
    const nextPending = { ...(props.pendingLeaveApprovals || {}) };

    Object.entries(draftChanges.value || {}).forEach(([studentId, change]) => {
        if (!studentId || !change) return;

        if (change.action === 'present') {
            nextAttendance[studentId] = {
                status: 'present',
                leaveType: null,
                remark: '',
                isDraft: true,
            };
            delete nextPending[studentId];
            return;
        }

        if (change.action === 'late') {
            nextAttendance[studentId] = {
                status: 'late',
                leaveType: null,
                remark: '',
                isDraft: true,
            };
            delete nextPending[studentId];
            return;
        }

        if (change.action === 'leave') {
            nextAttendance[studentId] = {
                status: 'leave',
                leaveType: change.leaveTypeName || '',
                leaveTypeId: change.leaveTypeId || '',
                remark: change.reason || '',
                leaveRequestId: change.requestId || null,
                leaveStatus: 'draft',
                previousActivity: pickLeavePreviousActivity(change.previousActivity),
                isDraft: true,
            };
            delete nextPending[studentId];
            return;
        }

        if (change.action === 'activity') {
            nextAttendance[studentId] = {
                status: 'activity',
                activityId: change.activityId || null,
                activityName: change.activityName || t('checkNameTable.hasActivity'),
                activityDateStart: change.activityDateStart || '',
                activityDateEnd: change.activityDateEnd || '',
                startTime: change.startTime || '',
                endTime: change.endTime || '',
                location: change.location || '',
                remark: change.remark || '',
                isDraft: true,
            };
            delete nextPending[studentId];
        }
    });

    localAttendanceData.value = nextAttendance;
    localPendingLeaveApprovals.value = nextPending;
};

const upsertDraftChange = (studentId, change) => {
    if (!studentId || !change) return;
    draftChanges.value = {
        ...(draftChanges.value || {}),
        [studentId]: {
            ...change,
            updatedAt: Date.now(),
        },
    };
    saveDraftsToStorage();
    applyDraftChangesToLocalState();
};

const removeDraftChange = (studentId) => {
    if (!draftChanges.value?.[studentId]) return;
    const next = { ...(draftChanges.value || {}) };
    delete next[studentId];
    draftChanges.value = next;
    saveDraftsToStorage();
    applyDraftChangesToLocalState();
};

const clearAllDraftChanges = () => {
    draftChanges.value = {};
    saveDraftsToStorage();
    applyDraftChangesToLocalState();
};

const isDraftChange = (studentId) => Boolean(draftChanges.value?.[studentId]);
const getDraftChange = (studentId) => draftChanges.value?.[studentId] || null;
const getDraftLabel = (studentId) => {
    const action = getDraftChange(studentId)?.action;
    if (action === 'present') return t('checkNameTable.presentShort');
    if (action === 'late') return t('checkNameTable.late');
    if (action === 'leave') return t('checkNameTable.leave');
    if (action === 'activity') return t('checkNameTable.activity');
    return t('checkNameTable.pendingSave');
};

const getDraftBadgeClass = (studentId) => {
    const action = getDraftChange(studentId)?.action;
    if (action === 'present') return 'badge-success';
    if (action === 'late') return 'bg-black text-white border-black';
    if (action === 'leave') return 'badge-warning';
    if (action === 'activity') return 'badge-info';
    return 'badge-ghost';
};

const leaveModal = ref({
    show: false,
    mode: 'create',
    requestId: null,
    studentId: null,
    form: {
        leaveStartDate: '',
        leaveEndDate: '',
        leaveType: '',
        startTime: '',
        endTime: '',
        reason: '',
    },
});

const activityModal = ref({
    show: false,
    mode: 'create',
    activityId: null,
    studentId: null,
    form: {
        activity_name: '',
        activity_date_start: '',
        activity_date_end: '',
        start_time: '',
        end_time: '',
        location: '',
        remark: '',
    },
});

watch(() => props.attendanceData, () => {
    applyDraftChangesToLocalState();
}, { deep: true });

watch(() => props.pendingLeaveApprovals, () => {
    applyDraftChangesToLocalState();
}, { deep: true });

watch(() => props.students, () => {
    currentPage.value = 1;
});

watch(draftStorageKey, () => {
    loadDraftsFromStorage();
    applyDraftChangesToLocalState();
}, { immediate: true });

const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const formatThaiDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
};

const toDateOnly = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d)) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const isSelectedDateInPast = computed(() => {
    const selected = toDateOnly(props.selectedDate);
    if (!selected) return false;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return selected < today;
});

const displayAttendanceStatus = (studentId) => {
    const status = localAttendanceData.value?.[studentId]?.status;
    if (status) return status;
    if (isSelectedDateInPast.value) return 'absent';
    return '';
};

const DEFAULT_LATE_CUTOFF_TIME = '08:01:00';

const padTimeNumber = (value) => String(value).padStart(2, '0');

const formatSecondsToTime = (totalSeconds) => {
    const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;
    return `${padTimeNumber(hours)}:${padTimeNumber(minutes)}:${padTimeNumber(seconds)}`;
};

const parseTimeToSeconds = (value) => {
    if (!value || typeof value !== 'string') return null;
    const match = value.trim().match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (!match) return null;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    const seconds = Number(match[3] || '0');

    if ([hours, minutes, seconds].some((item) => Number.isNaN(item))) return null;
    return (hours * 3600) + (minutes * 60) + seconds;
};

const getLateCutoffTime = () => {
    const selectedRoleRule = Array.isArray(allowanceSetting.value?.rules)
        ? allowanceSetting.value.rules.find((rule) => rule?.role === (props.selectedRole || 'student'))
        : null;
    const lateCutoffTime = allowanceSetting.value?.late?.cutoff_time
        || allowanceSetting.value?.data?.late?.cutoff_time
        || allowanceSetting.value?.rules?.late?.cutoff_time
        || selectedRoleRule?.late?.cutoff_time
        || selectedRoleRule?.allowance_time
        || DEFAULT_LATE_CUTOFF_TIME;

    const cutoffSeconds = parseTimeToSeconds(lateCutoffTime);
    if (cutoffSeconds === null) {
        return DEFAULT_LATE_CUTOFF_TIME;
    }

    return formatSecondsToTime(cutoffSeconds);
};

const getPresentSubmitCapTime = () => {
    const lateCutoffSeconds = parseTimeToSeconds(getLateCutoffTime()) ?? parseTimeToSeconds(DEFAULT_LATE_CUTOFF_TIME);
    return formatSecondsToTime(Math.max(0, lateCutoffSeconds - 60));
};

const getLateSubmitTime = () => {
    const lateCutoffSeconds = parseTimeToSeconds(getLateCutoffTime()) ?? parseTimeToSeconds(DEFAULT_LATE_CUTOFF_TIME);
    return formatSecondsToTime(Math.min((24 * 3600) - 1, lateCutoffSeconds + 60));
};

const toAttendanceSubmitTime = () => {
    const now = new Date();
    const cutoffSeconds = parseTimeToSeconds(getPresentSubmitCapTime()) ?? parseTimeToSeconds('08:00:00');
    const cutoffDateTime = new Date(now);
    cutoffDateTime.setHours(0, 0, 0, 0);
    cutoffDateTime.setSeconds(cutoffSeconds);

    if (now > cutoffDateTime) {
        return getPresentSubmitCapTime();
    }

    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
};

const toLateAttendanceSubmitTime = () => {
    const now = new Date();

    const cutoffStr = getLateCutoffTime();
    const cutoffSeconds = parseTimeToSeconds(cutoffStr) ?? parseTimeToSeconds(DEFAULT_LATE_CUTOFF_TIME);

    const nowSeconds = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();

    if (nowSeconds < cutoffSeconds) {
        const lateSeconds = Math.min((24 * 3600) - 1, cutoffSeconds + 60);
        return formatSecondsToTime(lateSeconds);
    } else {
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
    }
};

const getLeaveTypeNameById = (leaveTypeId) => {
    const found = leaveTypes.value.find(type => type._id === leaveTypeId);
    return found?.name || '';
};

const getLeaveTypeLabel = (type) => {
    if (!type?.name) return '';
    const name = type.name.trim();
    if (name === 'ลาป่วย') {
        return t('checkNameTable.TypeLeave.sick');
    }
    if (name === 'ลากิจ') {
        return t('checkNameTable.TypeLeave.personal');
    }
    return type.name;
};

const formatLeaveTypeName = (leaveTypeName) => {
    if (!leaveTypeName) return '';
    const name = String(leaveTypeName).trim();

    if (name === 'ลาป่วย') {
        return t('checkNameTable.TypeLeave.sick');
    }
    if (name === 'ลากิจ') {
        return t('checkNameTable.TypeLeave.personal');
    }

    return leaveTypeName;
};

const allowedLeaveTypeNames = ['ลาป่วย', 'ลากิจ'];
const normalizeLeaveTypeName = (value) => String(value || '').trim().toLowerCase();
const allowedLeaveTypeSet = new Set(allowedLeaveTypeNames.map((name) => normalizeLeaveTypeName(name)));

const allowedLeaveTypes = computed(() => {
    return leaveTypes.value.filter((type) => allowedLeaveTypeSet.has(normalizeLeaveTypeName(type?.name)));
});

const getLeaveTypeIdByName = (name) => {
    const target = String(name || '').trim().toLowerCase();
    return leaveTypes.value.find(type => String(type?.name || '').trim().toLowerCase() === target)?._id || '';
};

const normalizeLeaveTimeInput = (value) => {
    if (!value) return '';
    if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.slice(0, 5);
    if (/^\d{2}:\d{2}$/.test(value)) return value;
    return value;
};

const normalizeActivityTimeInput = (value) => {
    if (!value) return '';
    if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value;
    if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`;
    return value;
};

const normalizeTimeForOptionCompare = (value) => {
    if (!value) return '';
    if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.slice(0, 5);
    if (/^\d{2}:\d{2}$/.test(value)) return value;
    return value;
};

const getStudentDisplayName = (studentId) => {
    const student = (props.students || []).find((item) => item?._id === studentId);
    if (!student) return studentId;
    return student.name || [student.pre_name, student.first_name, student.last_name].filter(Boolean).join(' ') || student.userid || studentId;
};

const getRequestErrorMessage = (error) => {
    return error?.response?.data?.error
        || error?.response?.data?.message
        || error?.message
        || t('checkNameTable.unknownReason');
};

const pickLeaveRequestId = (source) => {
    if (!source) return null;
    return source.requestId || source.leaveRequestId || source.leave_request_id || null;
};

const getLeaveRequestId = (studentId) => {
    const draft = getDraftChange(studentId);
    if (draft?.action === 'leave' && draft.requestId) {
        return draft.requestId;
    }
    const pending = localPendingLeaveApprovals.value?.[studentId];
    const pendingRequestId = pickLeaveRequestId(pending);
    if (pendingRequestId) {
        return pendingRequestId;
    }
    const attendance = localAttendanceData.value?.[studentId];
    return pickLeaveRequestId(attendance);
};

const loadLeaveTypes = async () => {
    try {
        const response = await leaveService.getLeaveTypes();
        leaveTypes.value = response?.data || [];
    } catch (error) {
        console.error('Load leave types error:', error);
        leaveTypes.value = [];
    }
};

const loadAllowanceSetting = async () => {
    try {
        const response = await allowanceService.getAllowance();
        allowanceSetting.value = response?.data || null;
    } catch (error) {
        console.error('Load allowance setting error:', error);
        allowanceSetting.value = null;
    }
};

const markPresent = async (studentId) => {
    if (autoSaving.value) return;
    if (!props.selectedDate) {
        Swal.fire(t('checkNameTable.alertTitle'), t('checkNameTable.selectDateFirst'), 'warning');
        return;
    }

    upsertDraftChange(studentId, {
        action: 'present',
    });
};

const markLate = async (studentId) => {
    if (autoSaving.value) return;
    if (!props.selectedDate) {
        Swal.fire(t('checkNameTable.alertTitle'), t('checkNameTable.selectDateFirst'), 'warning');
        return;
    }

    upsertDraftChange(studentId, {
        action: 'late',
    });
};

const openLeaveModal = async (studentId, mode = 'create') => {
    const pending = localPendingLeaveApprovals.value[studentId] || {};
    const attendance = localAttendanceData.value[studentId] || {};
    const draft = getDraftChange(studentId);
    const useDraft = mode === 'draft-edit' && draft?.action === 'leave';

    const draftLeaveTypeName = useDraft ? draft.leaveTypeName : '';
    const draftFallbackLeaveTypeId = draftLeaveTypeName
        ? getLeaveTypeIdByName(draftLeaveTypeName)
        : '';

    const fallbackLeaveTypeId = allowedLeaveTypes.value[0]?._id || '';
    const leaveType = useDraft
        ? (draft.leaveTypeId || draftFallbackLeaveTypeId || fallbackLeaveTypeId)
        : mode === 'edit'
            ? (pending.leaveTypeId || attendance.leaveTypeId || getLeaveTypeIdByName(pending.leaveType || attendance.leaveType) || fallbackLeaveTypeId)
            : fallbackLeaveTypeId;

    const selectedLeaveTypeId = allowedLeaveTypes.value.some((type) => type._id === leaveType)
        ? leaveType
        : fallbackLeaveTypeId;

    leaveModal.value.studentId = studentId;
    leaveModal.value.mode = mode;
    leaveModal.value.requestId = useDraft
        ? (draft.requestId || null)
        : mode === 'edit'
            ? getLeaveRequestId(studentId)
            : null;

    const defaultDate = props.selectedDate || '';
    const startDate = useDraft
        ? (draft.startDate || defaultDate)
        : mode === 'edit'
            ? (pending.startDate || pending.start_date || pending.leaveDate || attendance.startDate || attendance.start_date || attendance.leaveDate || defaultDate)
            : defaultDate;
    const endDate = useDraft
        ? (draft.endDate || draft.startDate || defaultDate)
        : mode === 'edit'
            ? (pending.endDate || pending.end_date || pending.leaveDate || attendance.endDate || attendance.end_date || attendance.leaveDate || attendance.startDate || attendance.start_date || defaultDate)
            : defaultDate;

    const rawStartTime = useDraft
        ? (draft.startTime || '')
        : mode === 'edit'
            ? (pending.startTime || pending.start_time || attendance.startTime || attendance.start_time || '')
            : '';
    const rawEndTime = useDraft
        ? (draft.endTime || '')
        : mode === 'edit'
            ? (pending.endTime || pending.end_time || attendance.endTime || attendance.end_time || '')
            : '';

    leaveModal.value.form = {
        leaveStartDate: startDate,
        leaveEndDate: endDate,
        leaveType: selectedLeaveTypeId,
        timeOption: getTimeOptionFromValues(rawStartTime, rawEndTime),
        reason: useDraft ? (draft.reason || '') : mode === 'edit' ? (pending.reason || attendance.remark || '') : '',
    };
    await nextTick();
    leaveModal.value.show = true;
};

const closeLeaveModal = () => {
    leaveModal.value.show = false;
    leaveModal.value.mode = 'create';
    leaveModal.value.requestId = null;
    leaveModal.value.studentId = null;
};

const normalizeDateInput = (value) => {
    if (!value) return '';
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }
    const d = new Date(value);
    if (isNaN(d)) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getTimeValuesByOption = (option) => {
    if (option === 'morning') {
        return { startTime: '07:00', endTime: '13:00' };
    }
    if (option === 'afternoon') {
        return { startTime: '12:00', endTime: '17:00' };
    }
    return { startTime: '', endTime: '' };
};

const getTimeOptionFromValues = (startTime, endTime) => {
    const normalizedStartTime = normalizeTimeForOptionCompare(startTime);
    const normalizedEndTime = normalizeTimeForOptionCompare(endTime);
    if (normalizedStartTime === '07:00' && normalizedEndTime === '13:00') return 'morning';
    if (normalizedStartTime === '12:00' && normalizedEndTime === '17:00') return 'afternoon';
    return 'all_day';
};

const openActivityModal = async (studentId, mode = 'create') => {
    const current = mode === 'edit'
        ? (getCurrentActivitySnapshot(studentId) || localAttendanceData.value[studentId] || {})
        : (localAttendanceData.value[studentId] || {});
    const draft = getDraftChange(studentId);
    const useDraft = mode === 'draft-edit' && draft?.action === 'activity';

    const draftCurrent = useDraft
        ? {
            activityId: draft.activityId || null,
            activityName: draft.activityName || '',
            activityDateStart: draft.activityDateStart || '',
            activityDateEnd: draft.activityDateEnd || '',
            startTime: draft.startTime || '',
            endTime: draft.endTime || '',
            location: draft.location || '',
            remark: draft.remark || '',
        }
        : null;

    activityModal.value.studentId = studentId;
    activityModal.value.mode = mode;
    activityModal.value.activityId = useDraft
        ? (draftCurrent.activityId || null)
        : mode === 'edit'
            ? (current.activityId || null)
            : null;
    const defaultDate = props.selectedDate || '';

    const rawStartTime = useDraft ? (draftCurrent.startTime || '') : mode === 'edit' ? (current.startTime || '') : '';
    const rawEndTime = useDraft ? (draftCurrent.endTime || '') : mode === 'edit' ? (current.endTime || '') : '';

    activityModal.value.form = {
        activity_name: useDraft ? (draftCurrent.activityName || '') : mode === 'edit' ? (current.activityName || '') : '',
        activity_date_start: useDraft
            ? (normalizeDateInput(draftCurrent.activityDateStart) || defaultDate)
            : mode === 'edit'
                ? (normalizeDateInput(current.activityDateStart) || defaultDate)
                : defaultDate,
        activity_date_end: useDraft
            ? (normalizeDateInput(draftCurrent.activityDateEnd) || normalizeDateInput(draftCurrent.activityDateStart) || defaultDate)
            : mode === 'edit'
                ? (normalizeDateInput(current.activityDateEnd) || normalizeDateInput(current.activityDateStart) || defaultDate)
                : defaultDate,
        timeOption: getTimeOptionFromValues(rawStartTime, rawEndTime),
        location: useDraft ? (draftCurrent.location || '') : mode === 'edit' ? (current.location || '') : '',
        remark: useDraft ? (draftCurrent.remark || '') : mode === 'edit' ? (current.remark || '') : '',
    };
    await nextTick();
    activityModal.value.show = true;
};

const closeActivityModal = () => {
    activityModal.value.show = false;
    activityModal.value.mode = 'create';
    activityModal.value.activityId = null;
    activityModal.value.studentId = null;
};

const isSelectedDateInActivityRange = (startDate, endDate) => {
    if (!props.selectedDate || !startDate || !endDate) return false;
    return props.selectedDate >= startDate && props.selectedDate <= endDate;
};

const pickActivitySnapshot = (source) => {
    if (!source) return null;
    const activityId = source.activityId || source._id || null;
    const activityName = source.activityName || source.activity_name || '';
    const activityDateStart = normalizeDateInput(source.activityDateStart || source.activity_date_start || source.startDate || source.leaveDate || '');
    const activityDateEnd = normalizeDateInput(source.activityDateEnd || source.activity_date_end || source.endDate || source.leaveDate || source.activityDateStart || source.activity_date_start || '');
    const startTime = source.startTime || source.start_time || '';
    const endTime = source.endTime || source.end_time || '';
    const location = source.location || '';
    const remark = source.remark || '';

    if (!activityId && !activityName && !activityDateStart && !activityDateEnd) {
        return null;
    }

    return {
        activityId,
        activityName,
        activityDateStart,
        activityDateEnd,
        startTime,
        endTime,
        location,
        remark,
    };
};

const getPendingActivity = (studentId) => {
    const pending = localPendingLeaveApprovals.value?.[studentId];
    const pendingActivity = pickActivitySnapshot(pending?.previousActivity);
    if (pendingActivity) return pendingActivity;

    const attendance = localAttendanceData.value?.[studentId];
    if (!attendance) return null;

    return pickActivitySnapshot({
        activityId: attendance.activityId || attendance.activity_id || null,
        activityName: attendance.activityName || attendance.activity_name || '',
        activityDateStart: attendance.activityDateStart || attendance.activity_date_start || '',
        activityDateEnd: attendance.activityDateEnd || attendance.activity_date_end || '',
        startTime: attendance.startTime || attendance.start_time || '',
        endTime: attendance.endTime || attendance.end_time || '',
        location: attendance.location || '',
        remark: attendance.activityRemark || attendance.activity_remark || attendance.remark || '',
    });
};

const getCurrentActivitySnapshot = (studentId) => {
    const currentAttendance = localAttendanceData.value?.[studentId];
    const pendingActivity = getPendingActivity(studentId);
    if (pendingActivity) return pendingActivity;
    if (currentAttendance?.status === 'activity') {
        return pickActivitySnapshot(currentAttendance);
    }
    return pickActivitySnapshot(currentAttendance?.previousActivity);
};

const restoreActivityAfterLeaveDecision = (studentId) => {
    const pending = localPendingLeaveApprovals.value?.[studentId];
    const previousActivity = pickActivitySnapshot(pending?.previousActivity);

    if (!previousActivity) {
        delete localAttendanceData.value[studentId];
        return;
    }

    localAttendanceData.value[studentId] = {
        status: 'activity',
        ...previousActivity,
    };
};

const setPendingPreviousActivity = (studentId, previousActivity) => {
    const pending = localPendingLeaveApprovals.value?.[studentId];
    if (pending) {
        if (previousActivity) {
            pending.previousActivity = previousActivity;
        } else {
            delete pending.previousActivity;
        }
    }

    const attendance = localAttendanceData.value?.[studentId];
    if (attendance) {
        if (previousActivity) {
            attendance.previousActivity = previousActivity;
        } else {
            delete attendance.previousActivity;
        }
    }
};

const formatTimeToSeconds = (timeStr) => {
    if (!timeStr) return '';
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
        return `${timeStr}:00`;
    }
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
        return timeStr;
    }
    return timeStr;
}

const createActivityRequest = async () => {
    if (autoSaving.value) return;

    const isEditMode = activityModal.value.mode === 'edit' || activityModal.value.mode === 'draft-edit';

    if (!activityModal.value.form.activity_name) {
        Swal.fire(t('checkNameTable.alertTitle'), t('checkNameTable.enterActivityName'), 'warning');
        return;
    }

    const studentId = activityModal.value.studentId;
    const activityDateStart = activityModal.value.form.activity_date_start || props.selectedDate || '';
    const activityDateEnd = activityModal.value.form.activity_date_end || activityDateStart;

    if (!studentId) {
        Swal.fire(t('checkNameTable.alertTitle'), t('checkNameTable.studentIdNotFound'), 'warning');
        return;
    }

    if (!activityDateStart || !activityDateEnd) {
        Swal.fire(t('checkNameTable.alertTitle'), t('checkNameTable.selectActivityDates'), 'warning');
        return;
    }

    if (activityDateEnd < activityDateStart) {
        Swal.fire(t('checkNameTable.alertTitle'), t('checkNameTable.endDateInvalid'), 'warning');
        return;
    }

    const { startTime, endTime } = getTimeValuesByOption(activityModal.value.form.timeOption);

    const shouldShow = isSelectedDateInActivityRange(activityDateStart, activityDateEnd);
    if (!shouldShow) {
        removeDraftChange(studentId);
        closeActivityModal();
        return;
    }

    upsertDraftChange(studentId, {
        action: 'activity',
        studentId,
        activityId: activityModal.value.activityId || null,
        activityName: activityModal.value.form.activity_name,
        activityDateStart,
        activityDateEnd,
        startTime: startTime ? formatTimeToSeconds(startTime) : '',
        endTime: endTime ? formatTimeToSeconds(endTime) : '',
        location: activityModal.value.form.location || '',
        remark: activityModal.value.form.remark || '',
        mode: isEditMode ? 'edit' : 'create',
    });

    closeActivityModal();
    Swal.fire(t('checkNameTable.successTitle'), t('checkNameTable.queuedActivity'), 'success');
};

const editActivity = async (studentId) => {
    if (autoSaving.value) return;
    await openActivityModal(studentId, 'edit');
};

const editPendingActivity = async (studentId) => {
    if (autoSaving.value) return;
    await openActivityModal(studentId, 'edit');
};

const deletePendingActivity = async (studentId) => {
    if (autoSaving.value) return;

    const activity = getPendingActivity(studentId);
    if (!activity?.activityId) {
        Swal.fire(t('checkNameTable.alertTitle'), t('checkNameTable.deleteActivityFailed'), 'warning');
        return;
    }

    const confirm = await Swal.fire({
        title: t('checkNameTable.confirmDeleteActivityTitle'),
        text: activity.activityName || t('checkNameTable.confirmDeleteActivityText'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: t('checkNameTable.delete'),
        cancelButtonText: t('checkNameTable.cancel'),
        confirmButtonColor: '#dc2626',
    });

    if (!confirm.isConfirmed) return;

    autoSaving.value = true;
    try {
        await activityService.deleteActivity(activity.activityId);
        setPendingPreviousActivity(studentId, null);
        emit('update:attendanceData', localAttendanceData.value);
        emit('update:pendingLeaveApprovals', localPendingLeaveApprovals.value);
        Swal.fire(t('checkNameTable.successTitle'), t('checkNameTable.deleteSuccess'), 'success');
    } catch (error) {
        Swal.fire(t('checkNameTable.errorTitle'), error?.response?.data?.error || error?.message || t('checkNameTable.deleteActivityFailed'), 'error');
        console.error('Delete pending activity error:', error);
    } finally {
        autoSaving.value = false;
    }
};

const deleteActivity = async (studentId) => {
    if (autoSaving.value) return;

    const activity = localAttendanceData.value[studentId] || {};
    if (!activity.activityId) {
        Swal.fire(t('checkNameTable.alertTitle'), t('checkNameTable.deleteActivityFailed'), 'warning');
        return;
    }

    const confirm = await Swal.fire({
        title: t('checkNameTable.confirmDeleteActivityTitle'),
        text: activity.activityName || t('checkNameTable.confirmDeleteActivityText'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: t('checkNameTable.delete'),
        cancelButtonText: t('checkNameTable.cancel'),
        confirmButtonColor: '#dc2626',
    });

    if (!confirm.isConfirmed) return;

    autoSaving.value = true;
    try {
        await activityService.deleteActivity(activity.activityId);
        delete localAttendanceData.value[studentId];
        emit('update:attendanceData', localAttendanceData.value);
        Swal.fire(t('checkNameTable.successTitle'), t('checkNameTable.deleteSuccess'), 'success');
    } catch (error) {
        Swal.fire(t('checkNameTable.errorTitle'), error?.response?.data?.error || error?.message || t('checkNameTable.deleteActivityFailed'), 'error');
        console.error('Delete activity error:', error);
    } finally {
        autoSaving.value = false;
    }
};

const editLeave = async (studentId) => {
    if (autoSaving.value) return;
    if (!canEditLeave.value) {
        Swal.fire(t('checkNameTable.alertTitle'), t('checkNameTable.leaveEditDisabled'), 'info');
        return;
    }
    if (!getLeaveRequestId(studentId)) {
        Swal.fire(t('checkNameTable.alertTitle'), t('checkNameTable.leaveIdNotFound'), 'warning');
        return;
    }
    await openLeaveModal(studentId, 'edit');
};

const deleteLeave = async (studentId) => {
    if (autoSaving.value) return;

    const requestId = getLeaveRequestId(studentId);
    if (!requestId) {
        Swal.fire(t('checkNameTable.alertTitle'), t('checkNameTable.deleteLeaveFailed'), 'warning');
        return;
    }

    const confirm = await Swal.fire({
        title: t('checkNameTable.confirmDeleteLeaveTitle'),
        text: t('checkNameTable.confirmDeleteLeaveText'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: t('checkNameTable.delete'),
        cancelButtonText: t('checkNameTable.cancel'),
        confirmButtonColor: '#dc2626',
    });

    if (!confirm.isConfirmed) return;

    autoSaving.value = true;
    try {
        await leaveService.deleteLeaveRequest(requestId);
        removeDraftChange(studentId);
        restoreActivityAfterLeaveDecision(studentId);
        delete localPendingLeaveApprovals.value[studentId];
        emit('update:attendanceData', localAttendanceData.value);
        emit('update:pendingLeaveApprovals', localPendingLeaveApprovals.value);
        emit('request:reload');
        Swal.fire(t('checkNameTable.successTitle'), t('checkNameTable.deleteLeaveSuccess'), 'success');
    } catch (error) {
        Swal.fire(t('checkNameTable.errorTitle'), error?.response?.data?.error || error?.message || t('checkNameTable.deleteLeaveFailed'), 'error');
        console.error('Delete leave error:', error);
    } finally {
        autoSaving.value = false;
    }
};

const isSelectedDateInLeaveRange = (startDate, endDate) => {
    if (!props.selectedDate || !startDate || !endDate) return false;
    return props.selectedDate >= startDate && props.selectedDate <= endDate;
};

const createLeaveRequest = async () => {
    if (autoSaving.value) return;
    if (!leaveModal.value.form.leaveType) {
        Swal.fire(t('checkNameTable.alertTitle'), t('checkNameTable.selectLeaveTypeAlert'), 'warning');
        return;
    }

    const studentId = leaveModal.value.studentId;
    const leaveType = leaveModal.value.form.leaveType;
    const reason = String(leaveModal.value.form.reason || '').trim();
    const leaveStartDate = leaveModal.value.form.leaveStartDate || props.selectedDate;
    const leaveEndDate = leaveModal.value.form.leaveEndDate || leaveStartDate;

    if (!reason) {
        Swal.fire(t('checkNameTable.alertTitle'), t('checkNameTable.enterLeaveReason'), 'warning');
        return;
    }

    if (!leaveStartDate || !leaveEndDate) {
        Swal.fire(t('checkNameTable.alertTitle'), t('checkNameTable.selectLeaveDates'), 'warning');
        return;
    }

    if (leaveEndDate < leaveStartDate) {
        Swal.fire(t('checkNameTable.alertTitle'), t('checkNameTable.leaveEndDateInvalid'), 'warning');
        return;
    }

    const leaveTypeId = leaveType;
    const leaveTypeName = getLeaveTypeNameById(leaveTypeId);

    const { startTime, endTime } = getTimeValuesByOption(leaveModal.value.form.timeOption);

    if (!allowedLeaveTypes.value.some((type) => type._id === leaveTypeId)) {
        Swal.fire(t('checkNameTable.alertTitle'), t('checkNameTable.invalidLeaveTypeAlert'), 'warning');
        return;
    }

    if (!leaveTypeId) {
        Swal.fire(t('checkNameTable.alertTitle'), t('checkNameTable.leaveTypeNotFound'), 'warning');
        return;
    }

    const isEditMode = leaveModal.value.mode === 'edit' || leaveModal.value.mode === 'draft-edit';
    const shouldShowLeaveOnCurrentDate = isSelectedDateInLeaveRange(leaveStartDate, leaveEndDate);
    if (!shouldShowLeaveOnCurrentDate) {
        removeDraftChange(studentId);
        closeLeaveModal();
        return;
    }

    const previousActivity = getCurrentActivitySnapshot(studentId);
    upsertDraftChange(studentId, {
        action: 'leave',
        studentId,
        requestId: leaveModal.value.requestId || null,
        leaveTypeId,
        leaveTypeName,
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        startTime,
        endTime,
        reason,
        previousActivity,
        mode: isEditMode ? 'edit' : 'create',
    });

    closeLeaveModal();
    Swal.fire(t('checkNameTable.successTitle'), t('checkNameTable.queuedLeave'), 'success');
};

const saveSingleDraftChange = async (studentId, draftChange) => {
    if (!studentId || !draftChange) return;

    if (draftChange.action === 'present') {
        await leaveService.manualAttendance({
            user_id: studentId,
            date: props.selectedDate,
            time: toAttendanceSubmitTime(),
            remark: '',
        });
        return;
    }

    if (draftChange.action === 'late') {
        await leaveService.manualAttendance({
            user_id: studentId,
            date: props.selectedDate,
            time: toLateAttendanceSubmitTime(),
            remark: '',
        });
        return;
    }

    if (draftChange.action === 'leave') {
        let leaveRequestId = draftChange.requestId || null;
        const payload = {
            leave_type_id: draftChange.leaveTypeId,
            start_date: draftChange.startDate,
            end_date: draftChange.endDate,
            start_time: normalizeLeaveTimeInput(draftChange.startTime),
            end_time: normalizeLeaveTimeInput(draftChange.endTime),
            reason: draftChange.reason || '',
            attachment_url: '',
        };

        if (draftChange.mode === 'edit' && leaveRequestId) {
            await leaveService.updateLeaveRequest(leaveRequestId, payload);
        } else {
            const response = await leaveService.createLeaveRequest({
                ...payload,
                user_id: studentId,
            });
            leaveRequestId = response?.data?._id || response?._id || null;
            if (leaveRequestId) {
                await leaveService.approveLeaveRequest(leaveRequestId, t('checkNameTable.approveSuccess'));
            }
        }
        return;
    }

    if (draftChange.action === 'activity') {
        const payload = {
            activity_name: draftChange.activityName,
            activity_date_start: draftChange.activityDateStart,
            activity_date_end: draftChange.activityDateEnd,
            start_time: normalizeActivityTimeInput(draftChange.startTime),
            end_time: normalizeActivityTimeInput(draftChange.endTime),
            location: draftChange.location || '',
            status: 'เข้าร่วม',
            remark: draftChange.remark || '',
        };

        if (draftChange.mode === 'edit' && draftChange.activityId) {
            await activityService.updateActivity(draftChange.activityId, payload);
        } else {
            await activityService.createActivity({
                ...payload,
                user_id: studentId,
            });
        }
    }
};

const saveAllDraftChanges = async () => {
    if (autoSaving.value || draftCount.value === 0) return;
    if (!props.selectedDate) {
        Swal.fire(t('checkNameTable.alertTitle'), t('checkNameTable.selectDateFirst'), 'warning');
        return;
    }

    autoSaving.value = true;
    let successCount = 0;
    let failCount = 0;
    const failureMessages = [];

    const entries = Object.entries(draftChanges.value || {}).sort((a, b) => {
        const timeA = Number(a?.[1]?.updatedAt || 0);
        const timeB = Number(b?.[1]?.updatedAt || 0);
        return timeA - timeB;
    });

    for (const [studentId, draftChange] of entries) {
        try {
            await saveSingleDraftChange(studentId, draftChange);
            removeDraftChange(studentId);
            successCount += 1;
        } catch (error) {
            failCount += 1;
            failureMessages.push(`${getStudentDisplayName(studentId)}: ${getRequestErrorMessage(error)}`);
            console.error(`Save queued checkname failed for ${studentId}:`, error);
        }
    }

    autoSaving.value = false;

    if (successCount > 0) {
        emit('request:reload');
    }

    if (failCount === 0) {
        Swal.fire(t('checkNameTable.successTitle'), t('checkNameTable.saveSuccessMessage', { count: successCount }), 'success');
    } else {
        const detailLines = failureMessages.slice(0, 3).map((message) => `<div style="text-align:left">- ${message}</div>`).join('');
        const moreCount = failureMessages.length - Math.min(failureMessages.length, 3);
        Swal.fire({
            title: t('checkNameTable.saveIncompleteTitle'),
            icon: 'warning',
            html: `
                <div>${t('checkNameTable.saveIncompleteText', { success: successCount, fail: failCount })}</div>
                <div style="margin-top:8px">${t('checkNameTable.reasonLabel')}</div>
                <div style="margin-top:4px">${detailLines || `<div style="text-align:left">- ${t('checkNameTable.unknownReason')}</div>`}</div>
                ${moreCount > 0 ? `<div style="margin-top:8px">${t('checkNameTable.andMoreItems', { count: moreCount })}</div>` : ''}
            `,
        });
    }
};

const approveLeave = async (studentId) => {
    if (autoSaving.value) return;

    const pending = localPendingLeaveApprovals.value[studentId];
    if (!pending?.requestId) {
        Swal.fire(t('checkNameTable.alertTitle'), t('checkNameTable.leaveIdNotFound'), 'warning');
        return;
    }

    autoSaving.value = true;
    try {
        await leaveService.approveLeaveRequest(pending.requestId, t('checkNameTable.approveSuccess'));

        const previousActivity = pickActivitySnapshot(pending?.previousActivity);
        if (previousActivity?.activityId) {
            await activityService.deleteActivity(previousActivity.activityId);
        }

        localAttendanceData.value[studentId] = {
            ...localAttendanceData.value[studentId],
            status: 'leave',
            leaveStatus: 'approved',
            previousActivity: null,
        };
        delete localPendingLeaveApprovals.value[studentId];
        emit('update:attendanceData', localAttendanceData.value);
        emit('update:pendingLeaveApprovals', localPendingLeaveApprovals.value);
        Swal.fire(t('checkNameTable.successTitle'), t('checkNameTable.approveSuccess'), 'success');
    } catch (error) {
        Swal.fire(t('checkNameTable.errorTitle'), error?.response?.data?.error || error?.message || t('checkNameTable.unknownReason'), 'error');
        console.error('Approve leave error:', error);
    } finally {
        autoSaving.value = false;
    }
};

const rejectLeave = async (studentId) => {
    if (autoSaving.value) return;

    const pending = localPendingLeaveApprovals.value[studentId];
    if (!pending?.requestId) {
        restoreActivityAfterLeaveDecision(studentId);
        delete localPendingLeaveApprovals.value[studentId];
        emit('update:attendanceData', localAttendanceData.value);
        emit('update:pendingLeaveApprovals', localPendingLeaveApprovals.value);
        Swal.fire(t('checkNameTable.successTitle'), t('checkNameTable.rejectSuccess'), 'success');
        return;
    }

    autoSaving.value = true;
    try {
        await leaveService.rejectLeaveRequest(pending.requestId, t('checkNameTable.rejectSuccess'));
        restoreActivityAfterLeaveDecision(studentId);
        delete localPendingLeaveApprovals.value[studentId];
        emit('update:attendanceData', localAttendanceData.value);
        emit('update:pendingLeaveApprovals', localPendingLeaveApprovals.value);
        Swal.fire(t('checkNameTable.successTitle'), t('checkNameTable.rejectSuccess'), 'success');
    } catch (error) {
        Swal.fire(t('checkNameTable.errorTitle'), error?.response?.data?.error || error?.message || t('checkNameTable.unknownReason'), 'error');
        console.error('Reject leave error:', error);
    } finally {
        autoSaving.value = false;
    }
};

const cancelLeave = async (studentId) => {
    if (autoSaving.value) return;

    const pending = localPendingLeaveApprovals.value[studentId];
    if (!pending?.requestId) {
        restoreActivityAfterLeaveDecision(studentId);
        delete localPendingLeaveApprovals.value[studentId];
        emit('update:attendanceData', localAttendanceData.value);
        emit('update:pendingLeaveApprovals', localPendingLeaveApprovals.value);
        Swal.fire(t('checkNameTable.successTitle'), t('checkNameTable.cancelLeaveSuccess'), 'success');
        return;
    }

    autoSaving.value = true;
    try {
        await leaveService.cancelLeaveRequest(pending.requestId);
        restoreActivityAfterLeaveDecision(studentId);
        delete localPendingLeaveApprovals.value[studentId];
        emit('update:attendanceData', localAttendanceData.value);
        emit('update:pendingLeaveApprovals', localPendingLeaveApprovals.value);
        Swal.fire(t('checkNameTable.successTitle'), t('checkNameTable.cancelLeaveSuccess'), 'success');
    } catch (error) {
        Swal.fire(t('checkNameTable.errorTitle'), error?.response?.data?.error || error?.message || t('checkNameTable.deleteLeaveFailed'), 'error');
        console.error('Cancel leave error:', error);
    } finally {
        autoSaving.value = false;
    }
};

onMounted(() => {
    loadLeaveTypes();
    loadAllowanceSetting();
});
</script>