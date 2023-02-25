<template>
  <div class="file-upload-grid">
    <div v-for="(file) of files" class="item">
      <file-upload-grid-button :file="file" @update:file="updateFile" :accept="accept" />
    </div>
    <div class="item">
      <file-upload-grid-button @update:file="(file) => updateFile(file)" :accept="accept" />
    </div>
  </div>
</template>

<script>
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
        console.log('updateFile: ', newFile)
        if (!newFile.key) {
          this.files.push({
            ...newFile,
            key: generateRandomId()
          })
        } else {
          this.files = this.files.map((file) => {
            if (newFile.key === file.key) return newFile
          })
        }
        console.log('this.files: ', JSON.stringify(this.files))
      }
    }
  }
</script>

<style lang="scss">
.file-upload-grid {
  display: flex;
  flex: 1;

  .item {
    display: inline-block;
    margin-right: 12px;
  }
}
</style>
