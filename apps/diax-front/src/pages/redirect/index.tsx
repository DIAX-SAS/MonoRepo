import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const RedirectPage = () => {  
  
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (code && state) {
            window.location.replace('/dashboard');
        } else {
            window.location.replace('/');
        }
    }, []);

    return null;
};

export default RedirectPage;
