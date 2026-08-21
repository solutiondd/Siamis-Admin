<template>
    <div>
        <button @click="openPopup" class="btn btn-primary">{{ $t('MeritCreate.addItem') }}</button>
        <div v-if="showPopup" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div
                class="bg-white rounded-lg shadow-lg p-4 w-full max-w-xs sm:max-w-md relative max-h-full overflow-y-auto">
                <button @click="closePopup" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h3 class="text-lg font-bold mb-4 text-primary">{{ $t('MeritCreate.addItem') }}</h3>
                <form @submit.prevent="handleSubmit">
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-1">{{ $t('MeritCreate.itemNameLabel') }}</label>
                        <input v-model="form.name" type="text" class="input input-bordered w-full"
                            :placeholder="$t('MeritCreate.itemNamePlaceholder')" required />
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-1">{{ $t('MeritCreate.scoreLabel') }}</label>
                        <input v-model="form.score" type="number" class="input input-bordered w-full"
                            :placeholder="$t('MeritCreate.scorePlaceholder')" min="1" required />
                    </div>
                    <div class="mt-6 flex justify-end">
                        <button type="submit" class="btn btn-primary" :disabled="loading">
                            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
                            <span v-else>{{ $t('MeritCreate.save') }}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { MeritService } from '../../api/merit.js'
import Swal from 'sweetalert2'

const { t } = useI18n()
const emit = defineEmits(['created'])
const showPopup = ref(false)
const loading = ref(false)
const form = ref({ name: '', score: '' })

function openPopup() {
    showPopup.value = true
    form.value = { name: '', score: '' }
}
function closePopup() {
    showPopup.value = false
}

async function handleSubmit() {
    loading.value = true
    try {
        const service = new MeritService()
        await service.createMeritType({ name: form.value.name, score: form.value.score })
        closePopup()
        Swal.fire({
            icon: 'success',
            title: t('MeritCreate.swalSaveSuccessTitle'),
            text: t('MeritCreate.swalSaveSuccessText'),
        })
        emit('created')
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: t('MeritCreate.swalErrorTitle'),
            text: err?.response?.data?.error || err?.message || t('MeritCreate.swalSaveErrorText'),
        })
    }
    loading.value = false
}
</script>

<style scoped>
.input {
    margin-bottom: 0.5rem;
}
</style>