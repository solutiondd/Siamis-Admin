<template>
    <main class="min-h-screen grid place-items-center login-bg p-2 sm:p-4 relative">
        <button type="button"
            class="absolute top-4 right-4 z-10 btn btn-sm btn-ghost bg-white/90 backdrop-blur border border-blue-900/20 shadow-sm"
            @click="toggleLocale" :title="locale === 'th' ? 'Switch to English' : 'สลับเป็นไทย'">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.6 9h16.8" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.6 15h16.8" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.5 3a17.0 17.0 0 000 18" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12.5 3a17.0 17.0 0 010 18" />
            </svg>
            <span class="font-semibold">{{ currentLocaleLabel }}</span>
        </button>

        <section class="w-full max-w-md sm:max-w-md mx-auto" style="max-width: 420px;">
            <div class="card bg-base-100 shadow-xl animate-form">
                <div class="card-body p-4 sm:p-6">
                    <div class="flex flex-col items-center mb-4 animate-logo">
                        <img :src="logoUrl" alt="Chakkam Khanathon School Logo" class="school-logo mb-2" />
                        <!-- <div class="school-logo mb-2 flex items-center justify-center bg-gradient-to-r from-blue-500 to-yellow-400"
                            style="width: 100px; height: 100px; border-radius: 24px;">
                        </div> -->

                        <h2 class="school-title text-blue-900 font-bold text-xl sm:text-2xl text-center drop-shadow">
                            {{ t('auth.school') }}
                        </h2>
                        <div class="text-blue-900 font-medium text-base sm:text-lg text-center drop-shadow mb-1">
                            {{ t('auth.province') }}
                        </div>
                    </div>

                    <form @submit.prevent="onSubmit" class="space-y-4">
                        <div class="form-control">
                            <label class="label">
                                <span class="label-text">{{ t('auth.username') }}</span>
                            </label>
                            <input v-model.trim="form.username" type="text" class="input input-bordered"
                                :placeholder="t('login.usernamePlaceholder')" autocomplete="username" />
                            <p v-if="errors.username" class="mt-1 text-error text-sm">{{ errors.username }}</p>
                        </div>

                        <div class="form-control">
                            <label class="label">
                                <span class="label-text">{{ t('auth.password') }}</span>
                            </label>
                            <div class="relative">
                                <input :type="showPassword ? 'text' : 'password'" v-model.trim="form.password"
                                    class="input input-bordered w-full pr-16"
                                    :placeholder="t('login.passwordPlaceholder')" autocomplete="current-password" />
                                <button type="button"
                                    class="absolute top-1/2 right-4 -translate-y-1/2 btn btn-ghost btn-xs font-medium text-blue-900"
                                    @click="showPassword = !showPassword" style="min-width: 44px;">
                                    <span v-if="showPassword">{{ t('login.hide') }}</span>
                                    <span v-else>{{ t('login.show') }}</span>
                                </button>
                            </div>
                            <p v-if="errors.password" class="mt-1 text-error text-sm">{{ errors.password }}</p>
                        </div>

                        <div class="flex items-center justify-between flex-wrap gap-2">
                            <label class="label cursor-pointer gap-2">
                                <!-- <input type="checkbox" class="checkbox checkbox-sm" /> -->
                                <input type="checkbox" v-model="remember" class="checkbox checkbox-sm" />
                                <span class="label-text">{{ t('login.rememberMe') }}</span>
                            </label>
                        </div>


                        <div class="flex flex-wrap gap-2 items-center w-full">
                            <button type="submit"
                                class="btn btn-primary flex-1 min-w-[140px] sm:min-w-[180px] text-base sm:text-lg py-3 login-btn"
                                :disabled="loading">
                                <span v-if="loading" class="loading loading-spinner loading-sm"></span>
                                <span v-else>{{ t('login.login') }}</span>
                            </button>
                            <button v-if="deferredPrompt" type="button"
                                class="btn btn-circle btn-accent min-w-[44px] w-11 h-11 sm:min-w-[48px] sm:w-12 sm:h-12"
                                @click="installPWA" :title="t('login.installApp')">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" class="w-5 h-5 sm:w-6 sm:h-6 mx-auto">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 4v12m0 0l-4-4m4 4l4-4m-8 8h8" />
                                </svg>
                            </button>
                        </div>

                        <p v-if="formError" class="text-error text-sm text-center">{{ formError }}</p>
                        <p v-if="success" class="text-success text-sm text-center">{{ t('login.success') }}</p>
                    </form>
                </div>
            </div>
        </section>
    </main>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { UserService } from '../api/User.js'
