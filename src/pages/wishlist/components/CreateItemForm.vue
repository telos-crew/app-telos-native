<template>
    <q-card class="dismiss-offer-form">
        <q-card-section>
            <div class="text-h6">{{$t('pages.resolve.dismiss_offer_heading')}}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
            <p>
                {{$t('pages.resolve.dismiss_offer_text')}}
            </p>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
            <q-btn flat :label="$t('pages.resolve.dismiss_offer_dismiss_cta')" @click="submit" />
            <q-btn flat :label="$t('pages.resolve.dismiss_offer_cancel_cta')" @click="close" />
        </q-card-actions>
    </q-card>
</template>

<script>
  export default {

  }
</script>

<style lang="scss" scoped>

</style>
