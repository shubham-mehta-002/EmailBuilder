function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">Email Builder</h1>
            </div>
          </div>
          <div className="flex items-center"></div>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="h-10 ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Logout
            </button>
          </div>
          
        </div>
    </nav>
  )
}




export default Navbar 