import logoUrl from '../assets/swing.png'
import CryptoJS from '../utils/crypto.js'
import { useI18n } from 'vue-i18n'
import { setLocale } from '../i18n'

const router = useRouter()
const auth = useAuthStore()
const userService = new UserService()
const { t, locale } = useI18n()


const form = reactive({ username: '', password: '' })
const errors = reactive({ username: '', password: '' })
const remember = ref(false)
const loading = ref(false)
const formError = ref('')
const success = ref(false)
const showPassword = ref(false)

const currentLocaleLabel = computed(() => locale.value === 'th' ? 'TH' : 'EN')

function toggleLocale() {
    setLocale(locale.value === 'th' ? 'en' : 'th')
}

onMounted(() => {
    const savedUsername = localStorage.getItem('remember_username')
    const savedPassword = localStorage.getItem('remember_password')
    if (savedUsername && savedPassword) {
        form.username = savedUsername
        try {
            const bytes = CryptoJS.AES.decrypt(savedPassword, 'CKKSchool2025')
            form.password = bytes.toString(CryptoJS.enc.Utf8)
        } catch (e) {
            form.password = ''
        }
        remember.value = true
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
})

const deferredPrompt = ref(null)

function installPWA() {
    if (deferredPrompt.value) {
        deferredPrompt.value.prompt()
        deferredPrompt.value.userChoice.then((choiceResult) => {
            deferredPrompt.value = null
        })
    }
}

function handleBeforeInstallPrompt(e) {
    e.preventDefault()
    deferredPrompt.value = e
}

onBeforeUnmount(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
})

function validate() {
    errors.username = form.username ? '' : t('login.invalidUsername')
    errors.password = form.password ? '' : t('login.invalidPassword')
    return !errors.username && !errors.password
}

