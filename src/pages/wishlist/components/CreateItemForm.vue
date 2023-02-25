<template>
    <q-card class="create-new-form">
        <q-card-section>
            <div class="text-h6">{{$t('pages.wishlist.create_new_title')}}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
            <p>
                Hello
            </p>
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

        <q-card-section class="q-pt-none">
            <q-input
                v-model="subtitle"
                filled
                :label="$t('pages.wishlist.subtitle')"
                bottom-slots
                :hint="$t('pages.wishlist.create_new_subtitle_hint')"
            />
        </q-card-section>

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

        <q-card-section class="q-pt-none input-row">
            <file-upload-grid accept="image/png, image/jpeg" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
            <q-btn flat :label="$t('common.buttons.submit')" @click="submit" />
            <q-btn flat :label="$t('common.buttons.cancel')" @click="close" />
        </q-card-actions>
    </q-card>
</template>

<script>
// title, subtitle, description, images, ballot ID, content URL
import FileUploadGrid from 'src/pages/resolve/components/FileUploadGrid.vue';
export default {
  components: {
    FileUploadGrid
  },
  props: ['submit', 'close'],
  data () {
    return {
      title: '',
      subtitle: '',
      description: '',
      imageUrls: [],
      contentUrls: []
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
