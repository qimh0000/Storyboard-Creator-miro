<script setup>
import { ref } from "vue";

let nextPromptCount = 2

const prompts = ref([{
    id: 1,
    promptValue: ""
}])


function addShot() {

    prompts.value.push({
        id: nextPromptCount++,
        promptValue: "",
    });
}
// async function addSticky() {
//   const stickyNote = await miro.board.createStickyNote({
//     content: 'Hello, World!',
//   });

//   await miro.board.viewport.zoomTo(stickyNote);
// }
// addSticky()
</script>

<template>
    <div class="grid wrapper">
        <div class="cs1 ce12">
            <div class="form-group-small" v-for="(prompt, index) in prompts" :key="prompt.id">
                <label style="margin-bottom: 0;">{{ index + 1 }}</label>
                <div class="input-wrap">
                    <input class="input input-small" type="text" placeholder="寫下文字說明" style="width: 85%;">
                    <button class="button button-small remove" @click="prompts.splice(index, 1)">X</button>
                </div>
            </div>
        </div>
        <div class="cs1 ce12">
            <button class="button button-primary button-small" @click="addShot()">Add Shot</button>
            <button class="button button-primary button-small">Generate</button>
        </div>
    </div>

</template>

<style>
.form-group-small {
    margin-bottom: 1rem;
}

.input {
    margin: 0.3rem 0;
}

.remove {
    background-color: #acacac;
    transition: 0.2s;
    color: white;
}

.remove:hover {
    background-color: #5a5a5a;
}

.input-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>
