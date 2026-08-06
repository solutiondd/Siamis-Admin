<template>
    <header
        class="navbar bg-base-100 shadow-md px-6 max-[944px]:fixed max-[944px]:top-0 max-[944px]:left-0 max-[944px]:w-full max-[944px]:z-30">
        <button @click="toggleMobileMenu" class="btn btn-ghost btn-circle mr-2 max-[944px]:flex hidden">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>

        <div class="flex-1">
            <h1 class="text-xl font-semibold">{{ pageTitle }}</h1>
        </div>

        <div class="flex-none gap-4 items-center">
            <button class="btn btn-ghost btn-sm gap-2" @click="toggleLocale">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.6 9h16.8" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.6 15h16.8" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.5 3a17.0 17.0 0 000 18" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12.5 3a17.0 17.0 0 010 18" />
                </svg>
                {{ currentLocaleLabel }}
            </button>
            <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                    <div
                        class="w-10 rounded-full bg-secondary text-secondary-content flex items-center justify-center shadow-md overflow-hidden">
                        <img v-if="showProfileImage" :src="profilePictureUrl" alt="profile"
                            class="w-full h-full object-cover" @error="showProfileImage = false" />
                        <span v-else class="text-lg font-semibold">{{ getProfileInitial(profileName) }}</span>
                    </div>
                </div>
                <ul tabindex="0"
                    class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-72">
                    <li>
                        <a class="justify-between">
                            {{ profileName || t('common.profile') }}
                            <span class="badge">{{ residentRole }}</span>
                        </a>
                    </li>
                    <li><a @click="goToUpdatePassword">{{ t('updatePassword.title') }}</a></li>
                    <li><a @click="handleLogout">{{ t('common.logout') }}</a></li>
                </ul>
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Swal from 'sweetalert2'
import { useI18n } from 'vue-i18n'
import { setLocale } from '../i18n'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t, locale } = useI18n()

const emit = defineEmits(['toggleMobileMenu'])

const pageTitle = computed(() => {
    const path = route.path
    if (path.startsWith('/home/teacher') || path.startsWith('/home/student')) {
        return t('pageTitles.personnel')
    }
    if (path.startsWith('/home/department') || path.startsWith('/home/position') || path.startsWith('/home/classroom') || path.startsWith('/home/holidays')) {
        return t('pageTitles.structure')
    }
    if (path.startsWith('/home/device') || path.startsWith('/home/model')) {
        return t('pageTitles.device')
    }
    if (path.startsWith('/home/report')) {
        return t('pageTitles.report')
    }
    if (path.startsWith('/home/account')) {
        return t('pageTitles.account')
    }
    const titles = {
        'Dashboard': t('pageTitles.dashboard'),
        'Teacher': t('pageTitles.teacher'),
        'Student': t('pageTitles.student'),
        'Account': t('pageTitles.account')
    }
    return titles[route.name] || t('pageTitles.adminDefault')
})

const currentLocaleLabel = computed(() => locale.value === 'th' ? 'TH' : 'EN')

const toggleLocale = () => {
    setLocale(locale.value === 'th' ? 'en' : 'th')
}

const goToUpdatePassword = () => {
    router.push('/update-password')
}

const toggleMobileMenu = () => {
    emit('toggleMobileMenu')
}

const handleLogout = async () => {
    const result = await Swal.fire({
        title: t('confirm.logoutTitle'),
        text: t('confirm.logoutText'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: t('confirm.logoutConfirm'),
        cancelButtonText: t('confirm.logoutCancel'),
        reverseButtons: true
    })
    if (result.isConfirmed) {
        authStore.logout()
        localStorage.removeItem('profileName')
        localStorage.removeItem('profilePicture')
        localStorage.removeItem('residentRole')
        localStorage.removeItem('classroom')
        localStorage.removeItem('grade')
        router.push('/')
    }
}

const profileName = ref(localStorage.getItem('profileName') || '')
const profilePicture = ref(localStorage.getItem('profilePicture') || '')
const residentRole = ref(localStorage.getItem('residentRole') || '')

const profilePictureUrl = computed(() => {
    if (!profilePicture.value) return ''
    const baseUrl = import.meta.env.VITE_IMG_PROFILE_URL || ''
    return profilePicture.value.startsWith('http')
        ? profilePicture.value
        : baseUrl + profilePicture.value
})

const showProfileImage = ref(!!profilePicture.value)

const getProfileInitial = (name) => {
    if (!name) return 'A'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 3) {
        return (parts[1][0] || '') + (parts[2][0] || '')
    }
    if (parts.length === 2) {
        return (parts[0][0] || '') + (parts[1][0] || '')
    }
    return parts[0][0] || 'A'
}

watch(profilePicture, (val) => {
    showProfileImage.value = !!val
})
</script>

<style scoped></style>
