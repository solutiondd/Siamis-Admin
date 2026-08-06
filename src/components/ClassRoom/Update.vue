<template>
    <dialog ref="modalRef" class="modal">
        <div class="modal-box overflow-visible">
            <h3 class="font-bold text-lg mb-4">{{ t('classroomUpdate.title') }}</h3>
            <form @submit.prevent="handleSubmit" class="space-y-4">

                <div class="flex flex-row gap-4">
                    <div class="form-control flex-1">
                        <label class="label">
                            <span class="label-text">{{ t('classroomUpdate.grade') }}</span>
                        </label>
                        <input type="text" :value="formData.grade" class="input input-bordered w-full" disabled />
                    </div>
                    <div class="form-control flex-1">
                        <label class="label">
                            <span class="label-text">{{ t('classroomUpdate.classroom') }}</span>
                        </label>
                        <input type="text" :value="formData.classroom" class="input input-bordered w-full" disabled />
                    </div>
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">{{ t('classroomUpdate.adviserOne') }}</span>
                    </label>
                    <div class="relative z-[50]" ref="adviserBoxRef">
                        <input ref="adviserInputRef" v-model="adviserQuery" type="text"
                            class="input input-bordered w-full" :placeholder="t('classroomUpdate.searchTeacher')"
                            @focus="adviserOpen = true" @input="adviserOpen = true" />
                        <button v-if="formData.adviser" type="button"
                            class="btn btn-ghost btn-xs absolute right-2 top-2" @click="clearAdviser">{{
                                t('classroomUpdate.remove') }}</button>
                        <ul v-if="adviserOpen"
                            class="bg-base-100 rounded-box shadow border absolute z-[50] bottom-full left-0 mb-2 w-full max-h-[40vh] overflow-y-auto overflow-x-hidden flex flex-col columns-1">
                            <li v-if="!filteredTeachersByAdviserQuery.length" class="px-3 py-2 text-sm opacity-70">
                                {{ t('classroomUpdate.noTeacherMatch') }}
                            </li>
                            <li v-for="teacher in filteredTeachersByAdviserQuery" :key="teacher._id || teacher.id">
                                <button type="button" class="w-full text-left px-3 py-2 hover:bg-base-200"
                                    @click="selectAdviser(teacher)">
                                    {{ teacher.name }} ({{ teacher.position }})
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="flex justify-center my-2">
                    <button type="button" class="btn btn-outline btn-xs" @click="swapAdvisers"
                        :disabled="!formData.adviser && !formData.adviser2">
                        ⇅ {{ t('classroomUpdate.swapAdvisers') }}
                    </button>
                </div>
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">{{ t('classroomUpdate.adviserTwo') }}</span>
                    </label>
                    <div class="relative z-[50]" ref="adviser2BoxRef">
                        <input ref="adviser2InputRef" v-model="adviser2Query" type="text"
                            class="input input-bordered w-full" :placeholder="t('classroomUpdate.searchTeacher')"
                            @focus="adviser2Open = true" @input="adviser2Open = true" />
                        <button v-if="formData.adviser2" type="button"
                            class="btn btn-ghost btn-xs absolute right-2 top-2" @click="clearAdviser2">{{
                                t('classroomUpdate.remove') }}</button>
                        <ul v-if="adviser2Open"
                            class="bg-base-100 rounded-box shadow border absolute z-[50] bottom-full left-0 mb-2 w-full max-h-[50vh] overflow-y-auto overflow-x-hidden flex flex-col columns-1">
                            <li v-if="!filteredTeachersByAdviser2Query.length" class="px-3 py-2 text-sm opacity-70">
                                {{ t('classroomUpdate.noTeacherMatch') }}
                            </li>
                            <li v-for="teacher in filteredTeachersByAdviser2Query" :key="teacher._id || teacher.id">
                                <button type="button" class="w-full text-left px-3 py-2 hover:bg-base-200"
                                    @click="selectAdviser2(teacher)">
                                    {{ teacher.name }} ({{ teacher.position }})
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div v-if="!formData.adviser && formData.adviser2"
                        class="mt-2 text-xs text-info flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="inline h-4 w-4 text-info" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" />
                        </svg>
                        {{ t('classroomUpdate.adviserTwoWillMoveUp') }}
                    </div>
                </div>

                <div class="modal-action">
                    <button type="button" @click="closeModal" class="btn btn-ghost">{{ t('classroomUpdate.cancel')
                        }}</button>
                    <button type="submit" class="btn btn-primary" :disabled="loading">
                        <span v-if="loading" class="loading loading-spinner loading-sm"></span>
                        <span v-else>{{ t('classroomUpdate.save') }}</span>
                    </button>
                </div>
            </form>
        </div>
    </dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
const router = useRouter()
const { t } = useI18n()

const props = defineProps({
    teachers: {
        type: Array,
        default: () => []
    }
})

const modalRef = ref(null)
const loading = ref(false)
const formData = ref({
    id: '',
    grade: '',
    classroom: '',
    adviser: '',
    adviser2: ''
})
const adviserQuery = ref('')
const adviserOpen = ref(false)
const adviserBoxRef = ref(null)
const adviserInputRef = ref(null)

