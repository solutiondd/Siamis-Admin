<template>
    <div class="space-y-6 max-[944px]:pt-14">
        <div class="flex justify-between items-center">
            <h1 class="text-xl sm:text-2xl font-bold text-white">{{ t('positionPage.title') }}</h1>
            <button v-if="auth.user?.role !== 'teacher' && auth.user?.role !== 'viewer'" class="btn btn-primary"
                @click="openCreateModal">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                {{ t('positionPage.add') }}
            </button>
        </div>

        <PositionTable :positions="positions" :loading="loading" @delete="openDeleteModal" />

        <CreateModal ref="createModalRef" @success="handleCreateSuccess" />
        <DeleteModal ref="deleteModalRef" @success="handleDeleteSuccess" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import PositionTable from '../../components/Position/Table.vue'
import CreateModal from '../../components/Position/Create.vue'
import DeleteModal from '../../components/Position/Delete.vue'
import { PositionService } from '../../api/position'
import { useAuthStore } from '../../stores/auth'
import { useI18n } from 'vue-i18n'
const auth = useAuthStore()
const { t } = useI18n()

const positionService = new PositionService()

const positions = ref([])
const loading = ref(false)
const createModalRef = ref(null)
const deleteModalRef = ref(null)

const fetchPositions = async () => {
    loading.value = true
    try {
        const response = await positionService.getPositions()
        if (response.message === 'Success' && response.data) {
            positions.value = response.data
        }
    } catch (error) {
        console.error('Fetch positions error:', error)
        Swal.fire({
            icon: 'error',
            title: t('positionPage.loadErrorTitle'),
            text: error?.response?.data?.error || error?.message || t('positionPage.loadErrorText'),
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
    } finally {
        loading.value = false
    }
}

const openCreateModal = () => {
    createModalRef.value.openModal()
}

const handleCreateSuccess = async (name) => {
    try {
        await positionService.createPosition(name)
        await fetchPositions()
        Swal.fire({
            icon: 'success',
            title: t('positionPage.createSuccess'),
            showConfirmButton: false,
            timer: 1500,
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
    } catch (error) {
        console.error('Create position error:', error)
        Swal.fire({
            icon: 'error',
            title: t('positionPage.createErrorTitle'),
            text: error?.response?.data?.error || error?.message || t('positionPage.createErrorText'),
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
    }
}

const openDeleteModal = (position) => {
    deleteModalRef.value.openModal(position)
}

const handleDeleteSuccess = async (id) => {
    try {
        await positionService.deletePosition(id)
        await fetchPositions()
        Swal.fire({
            icon: 'success',
            title: t('positionPage.deleteSuccess'),
            showConfirmButton: false,
            timer: 1500,
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
    } catch (error) {
        console.error('Delete position error:', error)
        Swal.fire({
            icon: 'error',
            title: t('positionPage.deleteErrorTitle'),
            text: error?.response?.data?.error || error?.message || t('positionPage.deleteErrorText'),
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app').removeAttribute('aria-hidden')
            }
        })
    }
}

onMounted(() => {
    fetchPositions()
})
</script>

<style scoped></style>
