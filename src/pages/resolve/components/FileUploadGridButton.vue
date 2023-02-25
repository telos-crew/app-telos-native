<template>
  <!-- <q-input
      filled
      v-model="hash"
      :label="$t('pages.resolve.file_upload_label')"
      bottom-slots
      :hint="$t('pages.resolve.file_upload_hint')"
      :error-message="$t('pages.resolve.file_upload_error')"
      dense
      autofocus
      :loading="isUploading"
      :error="!isUploading && !isHashValid"
      @update:model-value="onFileChange"
      class="file-upload-input"
  >
      <template v-slot:prepend>
          <q-icon name="attach_file" />
      </template>
    </q-input> -->
    <div class="file-upload-grid-button">
      <div v-if="!file?.hash" class="center">
        <q-circular-progress
          v-if="isUploading"
          :value="progress"
          size="52px"
          color="primary"
          class="q-ma-md"
        />
        <span v-else class="text" :id="clickableId">
          +
        </span>
      </div>
      <div v-else-if="isImage" :style="{ backgroundImage: `url(${ipfsLink})`}" class="image-cover">

      </div>
      <input type="file" :id="fileInputId" :accept="accept" :style="{ display: 'none' }" />
    </div>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import { validateIpfsHash } from '../util';

export default {
  props: ['file', 'accept'],
  data() {
      return {
          progress: 0,
          isUploading: false,
          inputId: 'file-input'
      };
  },
  methods: {
      onFileChange(file) {
          this.$emit('update:file', file);
      },
      async onFileSelect() {
          console.log('onFileSelect key', this.file?.key)
          this.isUploading = true;
          if (this.file) this.onFileChange({
            key: this.file.key
          })
          const file = document.getElementById('file-input')?.files[0];
          const formData = new FormData();
          formData.append('file', file);
          let accessToken;
          const expiration = new Date().getTime() / 1000 + 3600 * 24
          console.log('temp-token expiration: ', expiration)
          try {
              const headers = {
                  'api-key':
                      'OY77xJwvfIucJxOsv9h9IEGGUCKbFlmXkKdKz2HsjJhjwmlixyxUaer9D7ekXrPg',
                  'x-expiration': expiration
              };
              const {
                  data: { access_token }
              } = await axios({
                  url: 'https://api.dstor.cloud/v1/dev/temp-token',
                  headers
              });
              this.progress = 10;
              accessToken = access_token;
          } catch (err) {
              console.log('access_token error: ', err);
          }

          let uploadToken;
          try {
              const {
                  data: { token }
              } = await axios({
                  method: 'POST',
                  url: 'https://api.dstor.cloud/v1/upload/get-token/',
                  headers: {
                      Authorization: `Bearer ${accessToken}`
                  },
                  data: {
                      chunks_number: 1,
                      folder_path: `arbitration/${this.account}`
                  }
              });
              this.progress = 20;
              uploadToken = token;
          } catch (err) {
              console.log('upload token error: ', err);
          }

          const updateProgress = event => {
              this.progress =
                  Math.round((event.loaded * 100) / event.total) * 0.4 + 30;
          };

          try {
              const config = {
                  method: 'POST',
                  headers: {
                      Authorization: `Bearer ${accessToken}`,
                      // "Access-Control-Allow-Origin": "*",
                      'Content-Type': 'multipart/form-data',
                      // "x-dstor-parent-id": 0, // root folder,
                      'x-dstor-comment': `Upload from Resolve by ${this.account}`,
                      'x-dstor-upload-token': uploadToken
                  },
                  onUploadProgress: updateProgress
              };
              await axios.post(
                  'https://api.dstor.cloud/v1/upload/',
                  formData,
                  config
              );
          } catch (err) {
              console.log('upload error: ', err);
          }

          let interval = 2000;
          let timeout;
          const checkStatus = async () => {
              try {
                  const { data: statusData } = await axios(
                      'https://api.dstor.cloud/v1/upload/get-status/',
                      {
                          headers: {
                              Authorization: `Bearer ${accessToken}`,
                              'x-dstor-upload-token': uploadToken
                          }
                      }
                  );
                  interval = interval + 250;
                  timeout = setTimeout(checkStatus, interval);
                  switch (statusData.status) {
                  case 'ADDING_TO_IPFS':
                      this.progress = 80;
                      break;
                  case 'SAVING_DATA':
                      this.progress = 90;
                      break;
                  case 'DONE':
                      clearTimeout(timeout);
                      this.progress = 100;
                      setTimeout(() => {
                          const newHash = statusData.data[0].Hash;
                          const newFilename = statusData.data[0].Name
                          const newFile = {
                            hash: newHash,
                            filename: newFilename
                          };
                          this.onFileChange({
                            key: this.file?.key,
                            ...newFile
                          });
                          this.isUploading = false;
                          this.progress = 0;
                      }, 1000);
                      return;
                  }
              } catch (err) {
                  this.progress = 0;
                  this.$q.notify({
                      message: this.$t('pages.resolve.file_upload_failed'),
                      color: 'negative'
                  });
              }
          };
          checkStatus();
      },
      openFileExplorer () {

      }
  },
  computed: {
      ...mapGetters({
          account: 'accounts/account'
      }),
      isHashValid() {
          return validateIpfsHash(this.hash);
      },
      isImage () {
        return this.file?.filename?.match(/.(jpg|jpeg|png|gif)$/i)
      },
      ipfsLink () {
        return `https://api.dstor.cloud/ipfs/${this.file?.hash}`
      },
      fileInputId () {
        return this.file?.key || 'file-input'
      },
      clickableId () {
        return `attach-file-button-${this.file?.key}`
      }
  },
  mounted: function() {
      const fileSelect = document.getElementById(this.clickableId);
      const fileElem = document.getElementById(this.fileInputId);
      fileElem.addEventListener('change', this.onFileSelect);
      fileSelect.addEventListener(
          'click',
          () => {
              if (fileElem) {
                  fileElem.click();
              }
          },
          false
      );
  }
};
</script>

<style lang="scss">
.file-upload-grid-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;
  border: 0.5px solid #ccc;
  background-color: #ccc;
  border-radius: 5px;

  &:hover {
    cursor: pointer;
  }

  .center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 70%;
    width: 70%;
    border-radius: 50%;
    background-color: #ccc;
    .text {
      color: white;
      font-size: 50px;
    }
  }
  #file-input {
      display: none;
  }

  .image-cover {
    width: 100%;
    height: 100%;
    background-size: cover;
  }
}

.file-upload-input {
  #attach-file-button {
      &:hover {
          cursor: pointer;
      }
  }

}
</style>
