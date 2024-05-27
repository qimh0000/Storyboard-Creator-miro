<script setup>
import OpenAI from "openai";
import { ref } from "vue";
import { generate } from "@vue/compiler-core";
const m_apiKey = ref("");


let nextPromptCount = 2
const prompts = ref([{
    id: 1,
    promptValue: ""
}]);
defineExpose({
    prompts, nextPromptCount
})

function addShot() {
    prompts.value.push({
        id: nextPromptCount++,
        promptValue: "",
    });
}

async function generatePrompt() {
    const viewport = await miro.board.viewport.get();
    if (m_apiKey.value != "") {
        const client = new OpenAI({ apiKey: m_apiKey.value, dangerouslyAllowBrowser: true })
        for (var i = 0; i < prompts.value.length; i++) {
            // post our prompt to our backend
            try {
                const response = await client.images.generate({
                    model: "dall-e-3",
                    prompt: prompts.value[i].promptValue,
                    n: 1,
                    size: "1024x1024"
                })
                const image_url = response.data[0].url

                // 產出故事卡格式
                const imageCard = await miro.board.createShape({
                    shape: 'rectangle',
                    style: {
                        color: '#1c1c1e',
                        fillcolor: '#ffffff',
                    },
                    x: viewport.x + viewport.width / 2 + i * 600,
                    y: viewport.y + viewport.height / 2,
                    width: 1100,
                    height: 1600,
                })

                // 產出圖像
                console.log(image_url);
                const image = await miro.board.createImage({
                    title: prompts.value[i].promptValue,
                    url: image_url,
                    x: viewport.x + viewport.width / 2 + i * 600, // Default value: horizontal center of the board
                    y: viewport.y + viewport.height / 2, // Default value: vertical center of the board
                    width: 1024, // Set either 'width', or 'height'
                    rotation: 0.0,
                });
            } catch (err) {
                console.log(err);
            }
        }
    }
}

const OpenAIKeyRef = ref(null);

// async function addSticky() {
//   const stickyNote = await miro.board.createStickyNote({
//     content: 'Hello, World!',
//   });

//   await miro.board.viewport.zoomTo(stickyNote);
// }
// addSticky()
</script>

<template>
    <input class="input input-small" type="text" placeholder="API Key" v-model="m_apiKey">
    <div class="grid wrapper">
        <div class="cs1 ce12">
            <div class="form-group-small" v-for="(prompt, index) in prompts" :key="prompt.id" :promptext="prompt">
                <label style="margin-bottom: 0;">{{ index + 1 }}</label>
                <div class="input-wrap">
                    <input class="input input-small" type="text" placeholder="寫下文字說明" style="width: 85%;"
                        v-model="prompt.promptValue">
                    <button class="button button-small remove" @click="prompts.splice(index, 1)">X</button>
                </div>
            </div>
        </div>
        <div class="cs1 ce12">
            <button class="button button-primary button-small" @click="addShot()">Add Shot</button>
            <button class="button button-primary button-small" @click="generatePrompt()">Generate</button>
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
