<template>
  <q-layout>
    <q-page class="flex justify-center  bg-green-2">

      <q-card class="apple-card " style="max-height: 200px;margin-top: 128px">
        <q-card-section class="flex justify-between bg-green-1">
          <div>
            <q-avatar
              class="absolute"
              color="primary"
              size="128px"
              style="top: 0;  transform: translateY(-50%);"
            ><img src="md.jpg">
            </q-avatar>

          </div>
          <div class="text-body1">
            字节
          </div>
        </q-card-section>
        <q-card-section>
          <div class=" q-mt-md">宠物正在放风，请勿抱走。</div>
        </q-card-section>

        <q-card-section class="q-gutter-sm">
          <q-btn color="secondary" icon="o_place" label="上报位置"></q-btn>
          <q-btn color="primary " icon="o_call" label="联系主人">
            <q-badge color="green" floating rounded/>

          </q-btn>
          <q-btn color="pink" icon="favorite" rounded>

          </q-btn>
        </q-card-section>

      </q-card>

    </q-page>
  </q-layout>

</template>

<script>


export default {
  name: "PlainTextEditing",
  components: {},

  setup() {
    return {};
  },
};
</script>

<style scoped>
.apple-card {
  min-width: 360px;
}
</style>
