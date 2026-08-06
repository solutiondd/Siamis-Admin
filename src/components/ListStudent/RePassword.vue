<template>
    <dialog ref="dialogRef" class="modal">
        <div class="modal-box">
            <h3 class="font-bold text-lg mb-2">{{ $t('StudentRePassword.title') }}</h3>
            <p class="mb-4">{{ $t('StudentRePassword.confirmText', { name: user?.name }) }}</p>
            <div class="flex justify-end gap-2">
                <button class="btn btn-sm" @click="close" :disabled="loading">{{ $t('StudentRePassword.cancel')
                    }}</button>
                <button class="btn btn-sm btn-success" @click="confirmReset" :disabled="loading">
                    <span v-if="loading" class="loading loading-spinner loading-xs"></span>
                    <span v-else>{{ $t('StudentRePassword.reset') }}</span>
                </button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop" @click="close">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

const { t } = useI18n()
const dialogRef = ref(null)
const user = ref(null)
const loading = ref(false)
const emit = defineEmits(['success'])

function open(targetUser) {
    user.value = targetUser
    dialogRef.value?.showModal()
}

function close() {
    dialogRef.value?.close()
    user.value = null
    loading.value = false
}

async function confirmReset() {
    if (!user.value) return
    loading.value = true
    try {
        const token = localStorage.getItem('token')
        await axios.post(
            `${import.meta.env.VITE_APP_BASE_URL}users/${user.value.id}/resetpassword`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        close()
        const { default: Swal } = await import('sweetalert2')
        await Swal.fire({
            icon: 'success',
            title: t('StudentRePassword.successTitle'),
            showConfirmButton: false,
            timer: 1500,
            didOpen: () => {
                document.getElementById('app')?.removeAttribute('aria-hidden')
            }
        })
        emit('success')
    } catch (e) {
        close()
        const { default: Swal } = await import('sweetalert2')
        await Swal.fire({
            icon: 'error',
            title: t('StudentRePassword.errorTitle'),
            text: e?.response?.data?.error || e?.message || t('StudentRePassword.errorDefaultText'),
            confirmButtonColor: '#2563eb',
            didOpen: () => {
                document.getElementById('app')?.removeAttribute('aria-hidden')
            }
        })
    } finally {
        loading.value = false
    }
}

defineExpose({ open })
</script>