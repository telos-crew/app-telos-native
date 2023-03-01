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
      <div v-if="!file?.hash" class="center" :onClick="() => chooseFile(file?.key)">
        <q-circular-progress
          v-if="file?.isUploading"
          :value="file?.progress"
          size="52px"
          color="primary"
          class="q-ma-md"
        />
        <span v-else class="text">
          +
        </span>
      </div>
      <div
        v-else-if="isImage"
        :style="{ backgroundImage: `url(${ipfsLink})`}"
        class="image-cover"
        :onClick="() => chooseFile(file?.key)"
        >

      </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { validateIpfsHash } from '../util';

export default {
  props: ['file', 'chooseFile'],
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
  },
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
