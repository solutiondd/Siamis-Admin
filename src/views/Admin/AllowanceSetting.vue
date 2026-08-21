<template>
    <div class="container mx-auto p-4 max-w-5xl max-[944px]:pt-16">
        <div class="flex items-center gap-2 mb-6">
            <div>
                <h1 class="text-xl sm:text-2xl font-bold text-white">{{ t('allowanceSettingPage.title') }}</h1>
            </div>
        </div>

        <CardView :refresh-key="refreshKey" @edit-all="openEditModal" />

        <UpdateModal :is-open="isModalOpen" :rules="selectedRules" @close="isModalOpen = false"
            @success="handleUpdateSuccess" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CardView from '../../components/Allowance Setting/CardView.vue';
import UpdateModal from '../../components/Allowance Setting/Update.vue';

const { t } = useI18n();

const refreshKey = ref(0);
const isModalOpen = ref(false);
const selectedRules = ref([]);

const openEditModal = (rules) => {
    selectedRules.value = rules;
    isModalOpen.value = true;
};

const handleUpdateSuccess = () => {
    refreshKey.value++;
    isModalOpen.value = false;
};
</script>