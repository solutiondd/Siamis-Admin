<template>
    <main class="min-h-screen flex items-center justify-center bg-base-200">
        <div class="text-center">
            <h1 class="text-3xl font-semibold">{{ t('home.title') }}</h1>
            <p class="mt-2 text-base-content/70">{{ t('home.subtitle') }}</p>
        </div>
    </main>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped></style>