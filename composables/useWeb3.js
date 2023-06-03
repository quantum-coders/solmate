// import ethers
import { ethers } from 'ethers';
export const useWeb3 = () => {
	let globalProvider = ref(null)
	const currentAccount = ref(null);
	const config = useRuntimeConfig();
	const getAccount = function() {
		return window.localStorage.getItem('currentAccount');
	};
	const initProvider = async function() {
		currentAccount.value = getAccount();
		if(window.ethereum !== undefined) {
			const provider = new ethers.providers.Web3Provider(
				window.ethereum,
				'any',
			);
			globalProvider.value = markRaw(provider);
			setListeners(true);
		} else {
			console.log('Metamask not found');
		}
	};
	const etherToWei = function(etherUnits) {
		return ethers.utils.parseEther(etherUnits);
	};

	const weiToEther = function(etherUnits) {
		return ethers.utils.formatEther(etherUnits);
	};

	// Computed current Account to trim the address
	const currentAccountTrimmed = computed(() => {
		if(currentAccount.value != null) {
			return currentAccount.value.substring(0, 6) + '...' + currentAccount.value.substring(38, 42);
		}
	});
	const setListeners = (bool) => {
		if(bool) {
			globalProvider.value.provider.on('accountsChanged', onAccountsChanged);
		} else {
			globalProvider.value.removeListener('accountsChanged', onAccountsChanged);
			window.localStorage.removeItem('currentAccount');
		}
	};
	const onAccountsChanged = async (accounts) => {
		window.localStorage.setItem('currentAccount', await globalProvider.value.getSigner().getAddress());
	};
	const connectWallet = async function() {
		try {
			await globalProvider.value.send('eth_requestAccounts', []);
			if(globalProvider.value != null && window.localStorage.getItem('currentAccount') == null) {
				window.localStorage.setItem('currentAccount', await globalProvider.value.getSigner().getAddress());
				currentAccount.value = window.localStorage.getItem('currentAccount');
				console.log(await globalProvider.value.getSigner().getAddress());
			}
		} catch(error) {
			console.log(error);
		}
	};

	const disconnectWallet = async function() {
		try {
			setListeners(false);
			currentAccount.value = null;
		} catch(error) {
			console.log(error);
		}
	};

	async function getPrice() {
		const provider = new ethers.providers.JsonRpcProvider(config.public.testnetRPCProvider);
		const priceFeed = new ethers.Contract(
			config.public.avaxPriceFeedTestnet, // dirección del contrato Chainlink Price Feed para AVAX/USD
			[
				'function latestRoundData() view returns (uint80, int256, uint256, uint256, uint80)',
			],
			provider,
		);

		const [ roundId, price, startedAt, updatedAt, answeredInRound ] = await priceFeed.latestRoundData();
		console.log(price / (10 ** 8));

		return price / (10 ** 8);
	}



	return {
		globalProvider,
		currentAccount,
		currentAccountTrimmed,
		connectWallet,
		disconnectWallet,
		initProvider,
		etherToWei,
		weiToEther,
		getPrice,
		mintNfts,
	};
};
