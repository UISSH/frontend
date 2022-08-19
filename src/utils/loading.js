import ErrorDialog from "components/base/ErrorDialog";

export function showLoading($q) {
  $q.loading.show({
    boxClass: "apple-card ",
    spinnerColor: "blue-grey",
    spinnerSize: "64",
  });
}

export function errorLoading($q, err) {
  $q.dialog({
    component: ErrorDialog,
    componentProps: {
      err: err,
    },
  })
    .onOk(() => {
      console.log("OK");
    })
    .onCancel(() => {
      console.log("Cancel");
    })
    .onDismiss(() => {
      console.log("Called on OK or Cancel");
    });
}

export function hideLoading($q) {
  $q.loading.hide();
}
