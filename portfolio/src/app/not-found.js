export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center px-8 pt-24">
            <h1 className="text-3xl md:text-5xl font-bold font-heading">404</h1>
            <h2 className="text-xl md:text-2xl font-medium font-description text-center">OOPs! You've encountered an unwanted page.</h2>
            <a href="/" className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition">
                Take Me Home
            </a>
        </div>
    )
  };
  