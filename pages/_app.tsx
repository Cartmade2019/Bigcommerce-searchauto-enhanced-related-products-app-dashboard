import { AlertsManager, Box, GlobalStyles, createAlertsManager } from '@bigcommerce/big-design';
import { theme as defaultTheme } from '@bigcommerce/big-design-theme';
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'styled-components';
import Header from '../components/header';
import SessionProvider from '../context/session';
import { useRouter } from 'next/router';

export const alertsManager = createAlertsManager();

const MyApp = ({ Component, pageProps }: AppProps) => {
    const router = useRouter();
    const isProductPage = router.pathname.startsWith('/related-products/products');

    return (
        <ThemeProvider theme={defaultTheme}>
            <GlobalStyles />
            <AlertsManager manager={alertsManager} />
            <Box
                marginHorizontal={{ mobile: 'none', tablet: 'xxxLarge' }}
                marginVertical={{ mobile: 'none', tablet: "xxLarge" }}
            >
                {!isProductPage && <Header />}
                {isProductPage ? (
                    <Component {...pageProps} />
                ) : (
                    <SessionProvider>
                        <Component {...pageProps} />
                    </SessionProvider>
                )}
            </Box>
        </ThemeProvider>
    );
};

export default MyApp;
