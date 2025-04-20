import Home from "@pages/Home";
import Redirect from "@pages/Redirect";
import NotFound from "@pages/NotFound";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import "./App.css"

const router = createBrowserRouter([
	{
		path: '/',
		element: <Home />,
	},
	{
		path: '/not-found',
		element: <NotFound />,
	},
	{
		path: '/:id',
		element: <Redirect />,
	},
]);


export default function App() {
	return (
		<RouterProvider router={router} />
	)
}
