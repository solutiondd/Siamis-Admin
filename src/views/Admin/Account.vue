<template>
    <div class="space-y-6 max-[944px]:pt-14">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-white">{{ t('accountPage.title') }}</h1>
            <button v-if="auth.user?.role !== 'admin'" class="btn btn-primary" @click="openCreateModal">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                {{ t('accountPage.add') }}
            </button>
        </div>

        <AccountTable :admins="admins" :loading="loading" @delete="openDeleteModal" />

        <CreateModal :is-open="isCreateModalOpen" @close="closeCreateModal" @success="handleCreateSuccess" />

        <DeleteModal :is-open="isDeleteModalOpen" :admin="selectedAdmin" @close="closeDeleteModal"
            @success="handleDeleteSuccess" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import AccountTable from '../../components/Account/Table.vue'
import CreateModal from '../../components/Account/Create.vue'
import DeleteModal from '../../components/Account/Delete.vue'
import { AccountService } from '../../api/account'
import { useAuthStore } from '../../stores/auth'
import { useI18n } from 'vue-i18n'
const auth = useAuthStore()
const { t } = useI18n()

const accountService = new AccountService()

const admins = ref([])
const loading = ref(false)
const isCreateModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedAdmin = ref(null)

const fetchAdmins = async () => {
    loading.value = true
    try {
        const response = await accountService.getAdmins()
        if (response.message === 'Success' && response.data) {
            admins.value = response.data
        }
    } catch (error) {
        console.error('Fetch admins error:', error)
    } finally {
        loading.value = false
    }
}

const openCreateModal = () => {
    isCreateModalOpen.value = true
}

const closeCreateModal = () => {
    isCreateModalOpen.value = false
}

const handleCreateSuccess = () => {
    closeCreateModal()
    fetchAdmins()
    setTimeout(() => {
        Swal.fire({
            title: t('accountPage.createSuccess'),
            icon: 'success',
            showCancelButton: false,
            confirmButtonColor: '#2563eb',
            confirmButtonText: t('common.ok'),
            allowOutsideClick: true,
            didOpen: () => {
                const appElement = document.getElementById('app')
                if (appElement) {
                    appElement.removeAttribute('aria-hidden')
                }
            }
        })
    }, 300)
}

const openDeleteModal = (admin) => {
    selectedAdmin.value = admin
    isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
    isDeleteModalOpen.value = false
    selectedAdmin.value = null
}

const handleDeleteSuccess = () => {
    closeDeleteModal()
    fetchAdmins()
    setTimeout(() => {
        Swal.fire({
            title: t('accountPage.deleteSuccess'),
            icon: 'success',
            showCancelButton: false,
            confirmButtonColor: '#2563eb',
            confirmButtonText: t('common.ok'),
            allowOutsideClick: true,
            didOpen: () => {
                const appElement = document.getElementById('app')
                if (appElement) {
                    appElement.removeAttribute('aria-hidden')
                }
            }
        })
    }, 300)
}

onMounted(() => {
    fetchAdmins()
})
</script>

<style scoped></style>
