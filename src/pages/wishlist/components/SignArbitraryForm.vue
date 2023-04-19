<template>
	<q-card id="signArbMessage">
		<q-card-section class="content">
			<q-icon name="mdi-information-outline" color="primary" size="6rem" class="info-icon" />
			<div class="text">
				<p>This off-chain action requires you to sign an arbitrary piece of data for us to verify that you are the Telos user you say you are. No on-chain actions are signed nor broadcasted, and you won't have to do it again for a month.</p>
			</div>
			<q-btn color="primary" size="1.2rem" @click="$emit('close-sign-arb')">OK</q-btn>
		</q-card-section>
	</q-card>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
#signArbMessage {
	width: 300px;
	max-width: 100%;
	display: flex;
	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		text-align: center;
		.info-icon {
			margin: 0 auto 1rem;
		}
		.text {
			font-size: 1rem;
			margin-bottom: 1rem;
		}
	}
}
</style>
