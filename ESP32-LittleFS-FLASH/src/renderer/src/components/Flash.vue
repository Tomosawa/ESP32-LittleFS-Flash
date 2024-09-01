<template>
  <v-sheet
    class="mx-auto mt-10"
    color="#22262A"
    width="600"
    rounded
  >
  <v-card class="terminal-card" outlined>
            <v-card-title class="terminal-title">Command Output</v-card-title>
            <v-card-text class="terminal-text" ref="terminalText">
              <div class="terminal-output" ref="terminalOut">{{ terminal }}</div>
            </v-card-text>
          </v-card>
  <v-btn
    class="text-none text-black mb-4"
    color="error"
    size="x-large"
    block
    prepend-icon="mdi-arrow-left-circle"
    @click="backButtonClicked"
  >
    {{ $t('BackButton') }}
  </v-btn>
  </v-sheet>

</template>

<script>

export default {
  data: () => ({
    terminal: 'Running command...\n',
  }),
  mounted(){
    const folderPath = this.$route.query.FolderPath;
    const flashPort = this.$route.query.FlashPort;
    const flashSpeed = this.$route.query.FlashSpeed;
    const chipType = this.$route.query.ChipType;
    const imageSize = this.$route.query.ImageSize;
    const flashOffset = this.$route.query.FlashOffset;

    console.log('folderPath:', folderPath);
    console.log('flashPort:',flashPort);
    console.log('flashSpeed:', flashSpeed);
    console.log('chipType:', chipType);
    console.log('imageSize:', imageSize);
    console.log('flashOffset:', flashOffset);

    const command = {
      mklittlefs:['-c',`${folderPath}`,'-s', `${imageSize}`, `${folderPath}.bin`],
      esptool:['--chip', `${chipType}`, '--port', `${flashPort}`, '--baud', `${flashSpeed}`, 'write_flash', `${flashOffset}`, `${folderPath}.bin`]
    }
    window.electronCmd.runCommand(command);
    console.log('run command exec');
    window.electronCmd.onCommandOutput((event, output) => {
      this.terminal += output;
      this.scrollToBottom();
    })
  },
  updated() {
    console.log('updated');
    nextTick(() => {
      this.scrollToBottom();
    })
  },
  methods : {
    scrollToBottom() {
      console.log('scrollToBottom');
      this.$nextTick(() => {
        setTimeout(() => {
          const terminalText = this.$refs.terminalText.$el || this.$refs.terminalText;
          const terminalOut = this.$refs.terminalOut;
          if (terminalText) {
            terminalText.scrollTo({ top: terminalOut.scrollHeight, behavior: 'smooth' });
          }
        }, 100); // Adjust delay if needed
      });
    },
    backButtonClicked(){
      this.$router.go(-1);
    }

  }
}
</script>

<style>
  .terminal-card {
    background-color: #1e1e1e;
    color: #c5c5c5;
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    max-height: 400px; /* Adjust as needed */
    overflow: hidden;
  }

  .terminal-title {
    color: #00ff00;
  }

  .terminal-text {
    max-height: 350px; /* Adjust as needed */
    //height: 100%;
    overflow-y: auto;
  }
  .terminal-output {
    white-space: pre-wrap; /* 保持换行 */
    word-wrap: break-word; /* 防止长词溢出 */
    color: #c5c5c5;
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
  }

  .terminal-card .v-card-text {
    padding: 16px;
  }

  .terminal-card .v-card-title {
    background-color: #333;
    border-bottom: 1px solid #444;
  }
  /* Custom scrollbar styles */
  .terminal-text::-webkit-scrollbar {
    width: 12px;
  }

  .terminal-text::-webkit-scrollbar-track {
    background: #2e2e2e;
  }

  .terminal-text::-webkit-scrollbar-thumb {
    background-color: #555;
    border-radius: 10px;
    border: 3px solid #2e2e2e;
  }

  .terminal-text::-webkit-scrollbar-thumb:hover {
    background-color: #777;
  }
</style>
