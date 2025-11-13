export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-linear-to-tr from-cyan-600 to-blue-600 flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="text-lg font-semibold text-gray-800">VideoGen</span>
        </div>
        <button className="bg-cyan-600 text-white px-5 py-2 rounded-md">
          Login
        </button>
      </div>
    </nav>
  );
}
