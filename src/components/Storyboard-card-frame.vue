<script setup>
import OpenAI from "openai";
import { ref, onMounted, reactive } from "vue";
import { generate } from "@vue/compiler-core";
const m_apiKey = ref("");
const passAPI = ref({ a: false });
const is_generate = ref({ a: false });
const is_overload = ref({ a: false });
const errorMessage = ref("");
const imageStyles = reactive([
    {
        title: "Illustration",
        is_active: true,
        prompt: "2D animation scene with low saturation depicted in a subtle,",
    },
    {
        title: "Line",
        is_active: false,
        prompt: "black and white sketch paint by crayon,",
    },
    {
        title: "Realistic",
        is_active: false,
        prompt: "clear photographic,",
    }
]);
const activeStyle = ref("Illustration");
let stylePrompt = imageStyles[0].prompt;

let nextPromptCount = 2
const prompts = ref([{
    id: 1,
    promptValue: "",
    correct: true,
}]);
defineExpose({
    prompts, nextPromptCount
})

onMounted(() => {
    var i, styles;

    styles = document.getElementsByClassName("image-style");
    for (i = 0; i < styles.length; i++) {
        styles[i].className = styles[i].className.replace("active", "");
    }

})

function chooseStyle() {
    for (var i = 0; i < imageStyles.length; i++) {
        if (activeStyle.value === imageStyles[i].title) {
            imageStyles[i].is_active = true;
            stylePrompt = imageStyles[i].prompt;
        }
        else
            imageStyles[i].is_active = false;
    }
}

function addShot() {
    errorMessage.value = "";
    if (prompts.value.length < 9) {
        is_overload.value.a = false;
        prompts.value.push({
            id: nextPromptCount++,
            promptValue: "",
            correct: true,
        });
    }
    else if(prompts.value.length == 9){
        is_overload.value.a = true;
        prompts.value.push({
            id: nextPromptCount++,
            promptValue: "",
            correct: true,
        });
    }
    else{
        is_overload.value.a = true;
    }
}

