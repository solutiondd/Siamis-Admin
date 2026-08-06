<template>
    <div class="modal-bg">
        <div class="modal-content">
            <h2 class="text-xl font-bold mb-4">{{ $t('BehaviorUpdate.title') }}</h2>
            <form @submit.prevent="handleUpdate">
                <div v-if="type === 'type'">
                    <label>{{ $t('BehaviorUpdate.typeNameLabel') }}</label>
                    <input v-model="form.name" class="input input-bordered w-full" />
                </div>
                <div v-else-if="type === 'behavior'">
                    <label>{{ $t('BehaviorUpdate.behaviorNameLabel') }}</label>
                    <input v-model="form.name" class="input input-bordered w-full" />
                </div>
                <div v-else-if="type === 'level'" class="max-w-xl">
                    <label>{{ $t('BehaviorUpdate.levelNameLabel') }}</label>
                    <input v-model="form.name" class="input input-bordered w-full mb-2" />
                    <label>{{ $t('BehaviorUpdate.levelLabel') }}</label>
                    <input v-model="form.level" class="input input-bordered w-full mb-2" />
                    <label>{{ $t('BehaviorUpdate.scoreLabel') }}</label>
                    <input v-model="form.score" class="input input-bordered w-full mb-2" />
                </div>
                <div class="flex gap-2 mt-4">
                    <button type="submit" class="btn btn-primary">{{ $t('BehaviorUpdate.saveBtn') }}</button>
                    <button type="button" class="btn btn-secondary" @click="$emit('close')">{{ $t('BehaviorUpdate.cancelBtn') }}</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { BehaviorService } from '../../api/behavior';
import Swal from 'sweetalert2';

export default {
    name: 'Update',
    props: {
        type: { type: String, required: true },
        data: { type: Object, required: true }
    },
    data() {
        return {
            form: { ...this.data },
            service: new BehaviorService(),
            loading: false,
            error: null
        };
    },
    methods: {
        async handleUpdate() {
            this.loading = true;
            try {
                if (this.type === 'type') {
                    await this.service.updateBehaviortype(this.form._id, { name: this.form.name });
                } else if (this.type === 'behavior') {
                    await this.service.updateBehavior(this.form._id, { name: this.form.name });
                } else if (this.type === 'level') {
                    await this.service.updateBehaviorLevel(this.form._id, {
                        name: this.form.name,
                        level: this.form.level,
                        score: this.form.score
                    });
                }
                await Swal.fire({
                    icon: 'success',
                    title: this.$t('BehaviorUpdate.successTitle'),
                    text: this.$t('BehaviorUpdate.successText'),
                    timer: 1500,
                    showConfirmButton: false
                });
                this.$emit('updated');
                this.$emit('close');
            } catch (e) {
                this.error = this.$t('BehaviorUpdate.errorMessage');
                await Swal.fire({
                    icon: 'error',
                    title: this.$t('BehaviorUpdate.errorTitle'),
                    text: this.$t('BehaviorUpdate.errorText'),
                });
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>

<style scoped>
.modal-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: #fff;
    border-radius: 12px;
    padding: 32px 24px;
    min-width: 320px;
    max-width: 90vw;
}
</style>