const adviser2Query = ref('')
const adviser2Open = ref(false)
const adviser2BoxRef = ref(null)
const adviser2InputRef = ref(null)

const emit = defineEmits(['success'])

const filteredTeachers = computed(() => {
    return props.teachers
})

const filteredTeachersByAdviserQuery = computed(() => {
    const q = adviserQuery.value.trim().toLowerCase()
    if (!q) return filteredTeachers.value
    return filteredTeachers.value.filter(t => {
        const name = (t.name || '').toLowerCase()
        const position = (t.position || '').toLowerCase()
        return name.includes(q) || position.includes(q)
    })
})

const filteredTeachersByAdviser2Query = computed(() => {
    const q = adviser2Query.value.trim().toLowerCase()
    if (!q) return filteredTeachers.value
    return filteredTeachers.value.filter(t => {
        const name = (t.name || '').toLowerCase()
        const position = (t.position || '').toLowerCase()
        return name.includes(q) || position.includes(q)
    })
})

const openModal = (classroom) => {
    formData.value = {
        id: classroom._id,
        grade: classroom.grade,
        classroom: classroom.classroom,
        adviser: classroom.adviser?.id || classroom.adviser?._id || '',
        adviser2: classroom.adviser2?.id || classroom.adviser2?._id || ''
    }
    adviserQuery.value = classroom.adviser?.name ? `${classroom.adviser.name}` : ''
    adviser2Query.value = classroom.adviser2?.name ? `${classroom.adviser2.name}` : ''
    adviserOpen.value = false
    adviser2Open.value = false
    modalRef.value.showModal()
}
const closeModal = () => {
    modalRef.value.close()
    formData.value = {
        id: '',
        grade: '',
        classroom: '',
        adviser: '',
        adviser2: ''
    }
    adviserQuery.value = ''
    adviserOpen.value = false
    adviser2Query.value = ''
    adviser2Open.value = false
}

const selectAdviser = (teacher) => {
    formData.value.adviser = teacher._id || teacher.id
    adviserQuery.value = `${teacher.name} (${teacher.position})`
    adviserOpen.value = false
    if (formData.value.adviser2 === formData.value.adviser) {
        formData.value.adviser2 = ''
        adviser2Query.value = ''
    }
}

const clearAdviser = () => {
    formData.value.adviser = ''
    adviserQuery.value = ''
}

const selectAdviser2 = (teacher) => {
    formData.value.adviser2 = teacher._id || teacher.id
    adviser2Query.value = `${teacher.name} (${teacher.position})`
    adviser2Open.value = false
    if (formData.value.adviser2 === formData.value.adviser) {
        formData.value.adviser = ''
        adviserQuery.value = ''
    }
}

const clearAdviser2 = () => {
    formData.value.adviser2 = ''
    adviser2Query.value = ''
}

let _onDocClick = null
import { onMounted, onBeforeUnmount } from 'vue'
onMounted(() => {
    _onDocClick = (e) => {
        if (adviserOpen.value) {
            const box = adviserBoxRef.value
            if (box && !box.contains(e.target)) {
                adviserOpen.value = false
            }
        }
        if (adviser2Open.value) {
            const box2 = adviser2BoxRef.value
            if (box2 && !box2.contains(e.target)) {
                adviser2Open.value = false
            }
        }
    }
    document.addEventListener('click', _onDocClick)
})

onBeforeUnmount(() => {
    if (_onDocClick) document.removeEventListener('click', _onDocClick)
})

const handleSubmit = async () => {
    if (!formData.value.adviser && formData.value.adviser2) {
        formData.value.adviser = formData.value.adviser2
        adviserQuery.value = adviser2Query.value
        formData.value.adviser2 = ''
        adviser2Query.value = ''
        emit('success', formData.value)
        closeModal()
        return
    }
    if (!formData.value.adviser && !formData.value.adviser2) {
        closeModal()
        setTimeout(async () => {
            const { default: Swal } = await import('sweetalert2')
            Swal.fire({
                icon: 'warning',
                title: t('classroomUpdate.chooseAdviser'),
                confirmButtonColor: '#2563eb',
                didOpen: () => {
                    document.getElementById('app').removeAttribute('aria-hidden')
                }
            })
        }, 200)
        return
    }
    if (formData.value.adviser && formData.value.adviser2 && formData.value.adviser === formData.value.adviser2) {
        closeModal()
        setTimeout(async () => {
            const { default: Swal } = await import('sweetalert2')
            Swal.fire({
                icon: 'warning',
                title: t('classroomUpdate.duplicateAdviser'),
                confirmButtonColor: '#2563eb',
                didOpen: () => {
                    document.getElementById('app').removeAttribute('aria-hidden')
                }
            })
        }, 200)
        return
    }
    emit('success', formData.value)
    closeModal()
}

const swapAdvisers = () => {
    const tempId = formData.value.adviser
    const tempQuery = adviserQuery.value
    formData.value.adviser = formData.value.adviser2
    adviserQuery.value = adviser2Query.value
    formData.value.adviser2 = tempId
    adviser2Query.value = tempQuery
}

defineExpose({
    openModal
})
</script>

<style scoped></style>