async function generatePrompt() {
    errorMessage.value = "";
    const viewport = await miro.board.viewport.get();
    if (prompts.value.length > 0) {
        is_generate.value.a = true;
        const client = new OpenAI({ apiKey: m_apiKey.value, dangerouslyAllowBrowser: true })
        // const imageCardContainer = await miro.board.createFrame({
        //     style: {
        //         fillColor: '#ffffff',
        //     },
        //     x: viewport.x + viewport.width / 2 + (prompts.value.length - 1) * 600,
        //     y: viewport.y + viewport.height / 2,
        //     width: prompts.value.length * 1200 + 400,
        //     height: 2000,
        // })
        for (var i = 0; i < prompts.value.length; i++) {
            if (prompts.value[i].promptValue != "") {
                try {
                    const response = await client.images.generate({
                        model: "dall-e-3",
                        prompt: stylePrompt + prompts.value[i].promptValue,
                        n: 1,
                        size: "1024x1024"
                    })
                    const image_url = response.data[0].url
                    console.log(stylePrompt + prompts.value[i].promptValue)
                    // 產出故事卡格式
                    const imageCard = await miro.board.createFrame({
                        title: prompts.value[i].promptValue,
                        style: {
                            fillColor: '#D9D9D9',
                        },
                        x: viewport.x + viewport.width / 2 + i * 1200,
                        y: viewport.y + viewport.height / 2,
                        width: 1100,
                        height: 1600,
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

                    await imageCard.add(imageCardText)
                    await imageCard.add(cardPrompt)
                    await imageCard.add(image)
                    const imageCardContainer = [imageCard, imageCardText, cardPrompt, image]
                    const imageCardGroup = await miro.board.group({ items: imageCardContainer })
                    prompts.value[i].correct = true;
                } catch (err) {
                    prompts.value[i].correct = false;
                    if (err.code === "content_policy_violation") {
                        errorMessage.value = "說明不符合規範";
                    }
                    else if (err.code === "invalid_api_key") {
                        errorMessage.value = "API key 錯誤"
                        passAPI.value.a = false;
                    }
                    else {
                        errorMessage.value = err.message;
                    }
                    console.log(err);
                }
            }
            else {
                errorMessage.value = "請輸入說明";
                prompts.value[i].correct = false;
            }
        }
        is_generate.value.a = false;
    }
    else {
        errorMessage.value = "請按 + 新增欄位";
    }
}

async function reload() {

}

function APISubmit() {
    if (m_apiKey.value != "") {
        passAPI.value.a = true;
        errorMessage.value = "";
    }
    else {
        passAPI.value.a = false;
        errorMessage.value = "請輸入 API key"
    }

}
</script>

<template>

    <div class="wrap">
        <div class="API-input-container" v-if="passAPI.a === false">
            <input class="input input-small" type="text" placeholder="API Key" v-model="m_apiKey">
            <p style="margin:0;color: red;">{{ errorMessage }}</p>
            <button class="button button-primary button-small" @click="APISubmit()">送出</button>
        </div>
        <div class="wrapper" v-else>
            <div class="main-container">
                <div class="choose-style" style="display: flex;flex-direction: row;justify-content: space-between;">
                    <button class="image-style" :class="[imageStyles[0].is_active ? 'active' : '']"
                        @click="activeStyle = 'Illustration', chooseStyle()">日式動畫</button>
                    <button class="image-style" :class="[imageStyles[1].is_active ? 'active' : '']"
                        @click="activeStyle = 'Line', chooseStyle()">黑白插畫</button>
                    <button class="image-style" :class="[imageStyles[2].is_active ? 'active' : '']"
                        @click="activeStyle = 'Realistic', chooseStyle()">寫實攝影</button>
                </div>

                <div class="cs1 ce12 prompt-wrap">
                    <div class="form-group-small" v-for="(prompt, index) in prompts" :key="prompt.id"
                        :promptext="prompt">

                        <div class="input-wrap">
                            <div class="input-left">
                                <div class="prompt-index"
                                    v-bind:style="[prompt.correct ? { 'background-color': '#7b7c82' } : { 'background-color': '#ff4242' }]">
                                    <p style="margin-bottom: 0;">{{ index + 1 }}</p>
                                </div>
                                <button class="button button-small remove" @click="prompts.splice(index, 1),is_overload.a = false;">X</button>
                            </div>
                            <div class="text-input-area">
                                <textarea class="input input-small prompt-input" type="text" placeholder="寫下文字說明"
                                    v-model="prompt.promptValue"></textarea>
                            </div>
                        </div>
                    </div>
                    <p style="margin:0;color: red;">{{ errorMessage }}</p>
                </div>
                <div class="prompt-control">
                    <div class="control-panel">
                        <button class="button button-primary button-small" @click="addShot()" v-bind:style="[is_overload.a ? {'background-color': '#bbbbbb', 'color': 'var(--blue700)' } : { 'background-color': 'var(--blue700)'}]">+</button>
                        <button class="button button-primary button-small" @click="generatePrompt()"
                            :disabled='is_generate.a'
                            v-bind:style="[is_generate.a ? { 'background-color': '#bbbbbb', 'color': 'var(--blue700)' } : { 'background-color': 'var(--blue700)' }]">{{
                                is_generate.a ? "生成中..." : "生成" }}</button>
                    </div>
                    <div class="delete-all-wrap">
                        <!-- <button class="delete-all">Delete</button> -->
                    </div>
                </div>
            </div>
            <div class="generate-overlay" v-if="is_generate.a === true">
                <p>生成中...</p>
            </div>
        </div>

    </div>

</template>

<style>
.wrap,
.wrapper {
    height: 100%;
}

button {
    transition: 0.18s;
}

.form-group-small {
    margin-bottom: 1rem;
}

.prompt-index {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 37px;
    height: 25px;
    color: #ffffff;
    border-radius: 10%;
}

.prompt-index p {
    margin: 0;
}

.input {
    margin: 0.3rem 0;
}

.remove {
    background-color: #ffffff;
    border: 1px solid #ff4242;
    transition: 0.2s;
    color: #ff4242;
    padding: 13px !important;
}

.remove:hover {
    background-color: #ff4242;
    color: #ffffff;
}

.input-wrap {
    display: flex;
    align-items: top;
    justify-content: space-between;
}

.input-left {
    display: flex;
    flex-direction: column;
    margin: 5.5px 0;
    gap: 7.5px;
}

.text-input-area {
    width: 85%;
    display: flex;
    flex-direction: column;
}

.text-input-area textarea {
    max-width: 100%;
    min-width: 100%;
    min-height: 70px;
}

.choose-style {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 2rem;
}

.choose-style button {
    background-color: #ffffff;
    border-radius: 5px;
    padding: 0.5rem;
    border-color: none;
    cursor: pointer;
}

.choose-style button.active {
    background-color: #525252;
    color: #ffffff;
}

.control-panel {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
}

.prompt-control {
    position: fixed;
    display: flex;
    align-items: center;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #ffffff;
}

.control-panel button {
    margin: 1rem !important;
}

.delete-all-wrap {
    margin: 1rem;
}

.prompt-wrap {
    padding-bottom: 3rem;
}

.image-style:hover {
    background-color: #adabab;
}

.generate-overlay {
    display: flex;
    position: absolute;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    background-color: rgba(255, 255, 255, 0.85);
    opacity: 85%;
    transition: 0.2s;
}
</style>
