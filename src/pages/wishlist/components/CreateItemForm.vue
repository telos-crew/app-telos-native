<template>
    <q-card class="create-new-form">
        <q-card-section>
            <div class="text-h6">{{$t('pages.wishlist.create_new_title')}}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
            <p>Please fill out the following info for your requested wishlist item:</p>
        </q-card-section>

        <q-card-section class="q-pt-none">
            <q-input
              v-model="title"
              filled
              :label="$t('pages.wishlist.title')"
              bottom-slots
              :hint="$t('pages.wishlist.create_new_title_hint')"
            />
        </q-card-section>

        <!-- <q-card-section class="q-pt-none">
            <q-input
                v-model="subtitle"
                filled
                :label="$t('pages.wishlist.subtitle')"
                bottom-slots
                :hint="$t('pages.wishlist.create_new_subtitle_hint')"
            />
        </q-card-section> -->

        <q-card-section class="q-pt-none">
            <q-input
                type="textarea"
                v-model="description"
                filled
                :label="$t('pages.wishlist.description')"
                bottom-slots
                :hint="$t('pages.wishlist.create_new_description_hint')"
            />
        </q-card-section>

        <q-card-section class="input-row">
          <p><strong>Attach Documents:</strong></p>
          <file-upload-grid
            scope="imageItems"
            @update-files="(files) => onUpdateFiles(files, 'contentUrls')"
            accept="*/*"
          />
        </q-card-section>

        <q-card-section class="input-row">
          <p><strong>Attach Images:</strong></p>
          <file-upload-grid
            scope="contentItems"
            @update-files="(files) => onUpdateFiles(files, 'imageUrls')"
            accept="image/png, image/jpeg"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
            <q-btn flat :label="$t('common.buttons.submit')" @click="submitForm" />
            <q-btn flat :label="$t('common.buttons.cancel')" @click="close" />
        </q-card-actions>
    </q-card>
</template>

<script>
// title, subtitle, description, images, ballot ID, content URL
import FileUploadGrid from 'src/pages/resolve/components/FileUploadGrid.vue';
import { generateRandomId } from 'src/pages/resolve/util';
import { mapGetters } from 'vuex';
export default {
  components: {
    FileUploadGrid
  },
  props: ['submit', 'close'],
  data () {
    return {
      title: '2023-03-10_',
      // subtitle: '',
      description: 'This is just a test',
      imageUrls: [],
      contentUrls: []
    }
  },
  methods: {
    async submitForm () {
      const currentTime = new Date()
      const currentUnixTimestamp = currentTime.getTime()
      const endTimestamp = currentUnixTimestamp + 86400 * 3 * 365
      const utcDate = new Date(endTimestamp)
      const [utcIsoString] = utcDate.toISOString().split('Z')
      const ballot_name = `wish.gen.${generateRandomId().slice(0, 3)}`
      const content = {
        imageUrls: this.imageUrls,
        contentUrls: this.contentUrls
      }
      const actions = [{
        account: 'telos.decide',
        name: 'newballot',
        data: {
          ballot_name,
          category: 'proposal',
          publisher: this.account,
          treasury_symbol: '4,VOTE',
          voting_method: '1token1vote',
          initial_options: ['yes', 'no', 'abstain']
        }
      },
      {
        account: 'telos.decide',
        name: 'togglebal',
        data: {
          ballot_name,
          setting_name: 'votestake'
        },
      },
      {
        account: 'telos.decide',
        name: 'editdetails',
        data: {
          ballot_name,
          title: this.title,
          description: this.description,
          content: JSON.stringify(content)
        }
      }, {
        account: 'telos.decide',
        name: 'openvoting',
        data: {
          ballot_name,
          end_time: utcIsoString
        }
      }
    ]
      console.log('actions: ', actions)
      try {
        await this.$store.$api.signTransaction(actions);
        this.close();
        setTimeout(this.close, 5000);
      } catch (err) {
          console.log('create ballot error: ', err);
      }
    },
    onUpdateFiles (newFiles, scope) {
      const formattedFiles = newFiles.map(file => {
        return `https://api.dstor.cloud/ipfs/${file.hash}`
      })
      this[scope] = formattedFiles
    },
  },
  computed: {
    ...mapGetters({
      account: 'accounts/account'
    }),
    isFormReady () {
      if (!this.title && !this.description) return false
      return true
    }
  }
}
</script>

<style lang="scss">
.create-new-form {
  max-width: 450px;
  width: 90%;
}
</style>
