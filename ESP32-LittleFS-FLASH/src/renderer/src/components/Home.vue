<template>
  <v-sheet
    class="mx-auto mt-10"
    color="#22262A"
    width="450"

  >
  <div style="position: fixed;top: 10px;right:20px;">
    <a href="https://github.com/Tomosawa/ESP32-LittleFS-Flash" target="_blank">
      <v-icon icon="mdi-github" size="large" color="white"/>
    </a>
  </div>
    <h4 class="text-h5 font-weight-bold mb-4">{{ $t('Title') }}</h4>
    <p class="mb-4">
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
             hide-details="auto"
             :label="$t('Port')"
             :rules="[required]"
             @input="onPortInput"
             @focus="onSelectPortFocus"
          ></v-combobox>
        </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-combobox
               class=""
               v-model="selectChip"
               hide-details="auto"
               :items="chipItems"
               :label="$t('Chip')"
               :rules="[required]"
               @input="onChipInput"
            ></v-combobox>
          </v-col>
        <v-col>
          <v-combobox
             class=""
             v-model="selectSpeed"
             hide-details="auto"
             :items="speedItems"
             :label="$t('FlashSpeed')"
             :rules="[required]"
          ></v-combobox>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            class=""
            hide-details="auto"
            :label="$t('PartitionSize')"
            :rules="[required]"
            v-model="imageSize"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-text-field
            class=""
            hide-details="auto"
            :label="$t('PartitionOffset')"
            :rules="[required]"
            v-model="flashOffset"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-container>
    <v-btn
      class="text-none text-black mb-4 mt-5"
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
      chipItems:['auto','esp8266','esp32','esp32s2','esp32s3beta2','esp32s3','esp32c3','esp32c6beta','esp32h2beta1','esp32h2beta2','esp32c2','esp32c6','esp32h2','esp32p4'],
      selectChip: null,
      selectPort : null,
      speedItems: [9600,19200,38400,57600,74880,115200,921600,1000000,1500000,2000000,3000000,4000000],
      selectSpeed: 115200,
      imageSize: '',
      flashOffset:''
    }),
    mounted() {
      this.getSerialPorts();

     // Load saved data from localStorage
     this.folderPath = localStorage.getItem('folderPath') || '';
     this.selectPort = localStorage.getItem('selectPort') || '';
     this.selectSpeed = parseInt(localStorage.getItem('selectSpeed')) || 115200;
     this.selectChip = localStorage.getItem('selectChip') || '';
     this.imageSize = localStorage.getItem('imageSize') || '0';
     this.flashOffset = localStorage.getItem('flashOffset') || '0';
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
          const newarray = ports.map(item => item.path);
          this.portItems = newarray;
          console.log(newarray);
        }).catch(error => {
          console.error('Error listing ports', error);
        });
      },
      onSelectPortFocus() {
        console.log('onSelectPortFocus')
        this.getSerialPorts();
      },
      onPortInput(value) {
        if (this.portItems.includes(value)) {
          // Check if exist
          this.selectPort = value;
        } else {
          // Do not exist,set empty.
          this.selectPort = '';
        }
      },
      onChipInput(value) {
        if (this.chipItems.includes(value)) {
          this.selectChip = value;
        } else {
          this.selectChip = '';
        }
      },
      startFlash() {
        if (!this.form) return;
        console.log('start flash');
        // const eventBus = new Vue();
        // eventBus.$emit('data-event', { path: this.folderPath, port: this.selectPort, speed:this.selectSpeed,imagesize: this.imageSize, offset: this.flashOffset} );
        this.$router.push({
          path:'/flash',
          query: {
            FolderPath: this.folderPath,
            FlashPort: this.selectPort,
            FlashSpeed: this.selectSpeed,
            ChipType: this.selectChip,
            ImageSize:this.imageSize,
            FlashOffset:this.flashOffset
             }
          });
      }
    },
    watch: {
      // Automatically save data when it changes
      folderPath(newVal) {
        localStorage.setItem('folderPath', newVal);
      },
      selectPort(newVal) {
        localStorage.setItem('selectPort', newVal);
      },
      selectSpeed(newVal) {
        localStorage.setItem('selectSpeed', newVal);
      },
      selectChip(newVal) {
        localStorage.setItem('selectChip', newVal);
      },
      imageSize(newVal) {
        localStorage.setItem('imageSize', newVal);
      },
      flashOffset(newVal) {
        localStorage.setItem('flashOffset', newVal);
      }
    }
  }
</script>
