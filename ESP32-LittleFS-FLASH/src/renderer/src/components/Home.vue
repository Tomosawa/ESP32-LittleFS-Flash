<template>
  <v-sheet
    class="mx-auto mt-10"
    color="#22262A"
    width="450"

  >
    <h4 class="text-h5 font-weight-bold mb-4">{{ $t('Title') }}</h4>

    <p class="mb-8">
       {{ $t('Introduce') }}
    </p>
    <v-form ref="form" v-model="form" @submit.prevent="startFlash">
    <v-text-field
      class="mb-4"
      hide-details="auto"
      :label="$t('FolderPath')"
      v-model="folderPath"
      :rules="[required]"
    ></v-text-field>
    <v-btn
      class="text-none text-black mb-4"
      size="x-large"
      variant="flat"
      prepend-icon="mdi-folder"
      block
      @click="openFolder"
    >
      {{ $t('FolderPathButton') }}
    </v-btn>
    <v-container class="pa-0">
      <v-row>
        <v-col>
          <v-combobox
             class=""
             v-model="selectPort"
             :items="portItems"
             item-title="path"
             item-value="path"
             :label="$t('Port')"
             :rules="[required]"
          ></v-combobox>
        </v-col>
        <v-col>
          <v-combobox
             class="mb-2"
             v-model="selectSpeed"
             :items="speedItems"
             :label="$t('FlashSpeed')"
             :rules="[required]"
          ></v-combobox>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            class="mb-4"
            hide-details="auto"
            :label="$t('PartitionSize')"
            :rules="[required]"
            v-model="imageSize"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-text-field
            class="mb-4"
            hide-details="auto"
            :label="$t('PartitionOffset')"
            :rules="[required]"
            v-model="flashOffset"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-container>
    <v-btn
      class="text-none text-black mb-4"
      color="error"
      size="x-large"
      variant="flat"
      block
      prepend-icon="mdi-download-box"
      :disabled="!form"
      type="submit"
    >
      {{ $t('FlashButton') }}
    </v-btn>
    </v-form>
  </v-sheet>
</template>
<script>
  export default {
    data: () => ({
      form: false,
      folderPath: '',
      portItems: [''],
      selectPort : '',
      speedItems: [9600,19200,38400,57600,74880,115200,921600,1000000,1500000,2000000,3000000,4000000],
      selectSpeed: 115200,
      imageSize: 0,
      flashOffset:0
    }),
    mounted() {
      this.getSerialPorts();
    },
    methods: {
      required(v) {
        return !!v || this.$t('RequiredField');
      },
      openFolder() {
        window.electron.ipcRenderer.invoke('open-folder-dialog').then((selectPath) => {
          if (selectPath) {
            console.log(selectPath);
            this.folderPath = selectPath;
          }
        }).catch((error) => {
          console.log(error);
        });
      },
      getSerialPorts() {
        window.electron.ipcRenderer.invoke('request-serial-ports').then(ports => {
          this.portItems = ports;
          console.log(ports);
        }).catch(error => {
          console.error('Error listing ports', error);
        });
      },
      startFlash() {
        if (!this.form) return;
        console.log('start flash');
        // const eventBus = new Vue();
        // eventBus.$emit('data-event', { path: this.folderPath, port: this.selectPort, speed:this.selectSpeed,imagesize: this.imageSize, offset: this.flashOffset} );
        this.$router.push('/flash');
      }
    }

  }
</script>
