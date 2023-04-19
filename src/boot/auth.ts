import { boot } from 'quasar/wrappers'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app, router, store }) => {
  // something to do
	const showApprovalDialog = async () => {
		await new Promise((resolve, reject) => {
			app.config.globalProperties.$q
				.dialog({
					color: 'primary',
					message: `<q-card class="text">
											<p>This off-chain action requires you to sign an arbitrary piece of data for us to verify that you are the Telos user you say you are. No on-chain actions are signed nor broadcasted, and you won't have to do it again for a month.</p>
										</q-card>`,
					html: true,
					cancel: true,
					fullWidth: true,
					ok: {
						label: 'OK'
					}
				})
				.onOk(() => {
					resolve(true)
				})
				.onCancel(() => {
					throw 'Cancelled!'
				})
				.onDismiss(() => {
					reject()
				})
		})
	}

	const auth = {
		showApprovalDialog
	}
	// @ts-ignore
	store['$auth'] = auth
	app.config.globalProperties.$auth = auth
})
