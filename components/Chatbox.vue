<template>
    <client-only>
    <div class="d-flex flex-column justify-content-center align-items-center ma-3 pt-4">
        <v-dialog v-model="showAskConfirmation" max-width="500px">
          <v-card>
            <v-card-title class="headline">Confirm Transaction</v-card-title>
            <v-card-text class="scrollable-text">
              <span class="text-h5">{{ messageModal }}</span>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="green" text @click="confirmTx(true)">
                Yes
              </v-btn>
              <v-btn color="red" text @click="confirmTx(false)">
                No
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
<!--         <v-btn
          fab
          fixed
          bottom
          right
          class="mb-5"
          color="#2B66B1"
          text="debug"
          @click="debugCreateTransaction"
        /> -->
        <v-card 
    
    variant="outlined">
        <v-card elevation="0" min-height="60vh">
          <v-card-title class="text-h5">SOLmate v1.0
          <v-btn
            icon
            small
            variant="text"
            color="#1a1a2e"
            @click="messages = []"
            elevation="0"
          >
            <v-icon>mdi-trash-can-outline</v-icon>
          </v-btn>
          <!-- refactor last buttno to be an small icon -->

        </v-card-title>
          <v-card-text>
              <v-list>
                <v-list-item
                  v-for="(item, i) in messages"
                  :key="i"
                  :class="item.user === 'me' ? 'text-left' : 'text-left'"
                >
                  <v-list-item-content>
                    <v-list-item-title class="d-flex align-items-center text-wrap">
                      <v-avatar
                        :color="item.user == 'me' ? '#2B66B1' : '#0F171E'"
                        size="36"
                      >
                        <span class="text-white">{{
                          item.user == 'me' ? 'J' : 'GI'
                        }}</span>
                      </v-avatar>
                      <span class="ml-3 scrollable-message" v-html="item.message"></span>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <!--  -->
            <v-progress-linear
              v-if="loading"
              indeterminate
              color="#1a1a2e"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
        <!--  no borders card  -->
        <!-- push to the bottom of the card -->
        <v-spacer></v-spacer>

<v-card elevation="0">        <v-textarea
              :disabled="loading"
              v-model="message"
              class="ma-3"
              label="Message"
              append-icon="mdi-send"
              @click:append="sendMessage"
              @keydown.enter="sendMessage"
            >
        </v-textarea>
    </v-card>
    </v-card>
    </div>
    </client-only>
    </template>
    
    
<script setup>
const { $api } = useNuxtApp();
const message = ref(null);
const messages = ref([]);
const loading = ref(false);
const showAskConfirmation = ref(false);
const confirmation = ref(false);
const jsonData = ref(null);
const messageModal = ref('');
const { createTransaction } = useWeb3();
const sendMessage = async () => {
  loading.value = true;
  messages.value.push({
    user: 'me',
    message: message.value,
  });
  let messageToSent = message.value;
  message.value = ';' // clear the text field

  let context =
    messages.value.length > 1
      ? `"role": "user", "content": ` +
        messages.value[messages.value.length - 3].message +
        `"role": "system", "content":  ${
          messages.value[messages.value.length - 2].message
        }`
      : `Conversation Started`;
  const ask = await $api('/prompt/ask', {
    method: 'POST',
    body: { question: messageToSent, context: context },
  });

  /* 
         SI la string ask.data[0] contiene JSON: entonces haz un split y verifica que el contenido de la posicion del split 1
         sea un JSON valido, si es asi ejecuta la funcion createTransaction y no continues con el demas codigo
        */
  let json, jsonValid = false;
  try{
    if (ask.data[0].includes('JSON')) {
        let split = ask.data[0].split('JSON:');
        json = split[1];
        jsonValid = JSON.parse(json);
    } else if (JSON.parse(ask.data[0])) {
        jsonValid = JSON.parse(ask.data[0]);
    }
    }catch(e){
        console.log(e)
    }

  if (jsonValid) {
    jsonData.value = jsonValid;
    if(jsonData.value.action == 'transfer'){
        messageModal.value = `You are about to send ${jsonData.value.details.amount} SOL to ${jsonData.value.details.receiver}`;
    }else if (jsonData.value.action == 'check_balance'){
        messageModal.value = `You are about to check your balance`;
    }else if (jsonData.value.action == 'create_account'){
        messageModal.value = `You are about to create an account`;
    }
    showAskConfirmation.value = true;
    return;
  }

  messages.value.push({
    user: 'bot',
    message: ask.data[0],
  });
  loading.value = false;
};

const confirmTx = async (confirm) => {
    try {
      if (confirm) {
         const data = {
            action: `${jsonData.value.action}` ?? '',
         }

         if(jsonData.value.details){
            data.details = {
                receiver: `${jsonData.value.details.receiver}` ?? '',
                amount: `${jsonData.value.details.amount}` ?? '',
                accountId: `${jsonData.value.details.account_id}` ?? ''
            }
         }
         
        const response = await createTransaction(data);
        messages.value.push({
          user: 'bot',
          message: `${response}`,
        });      } else {
        messages.value.push({
          user: 'bot',
          message: 'Transaction canceled',
        });
      }
    } catch (e) {
      console.log(e);
    }
    showAskConfirmation.value = false;
    confirmation.value = false;
    loading.value = false;
}

const debugCreateTransaction = async () => {
    const data = {
        action: 'transfer',
        details: {
        receiver: 'AFNLBMwTavrGao98NGKkdCe3nqjytmtT5fUyJSQwsUhi',
        amount: "2.3"
        }
    }
    const response = await createTransaction(data);
};
</script>

<style scoped>
.scrollable-text {
  max-height: 200px;  
  width: 100%;
  overflow-y: auto;
}
.scrollable-message {
  max-height: 200px;  
  overflow-y: auto;
  display: inline-block; 
  width: 100%;
}
</style>