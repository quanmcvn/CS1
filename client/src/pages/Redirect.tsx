// src/components/Redirect.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOriginalUrl } from '@service/urlShortenerService';

const Redirect = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const fetchUrl = async () => {
			try {
				const response = await getOriginalUrl(id ?? "");
				
				if (response) {
					setTimeout(() => {
						window.location.href = response;
					}, 2000);
				} else {
					setError('URL not found');
				}
			} catch (err) {
				console.log(err);
				navigate('/not-found');
			} finally {
				setLoading(false);
			}
		};

		fetchUrl();
	}, [id, navigate]);

	if (loading) return <div>Loading...</div>;
	if (error) return <div>{error}</div>;

	return <div>Redirecting...</div>;
};

export default Redirect;