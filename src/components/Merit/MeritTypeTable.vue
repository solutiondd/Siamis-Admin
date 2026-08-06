<template>
    <div class="card bg-base-100 shadow-md">
        <div class="card-body">
            <div v-if="loading" class="flex justify-center py-8">
                <span class="loading loading-spinner loading-lg text-primary"></span>
            </div>
            <div v-else-if="meritTypes.length === 0" class="text-center py-8 text-base-content/60">
                {{ $t('MeritMeritTypeTable.noData') }}
            </div>
            <div v-else class="overflow-x-auto">
                <table class="table table-zebra">
                    <thead>
                        <tr>
                            <th class="w-10 md:w-20">{{ $t('MeritMeritTypeTable.hashHeader') }}</th>
                            <th>{{ $t('MeritMeritTypeTable.itemHeader') }}</th>
                            <th>{{ $t('MeritMeritTypeTable.scoreHeader') }}</th>
                            <th class="w-10 md:w-24 text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in meritTypes" :key="item._id">
                            <td>{{ index + 1 }}</td>
                            <td class="font-medium">{{ item.name }}</td>
                            <td>{{ item.score }}</td>
                            <td>
                                <div class="flex justify-center gap-4">
                                    <button class="bg-transparent border-none shadow-none p-0" @click="editMerit(item)"
                                        :title="$t('MeritMeritTypeTable.editTitle')">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                            viewBox="0 0 24 24" stroke="#fbbf24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button class="bg-transparent border-none shadow-none p-0"
                                        @click="deleteMerit(item)" :title="$t('MeritMeritTypeTable.deleteTitle')">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                            viewBox="0 0 24 24" stroke="#ef4444">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <UpdateMerit v-if="showUpdate" :merit="selectedMerit" @close="showUpdate = false; selectedMerit = null"
                @updated="getMeritTypes" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { MeritService } from '../../api/merit.js'
import UpdateMerit from './Update.vue'
import Swal from 'sweetalert2'

const { t } = useI18n()
const showUpdate = ref(false)
const selectedMerit = ref(null)

function editMerit(item) {
    selectedMerit.value = item
    showUpdate.value = true
}

async function deleteMerit(item) {
    const result = await Swal.fire({
        title: t('MeritMeritTypeTable.confirmDeleteTitle'),
        text: t('MeritMeritTypeTable.confirmDeleteText', { name: item.name }),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: t('MeritMeritTypeTable.confirmButton'),
        cancelButtonText: t('MeritMeritTypeTable.cancelButton'),
        confirmButtonColor: '#d33',
    })
    if (result.isConfirmed) {
        try {
            const service = new MeritService()
            await service.deleteMeritType(item._id)
            Swal.fire({
                icon: 'success',
                title: t('MeritMeritTypeTable.swalDeleteSuccessTitle'),
                text: t('MeritMeritTypeTable.swalDeleteSuccessText'),
            })
            getMeritTypes()
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: t('MeritMeritTypeTable.swalErrorTitle'),
                text: err?.response?.data?.error || err?.message || t('MeritMeritTypeTable.swalDeleteErrorText'),
            })
        }
    }
}

const meritTypes = ref([])
const loading = ref(false)

onMounted(getMeritTypes)
defineExpose({ getMeritTypes })

async function getMeritTypes() {
    loading.value = true
    try {
        const service = new MeritService()
        const res = await service.getMeritTypes()
        meritTypes.value = Array.isArray(res.data) ? res.data : []
    } catch (err) {
        meritTypes.value = []
    }
    loading.value = false
}
</script>

<style scoped>
.card {
    margin: 0.5rem 0;
    /* max-width: 900px; */
    margin-left: auto;
    margin-right: auto;
}

.table-zebra th {
    background: #f3f4f6;
    font-weight: 700;
    color: #1e293b;
    text-align: left;
}

.table-zebra td {
    color: #334155;
    background: #fff;
    font-size: 1rem;
}

.table-zebra tr:hover td {
    background: #f1f5f9;
}

@media (max-width: 600px) {
    .card-body {
        padding: 0.5rem;
    }

    .table-zebra th,
    .table-zebra td {
        padding: 0.5rem 0.75rem;
        font-size: 0.95rem;
    }
}

button.bg-transparent {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}
</style>