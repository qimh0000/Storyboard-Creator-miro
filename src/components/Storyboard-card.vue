<script setup>
import OpenAI from "openai";
import { ref } from "vue";
import { generate } from "@vue/compiler-core";
const m_apiKey = ref("");
const passAPI = ref({ a: false });

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
                        borderColor: '#D9D9D9',
                        fillColor: '#D9D9D9',
                    },
                    x: viewport.x + viewport.width / 2 + i * 1200,
                    y: viewport.y + viewport.height / 2,
                    width: 1100,
                    height: 1600,
                    rotation: 0.0,
                })
                const imageCardText = await miro.board.createShape({
                    shape: 'rectangle',
                    style: {
                        borderColor: '#ffffff',
                        fillColor: '#ffffff',
                    },
                    x: imageCard.x,
                    y: imageCard.y + 531,
                    width: 1024,
                    height: 462,
                    rotation: 0.0,
                })
                // const cardPrompt = await miro.board.createCard({
                //     title: prompts.value[i].promptValue,
                //     style: {
                //         cardTheme: '#575757',
                //     },
                //     x: imageCard.x,
                //     y: imageCard.y + 531,
                //     width: 1024,
                //     height: 462,
                //     rotation: 0.0,
                // });
                const cardPrompt = await miro.board.createText({
                    content: prompts.value[i].promptValue,
                    style: {
                        fontSize: 55,
                    },
                    x: imageCard.x,
                    y: imageCard.y + 531,
                    width: 957,
                    rotation: 0.0,
                });
                console.log(imageCard.x, imageCard.y)
                // 產出圖像
                console.log(image_url);
                const image = await miro.board.createImage({
                    title: prompts.value[i].promptValue,
                    url: image_url,
                    x: imageCard.x, // Default value: horizontal center of the board
                    y: imageCard.y - 250, // Default value: vertical center of the board
                    width: 1024, // Set either 'width', or 'height'
                    rotation: 0.0,
                });
                console.log("image.x = " + image.x, "image.y = " + image.y)
            } catch (err) {
                console.log(err);
            }
        }
    }
}

function autoGrow() {
    element = document.getElementsByClassName('prompt-input')
    element.style.height = "5px";
    element.style.height = (element.scrollHeight) + "px";
}

function APISubmit() {
    if (m_apiKey.value != "") {
        passAPI.value.a = true;
        console.log(passAPI)
    }
    else {
        passAPI.value.a = false;
        console.log(passAPI)
    }

}
</script>

<template>

    <div class="wrap">
        <div class="API-input-container" v-if="passAPI.a === false">
            <input class="input input-small" type="text" placeholder="API Key" v-model="m_apiKey">
            <button class="button button-primary button-small" @click="APISubmit()">Send</button>
        </div>
        <div class="grid wrapper" v-else>
            <div class="cs1 ce12">
                <div class="form-group-small" v-for="(prompt, index) in prompts" :key="prompt.id" :promptext="prompt">

                    <div class="input-wrap">
                        <div class="input-left">
                            <label style="margin-bottom: 0;">{{ index + 1 }}</label>
                            <button class="button button-small remove" @click="prompts.splice(index, 1)">X</button>
                        </div>

                        <textarea class="input input-small prompt-input" type="text" placeholder="寫下文字說明"
                            style="width: 85%;max-width: 85%;min-width: 85%;min-height: 70px;" v-model="prompt.promptValue"
                            v-on:input="autoGrow(this)"></textarea>
                    </div>
                </div>
            </div>
            <div class="cs1 ce12">
                <button class="button button-primary button-small" @click="addShot()">Add Shot</button>
                <button class="button button-primary button-small" @click="generatePrompt()">Generate</button>
            </div>
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
    padding: 13px !important;
}

.remove:hover {
    background-color: #5a5a5a;
}

.input-wrap {
    display: flex;
    align-items: top;
    justify-content: space-between;
}

.input-left{
    display: flex;
    flex-direction: column;
    align-items: left;
    justify-content: space-between;
}
</style>
