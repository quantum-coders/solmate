export default defineNuxtPlugin((nuxtApp) => {

    // Get env variables
    const config = useRuntimeConfig();

    /** create a new instance of $fetcher with custom option */
    const apiFetcher = $fetch.create({ baseURL: config.public.baseURL })

    return {
        provide: {
            api: apiFetcher,
        },
    };
});
