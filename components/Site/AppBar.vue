<template>
  <v-toolbar app class="dark-theme">
    <v-toolbar-title class="white-text" >SOLmate</v-toolbar-title>
    <v-spacer/>
    <v-btn rounded class="wallet-btn" @click="connectWallet" v-if="!isConnected"
      >Connect Wallet</v-btn
    >
    <v-btn
      rounded="pill"
      class="wallet-btn mx-2"
      v-if="isConnected"
      prepend-icon="mdi-check-circle"
    >
    {{ shortAddress }}
    </v-btn>

    <v-btn class="wallet-btn" v-if="isConnected">{{ formattedBalance }} SOL</v-btn>
  </v-toolbar>
</template>

<script setup>
import { computed } from 'vue';

const { address, balance, isConnected, connectWallet } = useWeb3();

const shortAddress = computed(() => {
  if (address.value) {
    return `${address.value.substring(0, 3)}...${address.value.substring(address.value.length - 3)}`;
  }
  return '';
});

const formattedBalance = computed(() => {
  if (balance.value) {
    return balance.value.toFixed(2);
  }
  return '';
});

onMounted(async () => {
  await connectWallet();
});
</script>

<style scoped>
.dark-theme {
  background-color: #1a1a2e;
}
.white-text {
  color: white;
}
.wallet-btn {
  border: 2px solid white;
  color: white;
}
</style>
