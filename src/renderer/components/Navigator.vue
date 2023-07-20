<script setup>
import { inject } from 'vue';
const { backward, forward } = inject('appRoute')
</script>

<template>
    <div class="navigator">
        <svg @click="backward" width="18" height="18" viewBox="0 0 455.71 818.05" xmlns="http://www.w3.org/2000/svg">
            <g id="Layer_2" data-name="Layer 2">
                <g id="Layer_1-2" data-name="Layer 1">
                    <path
                        d="M101.17,405.1c2.89,1.94,5,2.89,6.47,4.41Q274.29,576.23,440.9,743c13.06,13.06,18.24,28.17,12.47,46-9.58,29.54-46.92,38.79-69.57,17.37-7.87-7.44-15.35-15.29-23-23L15.22,437.44C-5,417.2-5.07,392.34,15,372.23Q193.44,193.58,371.81,14.88C380.93,5.74,391.29-.19,404.44,0c17.18.25,30.24,8,37.94,23.27,7.79,15.43,6.19,30.66-3.89,44.78a60.83,60.83,0,0,1-6.7,7.4Q269.45,238,107.05,400.5C105.77,401.78,104.18,402.76,101.17,405.1Z" />
                </g>
            </g>
        </svg>
        <svg @click="forward" width="18" height="18" class="spacing" viewBox="0 0 455.71 818.08"
            xmlns="http://www.w3.org/2000/svg">
            <g id="Layer_2" data-name="Layer 2">
                <g id="Layer_1-2" data-name="Layer 1">
                    <g id="Layer_2-2" data-name="Layer 2">
                        <g id="Layer_1-2-2" data-name="Layer 1-2">
                            <path
                                d="M354.54,413c-2.89-1.94-5-2.89-6.47-4.41Q181.42,241.85,14.81,75.08C1.75,62-3.43,46.91,2.34,29.08,11.92-.46,49.26-9.71,71.91,11.71c7.87,7.44,15.35,15.29,23,23L440.49,380.64c20.22,20.24,20.29,45.1.22,65.21Q262.27,624.5,83.9,803.2c-9.12,9.14-19.48,15.07-32.63,14.88-17.18-.25-30.24-8-37.94-23.27C5.54,779.38,7.14,764.15,17.22,750a61.07,61.07,0,0,1,6.7-7.4q162.34-162.55,324.74-325C349.94,416.3,351.53,415.32,354.54,413Z" />
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    </div>
</template>

<style scoped>
.navigator {
    display: flex;
    align-items: center;
}

.navigator .spacing {
    margin-left: 16px;
}

.navigator svg {
    fill: var(--button-icon-btn-color);
    cursor: pointer;
    -webkit-app-region: none;
}

.navigator svg:hover {
    fill: #28c83f;
    fill: var(--content-highlight-color);
}
</style>