async function onSubmit() {
    if (loading.value) return
    formError.value = ''
    success.value = false
    if (!validate()) return
    loading.value = true
    try {
        const response = await userService.SignIn({
            username: form.username,
            password: form.password,
        })

        if (response && response.message === 'Success') {
            const token = response.data?.access_token
            const refreshToken = response.data?.data?.refresh_token

            if (!token) throw new Error('Token not found')

            let role = '';
            let profileName = '';
            let profilePicture = '';
            let classroom = '';
            let grade = '';
            try {
                const payloadBase64 = token.split('.')[1]
                    .replace(/-/g, '+')
                    .replace(/_/g, '/');
                const paddedPayload = payloadBase64 + '==='.slice(0, (4 - payloadBase64.length % 4) % 4);

                function base64UrlDecodeUnicode(str) {
                    const binary = atob(str);
                    const bytes = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) {
                        bytes[i] = binary.charCodeAt(i);
                    }
                    return new TextDecoder().decode(bytes);
                }
                const payloadJson = base64UrlDecodeUnicode(paddedPayload);
                const payload = JSON.parse(payloadJson);

                role = payload.role;
                profileName = payload.name || '';
                profilePicture = payload.picture || '';
                classroom = payload.classroom || '';
                grade = payload.grade || '';

                if (role) {
                    localStorage.setItem('residentRole', role);
                }
                if (profileName) {
                    localStorage.setItem('profileName', profileName);
                }
                if (profilePicture) {
                    localStorage.setItem('profilePicture', profilePicture);
                }
                localStorage.setItem('classroom', classroom);
                localStorage.setItem('grade', grade);
            } catch (e) {
                role = '';
                profileName = '';
                profilePicture = '';
                classroom = '';
                grade = '';
                console.error("Failed to decode token:", e);
            }

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            if (remember.value && refreshToken) {
                localStorage.setItem('refresh_token', refreshToken);
            } else {
                localStorage.removeItem('refresh_token');
            }
            if (remember.value) {
                localStorage.setItem('remember_username', form.username)
                const encrypted = CryptoJS.AES.encrypt(form.password, 'CKKSchool2025').toString()
                localStorage.setItem('remember_password', encrypted)
            } else {
                localStorage.removeItem('remember_username')
                localStorage.removeItem('remember_password')
            }
            await auth.initializeAuth()
            success.value = true
            setTimeout(() => {
                if (role === 'screen') {
                    router.push('/camera/select')
                } else {
                    router.push('/home')
                }
            }, 600)
        } else {
            throw new Error(t('auth.invalidLogin'))
        }
    } catch (e) {
        console.error('Login error:', e)

        let errorMessage = t('login.wrongCredentials')

        if (e.response?.status === 429) {
            errorMessage = t('login.tooManyAttempts')
        }

        if (e.response?.data) {
            const errorData = e.response.data

            if (e.response?.status === 429) {
                errorMessage = errorData.message || errorMessage
            } else if (errorData.message === 'Authentication failed') {
                if (errorData.error === 'Wrong password') {
                    errorMessage = t('login.wrongPassword')
                } else if (errorData.error === 'User not found') {
                    errorMessage = t('login.userNotFound')
                } else {
                    errorMessage = t('login.wrongCredentials')
                }
            } else if (errorData.message === 'Data not found') {
                errorMessage = t('login.noAccount')
            } else if (errorData.message) {
                errorMessage = errorData.message
            }
        }

        formError.value = errorMessage
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-bg {
    background: linear-gradient(135deg, #1e3a8a 60%, #ffd600 100%);
}

.school-logo {
    width: 100px;
    height: 100px;
    object-fit: contain;
    border-radius: 24px;
    animation: logo-pulse-smooth 2.2s ease-in-out infinite;
}

@keyframes logo-pulse-smooth {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.15);
    }

    100% {
        transform: scale(1);
    }
}

.school-title {
    color: #ffd600;
    text-shadow: 1px 1px 0 #1e3a8a, 0 2px 8px #1e3a8a33;
    letter-spacing: 1px;
}

.card {
    border: 2px solid #1e3a8a;
    border-radius: 1.5rem;
    background: rgba(255, 255, 255, 0.95);
}

.card-title {
    color: #1e3a8a;
}

.btn-primary.login-btn {
    background: linear-gradient(90deg, #1e3a8a 70%, #ffd600 100%);
    color: #fff;
    border: none;
    transition: transform 0.18s cubic-bezier(.68, -0.55, .27, 1.55), box-shadow 0.18s;
    box-shadow: 0 2px 8px #1e3a8a22;
}

.btn-primary.login-btn:hover:not(:disabled) {
    transform: scale(1.06);
    box-shadow: 0 4px 16px #ffd60044;
    background: linear-gradient(90deg, #1e3a8a 50%, #ffd600 100%);
}

.input,
.input-bordered {
    border: 1.5px solid #1e3a8a;
    background: #fff;
}

.label-text {
    color: #1e3a8a;
    font-weight: 500;
}

.text-error {
    color: #e53935;
}

.text-success {
    color: #43a047;
}

.animate-form {
    animation: form-fade-in-up-normal 1.1s cubic-bezier(.4, 0, .2, 1) both;
    will-change: opacity, transform, filter;
}

@keyframes form-fade-in-up-normal {
    0% {
        opacity: 0;
        transform: translateY(0);
        filter: blur(0);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
        filter: blur(0);
    }
}

@media (max-width: 640px) {
    .card-body {
        padding: 1.5rem !important;
    }

    .card-title {
        font-size: 1.25rem !important;
    }

    .input,
    .input-bordered {
        font-size: 1rem !important;
        padding: 0.75rem !important;
    }

    .btn-primary {
        font-size: 1rem !important;
        padding-top: 0.75rem !important;
        padding-bottom: 0.75rem !important;
    }

    .school-logo {
        width: 80px;
        height: 80px;
    }

    .school-title {
        font-size: 1.1rem;
    }

    section {
        max-width: 95vw !important;
    }
}
</style>