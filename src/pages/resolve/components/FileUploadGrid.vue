<template>
  <div class="file-upload-grid">
    <div v-for="(file) of files" class="item" v-bind:key="file.key">
      <file-upload-grid-button
        :file="file"
        :accept="accept"
        :chooseFile="chooseFile"
        @delete-file="files = files.filter((f) => f.key !== file.key)"
      />
    </div>
    <div class="item">
      <file-upload-grid-button :accept="accept" :chooseFile="chooseFile" />
    </div>
  </div>
  <input type="file" id="new-upload" :accept="accept" :style="{ display: 'none' }" />
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex';
import { generateRandomId } from '../util';
import FileUploadGridButton from './FileUploadGridButton.vue';
  export default {
    props: ['accept'],
    components: {
      FileUploadGridButton
    },
    data () {
      return {
        files: []
      }
    },
    methods: {
      updateFile (newFile) {
        // file either already exists or does not
        const foundFileIndex = this.files.findIndex((file) => file.key === newFile.key)
        if (foundFileIndex === -1) {
          this.files.push(newFile)
        } else {
          this.files[foundFileIndex] = {
            ...this.files[foundFileIndex],
            ...newFile
          }
        }
      },
      async onFileSelect(key) {
          const usableKey = key || generateRandomId()
          this.updateFile({
            key: usableKey,
            progress: 0,
            isUploading: true
          })
          const file = document.getElementById('new-upload')?.files[0];
          const formData = new FormData();
          formData.append('file', file);
          let accessToken;
          const expiration = new Date().getTime() / 1000 + 3600 * 24
          try {
              const headers = {
                  'api-key':
                      'N4EbVMgjvJmNvHwTHQhzzDsJjFKg7BeTnQ4pOd0D4H42NIgBfTF8LTjemBmTCcxa',
                  'x-expiration': expiration
              };
              const {
                  data: { access_token },
              } = await axios({
                  url: 'https://api.dstor.cloud/v1/dev/temp-token',
                  headers
              });
              this.progress = 10;
              this.updateFile({
                key: usableKey,
                progress: 10
              })
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
              this.updateFile({
                key: usableKey,
                progress: 20
              })
              uploadToken = token;
          } catch (err) {
              console.log('upload token error: ', err);
          }

          const onUploadProgress = event => {
              const prog = Math.round((event.loaded * 100) / event.total) * 0.4 + 30;
              this.updateFile({
                key: usableKey,
                progress: prog
              })
          };

          try {
              const config = {
                  method: 'POST',
                  headers: {
                      Authorization: `Bearer ${accessToken}`,
                      'Content-Type': 'multipart/form-data',
                      // "x-dstor-parent-id": 0, // root folder,
                      'x-dstor-comment': `Upload from Resolve by ${this.account}`,
                      'x-dstor-upload-token': uploadToken
                  },
                  onUploadProgress
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
                      this.updateFile({
                        key: usableKey,
                        progress: 80
                      })
                      break;
                  case 'SAVING_DATA':
                      this.progress = 90;
                      this.updateFile({
                        key: usableKey,
                        progress: 90
                      })
                      break;
                  case 'DONE':
                      clearTimeout(timeout);
                      this.updateFile({
                        key: usableKey,
                        progress: 100
                      })
                      setTimeout(() => {
                          const newHash = statusData.data[0].Hash;
                          const newFilename = statusData.data[0].Name
                          const newFile = {
                            hash: newHash,
                            filename: newFilename
                          };
                          this.updateFile({
                            key: usableKey,
                            progress: 0,
                            isUploading: false,
                            ...newFile
                          })
                      }, 1000);
                  }
              } catch (err) {
                  this.updateFile({
                    key: usableKey,
                    progress: 0,
                    isUploading: false
                  })
                  this.$q.notify({
                      message: this.$t('pages.resolve.file_upload_failed'),
                      color: 'negative'
                  });
              }
          };
          checkStatus();
      },
      chooseFile (key) {
        const fileElem = document.getElementById('new-upload');
        const something = (event) => {
          fileElem.removeEventListener('change', something)
          if (!event.target.value) {
            return
          }
          this.onFileSelect(key)
        }

        fileElem.addEventListener('change', something);
        if (fileElem) {
          fileElem.click();
        }
      }
    },
    computed: {
      ...mapGetters({
        account: 'accounts/account'
      })
    }
  }
</script>

<style lang="scss">
.file-upload-grid {
  flex: 1;

  .item {
    display: inline-block;
    margin-right: 12px;
    margin-bottom: 12px;
    vertical-align: top;
  }
}
</style>
