"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Header;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
function Header({ darkMode, onToggleDarkMode }) {
    return (<header className="glass border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"/>
            <input type="text" placeholder="Search bases, jobs, or metrics..." className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"/>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <lucide_react_1.Bell className="w-5 h-5"/>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Dark mode toggle */}
          <button onClick={onToggleDarkMode} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            {darkMode ? <lucide_react_1.Sun className="w-5 h-5"/> : <lucide_react_1.Moon className="w-5 h-5"/>}
          </button>

          {/* User menu */}
          <button className="flex items-center space-x-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <lucide_react_1.User className="w-5 h-5"/>
            <span className="text-sm font-medium hidden sm:block">Admin</span>
          </button>
        </div>
      </div>
    </header>);
}
//# sourceMappingURL=Header.js.map